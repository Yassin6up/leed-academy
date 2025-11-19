import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  const claims = tokens.claims() || {};
  user.claims = claims;
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  // Prefer claims.exp, fallback to tokens.expires_at or calculate from expires_in
  user.expires_at = claims?.exp || 
    (tokens as any).expires_at || 
    (tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : undefined);
  return user;
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function upsertUser(claims: any, referredByCode?: string) {
  const existingUser = await storage.getUserByEmail(claims["email"]);
  
  let referralCode = existingUser?.referralCode;
  if (!referralCode) {
    let isUnique = false;
    while (!isUnique) {
      referralCode = generateReferralCode();
      const existing = await storage.getUserByReferralCode(referralCode);
      if (!existing) isUnique = true;
    }
  }

  return await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    referralCode,
    referredBy: existingUser ? existingUser.referredBy : (referredByCode || null),
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify = async (
    req: any,
    tokenSet: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    userInfo: any,
    done: passport.AuthenticateCallback
  ) => {
    try {
      // Check for referral intent in session
      const referralIntent = req?.session?.referralIntent;
      
      // Prefer userInfo for richer profile data, fallback to claims
      const claims = tokenSet.claims();
      const userData = {
        sub: userInfo?.sub || claims?.sub,
        email: userInfo?.email || claims?.email,
        first_name: userInfo?.first_name || claims?.first_name,
        last_name: userInfo?.last_name || claims?.last_name,
        profile_image_url: userInfo?.profile_image_url || claims?.profile_image_url,
      };
      
      // Await upsertUser and capture the persisted user
      const persistedUser = await upsertUser(userData, referralIntent);
      
      // Merge persisted profile with token metadata
      const user = updateUserSession({ ...persistedUser }, tokenSet);
      
      // Clear referral intent only after successful persistence
      if (req?.session?.referralIntent) {
        delete req.session.referralIntent;
      }
      
      // Pass merged user object to done so req.user has both profile and token data
      done(null, user);
    } catch (error) {
      console.error("Error in OIDC verify callback:", error);
      done(error as Error);
    }
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
          passReqToCallback: true,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
};

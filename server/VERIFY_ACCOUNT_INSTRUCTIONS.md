# How to Verify Your Existing Account

## Quick Instructions

### Option 1: Using pgAdmin or PostgreSQL GUI
1. Open pgAdmin or your PostgreSQL client
2. Connect to your `leedaca` database
3. Open the Query Tool
4. Copy and paste this command (replace the email):

```sql
UPDATE users 
SET is_verified = true, 
    verification_token = NULL 
WHERE email = 'your-email@example.com';
```

5. Click Execute/Run
6. You should see "UPDATE 1" if successful

### Option 2: Using Command Line (psql)
1. Open your terminal/command prompt
2. Connect to your database:
```bash
psql -U postgres -d leedaca
```

3. Run this command (replace the email):
```sql
UPDATE users SET is_verified = true, verification_token = NULL WHERE email = 'your-email@example.com';
```

4. Type `\q` to exit psql

### Verify It Worked
After running the command, try logging in. You should now be able to access your account without any verification errors.

## What Happens Now

From now on, when any unverified user tries to login:
1. A new verification token will be generated
2. A new verification email will be sent automatically
3. The user will see a message: "A new verification link has been sent to your email"
4. They can click the link in their email to verify their account

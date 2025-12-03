--
-- PostgreSQL database dump
--

\restrict jmkJV3g1RDJRIBiWiKJbRQwXMfFebko4wherRBtGBvIGt3BxOoIl9iD8B6gOGcs

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg13+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.testimonials DROP CONSTRAINT IF EXISTS testimonials_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_subscription_plans_id_fk;
ALTER TABLE IF EXISTS ONLY public.referral_transactions DROP CONSTRAINT IF EXISTS referral_transactions_referrer_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.referral_transactions DROP CONSTRAINT IF EXISTS referral_transactions_referred_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_lesson_id_lessons_id_fk;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_subscription_id_subscriptions_id_fk;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_reviewed_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_plan_id_subscription_plans_id_fk;
ALTER TABLE IF EXISTS ONLY public.meetings DROP CONSTRAINT IF EXISTS meetings_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS courses_required_plan_id_subscription_plans_id_fk;
ALTER TABLE IF EXISTS ONLY public.course_resources DROP CONSTRAINT IF EXISTS course_resources_course_id_courses_id_fk;
ALTER TABLE IF EXISTS ONLY public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_users_id_fk;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_referral_code_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_unique;
ALTER TABLE IF EXISTS ONLY public.testimonials DROP CONSTRAINT IF EXISTS testimonials_pkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_key_unique;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.referral_transactions DROP CONSTRAINT IF EXISTS referral_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.progress DROP CONSTRAINT IF EXISTS progress_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_settings DROP CONSTRAINT IF EXISTS payment_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.meetings DROP CONSTRAINT IF EXISTS meetings_pkey;
ALTER TABLE IF EXISTS ONLY public.lessons DROP CONSTRAINT IF EXISTS lessons_pkey;
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS courses_pkey;
ALTER TABLE IF EXISTS ONLY public.course_resources DROP CONSTRAINT IF EXISTS course_resources_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_logs DROP CONSTRAINT IF EXISTS admin_logs_pkey;
DROP TABLE IF EXISTS public.withdrawal_requests;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.testimonials;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.subscription_plans;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.referral_transactions;
DROP TABLE IF EXISTS public.progress;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.payment_settings;
DROP TABLE IF EXISTS public.meetings;
DROP TABLE IF EXISTS public.lessons;
DROP TABLE IF EXISTS public.courses;
DROP TABLE IF EXISTS public.course_resources;
DROP TABLE IF EXISTS public.admin_logs;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    admin_id character varying NOT NULL,
    admin_name character varying(255) NOT NULL,
    admin_email character varying(255) NOT NULL,
    action character varying(100) NOT NULL,
    page character varying(100) NOT NULL,
    description text,
    details jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: course_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_resources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    course_id character varying NOT NULL,
    title_en character varying NOT NULL,
    title_ar character varying NOT NULL,
    description_en text,
    description_ar text,
    file_url character varying NOT NULL,
    file_name character varying NOT NULL,
    file_type character varying NOT NULL,
    file_size integer,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title_en character varying NOT NULL,
    title_ar character varying NOT NULL,
    description_en text,
    description_ar text,
    level integer NOT NULL,
    price numeric(10,2) DEFAULT '0'::numeric,
    is_free boolean DEFAULT false,
    required_plan_id character varying,
    thumbnail_url character varying,
    instructor_en character varying,
    instructor_ar character varying,
    duration integer,
    language character varying DEFAULT 'en'::character varying,
    views_count integer DEFAULT 0,
    has_certificate boolean DEFAULT false,
    is_published boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    course_id character varying NOT NULL,
    title_en character varying NOT NULL,
    title_ar character varying NOT NULL,
    description_en text,
    description_ar text,
    video_url character varying,
    video_file_path character varying,
    thumbnail_url character varying,
    duration integer,
    "order" integer NOT NULL,
    requires_previous boolean DEFAULT true,
    is_free boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meetings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    course_id character varying,
    title_en character varying NOT NULL,
    title_ar character varying NOT NULL,
    description_en text,
    description_ar text,
    scheduled_at timestamp without time zone NOT NULL,
    zoom_link character varying NOT NULL,
    duration integer NOT NULL,
    is_paid_only boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: payment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    bank_name character varying,
    account_number character varying,
    account_holder_name character varying,
    iban character varying,
    swift_code character varying,
    bank_address text,
    btc_address character varying,
    eth_address character varying,
    usdt_address character varying,
    usdt_network character varying DEFAULT 'TRC20'::character varying,
    payment_instructions_en text,
    payment_instructions_ar text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    user_name character varying,
    user_email character varying,
    subscription_id character varying,
    plan_id character varying,
    amount numeric(10,2) NOT NULL,
    method character varying(20) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    proof_image_url character varying,
    wallet_address character varying,
    transaction_hash character varying,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    admin_notes text,
    reviewed_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.progress (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    lesson_id character varying NOT NULL,
    course_id character varying NOT NULL,
    completed boolean DEFAULT false,
    watch_progress integer DEFAULT 0,
    completed_at timestamp without time zone,
    last_accessed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: referral_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referral_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    referrer_id character varying NOT NULL,
    referred_user_id character varying NOT NULL,
    amount numeric(10,2) DEFAULT '10'::numeric NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key character varying NOT NULL,
    value text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name_en character varying NOT NULL,
    name_ar character varying NOT NULL,
    description_en text,
    description_ar text,
    price numeric(10,2) NOT NULL,
    duration_days integer NOT NULL,
    features_en text[],
    features_ar text[],
    is_popular boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name_en character varying NOT NULL,
    name_ar character varying NOT NULL,
    role_en character varying,
    role_ar character varying,
    content_en text NOT NULL,
    content_ar text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    image_url character varying,
    user_id character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    phone character varying,
    profile_image_url character varying,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    subscription_status character varying(20) DEFAULT 'none'::character varying,
    is_active boolean DEFAULT true NOT NULL,
    referral_code character varying(8),
    referred_by character varying(8),
    referral_count integer DEFAULT 0,
    referral_earnings numeric(10,2) DEFAULT '0'::numeric,
    is_verified boolean DEFAULT false,
    verification_token character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawal_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    wallet_address character varying NOT NULL,
    chain character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now(),
    approved_at timestamp without time zone
);


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_logs (id, admin_id, admin_name, admin_email, action, page, description, details, created_at) FROM stdin;
\.


--
-- Data for Name: course_resources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.course_resources (id, course_id, title_en, title_ar, description_en, description_ar, file_url, file_name, file_type, file_size, "order", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, title_en, title_ar, description_en, description_ar, level, price, is_free, required_plan_id, thumbnail_url, instructor_en, instructor_ar, duration, language, views_count, has_certificate, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lessons (id, course_id, title_en, title_ar, description_en, description_ar, video_url, video_file_path, thumbnail_url, duration, "order", requires_previous, is_free, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meetings (id, course_id, title_en, title_ar, description_en, description_ar, scheduled_at, zoom_link, duration, is_paid_only, created_at) FROM stdin;
\.


--
-- Data for Name: payment_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_settings (id, bank_name, account_number, account_holder_name, iban, swift_code, bank_address, btc_address, eth_address, usdt_address, usdt_network, payment_instructions_en, payment_instructions_ar, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, user_id, user_name, user_email, subscription_id, plan_id, amount, method, currency, proof_image_url, wallet_address, transaction_hash, status, admin_notes, reviewed_by, created_at, reviewed_at, updated_at) FROM stdin;
297c2943-35fd-473e-bf50-62763b38ee4e	5918974a-41bb-4db3-8d25-8947b6caff0f	Yassine ait el hardouf	lahouirichfatima@gmail.com	\N	aaf738da-9037-41e1-a6c0-2b41063fd44f	199.99	crypto	USD	/uploads/0b006869-dbf1-473e-8e73-a4f7a67ebb02.png	\N	\N	approved	\N	\N	2025-11-30 20:14:18.120541	\N	2025-11-30 20:14:18.120541
e82530b2-6625-4150-80ce-225c0c25cdc3	8c07584e-a5fa-4e8d-a6b5-8454fd749014	Yassine ait el hardouf	yassinkokabi4@gmail.com	\N	95917c74-f4c6-4ed7-a066-0bcaeafd5b6f	99.99	card	USD	\N	\N	\N	pending	\N	\N	2025-12-03 16:48:08.803913	\N	2025-12-03 16:48:08.803913
\.


--
-- Data for Name: progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.progress (id, user_id, lesson_id, course_id, completed, watch_progress, completed_at, last_accessed_at, created_at) FROM stdin;
\.


--
-- Data for Name: referral_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.referral_transactions (id, referrer_id, referred_user_id, amount, status, created_at) FROM stdin;
5584c2f1-c9dd-4e68-aa93-837d1ca5b161	8c07584e-a5fa-4e8d-a6b5-8454fd749014	5918974a-41bb-4db3-8d25-8947b6caff0f	20.00	completed	2025-11-30 20:15:02.922707
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value, updated_at) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name_en, name_ar, description_en, description_ar, price, duration_days, features_en, features_ar, is_popular, created_at) FROM stdin;
f38f209a-9f6b-46f4-851f-8b237806b45d	Basic Plan	الخطة الأساسية	Perfect for beginners starting their trading journey	مثالية للمبتدئين الذين يبدأون رحلتهم في التداول	49.99	30	{"Access to basic courses","Community chat access","Weekly market analysis","Email support"}	{"الوصول إلى الدورات الأساسية","الوصول إلى المحادثة المجتمعية","تحليل السوق الأسبوعي","دعم عبر البريد الإلكتروني"}	f	2025-11-30 19:56:58.423324
95917c74-f4c6-4ed7-a066-0bcaeafd5b6f	Pro Plan	الخطة الاحترافية	Most popular choice for serious traders	الخيار الأكثر شعبية للمتداولين الجادين	99.99	30	{"Access to all courses","Priority community access","Daily market analysis","Live trading sessions","1-on-1 mentorship (monthly)","Priority support"}	{"الوصول إلى جميع الدورات","الأولوية في الوصول إلى المجتمع","تحليل السوق اليومي","جلسات تداول مباشرة","إرشاد فردي (شهري)","دعم ذو أولوية"}	t	2025-11-30 19:56:58.524685
aaf738da-9037-41e1-a6c0-2b41063fd44f	Premium Plan	الخطة المميزة	Ultimate package for professional traders	الحزمة النهائية للمتداولين المحترفين	199.99	30	{"All Pro Plan features","Advanced trading strategies","Real-time trade alerts","Private Discord channel","Weekly 1-on-1 coaching","Lifetime access to materials","24/7 Priority support"}	{"جميع ميزات الخطة الاحترافية","استراتيجيات التداول المتقدمة","تنبيهات التداول في الوقت الفعلي","قناة Discord خاصة","تدريب فردي أسبوعي","وصول مدى الحياة إلى المواد","دعم ذو أولوية 24/7"}	f	2025-11-30 19:56:58.643059
c546fe7e-fc6b-439a-a81d-c243a1a942f2	Annual Pro	برو السنوي	Best value - Save 20% with annual billing	أفضل قيمة - وفر 20% مع الفوترة السنوية	959.99	365	{"All Pro Plan features","2 months free","Annual strategy review","Exclusive webinars"}	{"جميع ميزات الخطة الاحترافية","شهرين مجاناً","مراجعة الاستراتيجية السنوية","ندوات حصرية عبر الإنترنت"}	f	2025-11-30 19:56:58.73893
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, user_id, plan_id, status, start_date, end_date, created_at) FROM stdin;
bf5e09cc-fc89-4dd5-97ff-f30a2a384deb	5918974a-41bb-4db3-8d25-8947b6caff0f	aaf738da-9037-41e1-a6c0-2b41063fd44f	active	2025-11-30 20:14:18.019	2025-12-30 20:14:18.019	2025-11-30 20:14:18.021512
c6d56d9d-b288-4fdd-83d7-560bbed0c30f	8c07584e-a5fa-4e8d-a6b5-8454fd749014	95917c74-f4c6-4ed7-a066-0bcaeafd5b6f	pending	2025-12-03 16:48:08.701	2026-01-02 16:48:08.701	2025-12-03 16:48:08.706019
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, name_en, name_ar, role_en, role_ar, content_en, content_ar, rating, image_url, user_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, first_name, last_name, phone, profile_image_url, role, subscription_status, is_active, referral_code, referred_by, referral_count, referral_earnings, is_verified, verification_token, created_at, updated_at) FROM stdin;
67e2ab66-5320-4c9d-a5d4-c382923da407	contactmeyassin@gmail.com	$2b$10$eFRYoUfeYZOyxwNZFifB1.j55q/Pu460chcsvvw9dFx50njNPfKJO	Yassine	ait el hardouf	0687802700	\N	user	none	t	KY7NM73R	\N	10	100.00	t	\N	2025-11-30 19:29:25.958585	2025-11-30 19:39:31.371
ba4cf1bf-13df-43a6-a878-7814ce471d5d	admin@leedacademya.com	$2b$10$/B2vyMq2Iy3uWvpoeS/dSuGGQj8DLV2LyRGXjYf/JqNZCTElPQhWK	Admin	User	+966500000000	\N	admin	active	t	1DFB91E0	\N	0	0.00	t	\N	2025-11-30 19:56:58.292769	2025-11-30 19:56:58.292769
5918974a-41bb-4db3-8d25-8947b6caff0f	lahouirichfatima@gmail.com	$2b$10$bnQkcTmwZ0eJyqgh2h/A2O6deuuhYlowGX3HAE.1vyKDjPkM9Fm7i	Yassine	ait el hardouf	0687802700	\N	user	active	t	3JBPPWYJ	A6JEZ68D	0	0.00	t	\N	2025-11-30 20:13:26.755012	2025-11-30 20:15:02.736
8c07584e-a5fa-4e8d-a6b5-8454fd749014	yassinkokabi4@gmail.com	$2b$10$X6mNpPgZDILoQIwg7Kt7ou8SGPF/uJqHLltA8kqXmZrfFpcRLG0TK	Yassine	ait el hardouf	0687802700	\N	user	none	t	A6JEZ68D	\N	1	20.00	t	\N	2025-11-30 19:14:18.395636	2025-11-30 20:10:15.283
\.


--
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdrawal_requests (id, user_id, amount, wallet_address, chain, status, admin_notes, created_at, approved_at) FROM stdin;
\.


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: course_resources course_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_resources
    ADD CONSTRAINT course_resources_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: payment_settings payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: progress progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_pkey PRIMARY KEY (id);


--
-- Name: referral_transactions referral_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_transactions
    ADD CONSTRAINT referral_transactions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_referral_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referral_code_unique UNIQUE (referral_code);


--
-- Name: withdrawal_requests withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: admin_logs admin_logs_admin_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_users_id_fk FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: course_resources course_resources_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_resources
    ADD CONSTRAINT course_resources_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_required_plan_id_subscription_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_required_plan_id_subscription_plans_id_fk FOREIGN KEY (required_plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: lessons lessons_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: meetings meetings_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: payments payments_plan_id_subscription_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_plan_id_subscription_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: payments payments_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: payments payments_subscription_id_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: payments payments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: progress progress_course_id_courses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_course_id_courses_id_fk FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: progress progress_lesson_id_lessons_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_lesson_id_lessons_id_fk FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: progress progress_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.progress
    ADD CONSTRAINT progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: referral_transactions referral_transactions_referred_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_transactions
    ADD CONSTRAINT referral_transactions_referred_user_id_users_id_fk FOREIGN KEY (referred_user_id) REFERENCES public.users(id);


--
-- Name: referral_transactions referral_transactions_referrer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referral_transactions
    ADD CONSTRAINT referral_transactions_referrer_id_users_id_fk FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: subscriptions subscriptions_plan_id_subscription_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_subscription_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: subscriptions subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: testimonials testimonials_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: withdrawal_requests withdrawal_requests_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict jmkJV3g1RDJRIBiWiKJbRQwXMfFebko4wherRBtGBvIGt3BxOoIl9iD8B6gOGcs


-- Migration: Add card payment and mobile wallet support to payment_settings
-- Add new columns for card payments
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS card_processor_name VARCHAR;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS card_instructions_en TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS card_instructions_ar TEXT;

-- Add new columns for Egyptian mobile wallets
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS vodafone_cash_number VARCHAR;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS orange_money_number VARCHAR;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS etisalat_cash_number VARCHAR;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS we_pay_number VARCHAR;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS instapay_number VARCHAR;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS mobile_wallet_instructions_en TEXT;
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS mobile_wallet_instructions_ar TEXT;

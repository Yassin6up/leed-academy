# Payment Methods Update

## Summary
Added support for card payments (Visa/Mastercard) and Egyptian mobile wallets to the subscription payment system.

## New Payment Methods

### 1. Card Payments (Visa/Mastercard)
- Credit and debit card support
- Configurable payment processor name (e.g., Stripe, PayPal, Fawry, Paymob)
- Custom instructions in English and Arabic
- Transaction ID/Reference number field for verification

### 2. Egyptian Mobile Wallets
- **Vodafone Cash** - Most popular mobile wallet in Egypt
- **Orange Money** - Orange's mobile payment service
- **Etisalat Cash** - Etisalat's mobile payment service
- **WE Pay** - WE's mobile payment service
- **InstaPay** - Egyptian instant payment system
- Sender phone number field for verification
- Custom instructions in English and Arabic

## Files Modified

### 1. Database Schema (`shared/schema.ts`)
Added new fields to `paymentSettings` table:
- `cardProcessorName` - Name of the card payment processor
- `cardInstructionsEn` - Card payment instructions in English
- `cardInstructionsAr` - Card payment instructions in Arabic
- `vodafoneCashNumber` - Vodafone Cash number
- `orangeMoneyNumber` - Orange Money number
- `etisalatCashNumber` - Etisalat Cash number
- `wePayNumber` - WE Pay number
- `instapayNumber` - InstaPay username/number
- `mobileWalletInstructionsEn` - Mobile wallet instructions in English
- `mobileWalletInstructionsAr` - Mobile wallet instructions in Arabic

### 2. Database Migration (`migrations/0001_add_payment_methods.sql`)
Created SQL migration to add the new columns to the `payment_settings` table.

### 3. Subscribe Page (`client/src/pages/Subscribe.tsx`)
- Added `CreditCard` and `Smartphone` icons from lucide-react
- Extended payment method type to include `"card"` and `"mobile_wallet"`
- Added card payment UI section with:
  - Visual card icons (Visa/Mastercard)
  - Payment processor name display
  - Custom instructions
  - Transaction ID input field
- Added mobile wallet UI section with:
  - All 5 Egyptian wallet options
  - Copy buttons for each wallet number
  - Visual icons for each wallet
  - Sender phone number input field
  - Custom instructions

### 4. Admin Settings Page (`client/src/pages/admin/AdminSettings.tsx`)
- Updated `paymentSettingsSchema` to include all new fields
- Updated form default values
- Added "Card Payment Settings" section with:
  - Payment processor name input
  - Instructions in English and Arabic
- Added "Egyptian Mobile Wallets" section with:
  - Input fields for all 5 wallet types
  - Instructions in English and Arabic

## Next Steps

### 1. Run Database Migration
```bash
# Apply the migration to your database
psql -d your_database -f migrations/0001_add_payment_methods.sql
```

Or if using a migration tool, add the migration to your migration system.

### 2. Configure Payment Methods in Admin Panel
1. Log in as admin
2. Go to Admin → Settings
3. Scroll to "Card Payment Settings" section
4. Enter your payment processor name (e.g., "Fawry", "Paymob")
5. Add instructions for users
6. Scroll to "Egyptian Mobile Wallets" section
7. Enter your mobile wallet numbers
8. Add instructions for users
9. Click "Save Settings"

### 3. Test the Flow
1. Navigate to a subscription plan
2. Click subscribe
3. Test all payment methods:
   - Crypto (existing)
   - Card (new)
   - Mobile Wallet (new)
   - Bank Transfer (existing)
4. Upload payment proof
5. Verify admin can review payments

## Features

### User Experience
- ✅ Multiple payment options for Egyptian users
- ✅ Easy copy-paste of wallet numbers
- ✅ Clear instructions in both languages
- ✅ Visual icons for each payment method
- ✅ Transaction verification fields

### Admin Experience
- ✅ Easy configuration through admin panel
- ✅ Support for multiple wallet providers
- ✅ Custom instructions per payment type
- ✅ All settings in one place

## Technical Notes

- Payment methods are manually verified (upload proof required)
- No automatic integration with payment gateways
- Admin reviews and approves all payments
- Transaction IDs and phone numbers help with verification
- All payment data stored in existing `payments` table

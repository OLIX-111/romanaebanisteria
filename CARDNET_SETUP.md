# CardNet Payment Integration Setup

## Overview

This implementation integrates CardNet payment gateway with your Next.js application using the API Consulta method. It includes:

- Session creation with 3DS authentication
- Secure payment processing
- Order confirmation and email notifications
- Support for both LAB and PRODUCTION environments

## Environment Variables

Add these variables to your `.env.local` file:

```env
# CardNet Environment Configuration
CARDNET_ENV=lab  # Change to 'prod' for production

# LAB Environment (for testing)
CARDNET_LAB_BASE_URL=https://lab.cardnet.com.do
CARDNET_LAB_MERCHANT_NUMBER=349000000
CARDNET_LAB_TERMINAL_ID=58585858
CARDNET_LAB_MERCHANT_TYPE=7997
CARDNET_LAB_ACQUIRER=349

# PRODUCTION Environment (get these from CardNet)
CARDNET_PROD_BASE_URL=https://ecommerce.cardnet.com.do
CARDNET_PROD_MERCHANT_NUMBER=YOUR_MERCHANT_NUMBER
CARDNET_PROD_TERMINAL_ID=YOUR_TERMINAL_ID
CARDNET_PROD_MERCHANT_TYPE=YOUR_MERCHANT_TYPE
CARDNET_PROD_ACQUIRER=349

# Currency and Language
CARDNET_CURRENCY=214          # 214 for DOP, 840 for USD
CARDNET_PAGE_LANG=ESP         # ESP for Spanish, ENG for English

# Merchant Information
CARDNET_MERCHANT_OWNER="ROMANA EBANISTERIA SRL"
CARDNET_MERCHANT_CITY="LA ROMANA"
CARDNET_MERCHANT_STATE="   "  # 3 characters
CARDNET_MERCHANT_COUNTRY="DO" # 2-character country code

# Public URLs (replace with your domain)
PUBLIC_BASE_URL=http://localhost:3000
CARDNET_RETURN_URL=${PUBLIC_BASE_URL}/api/payments/cardnet/return
CARDNET_CANCEL_URL=${PUBLIC_BASE_URL}/api/payments/cardnet/return?type=cancelled

# For local development:
# PUBLIC_BASE_URL=http://localhost:3000
```

## Testing with LAB Environment

### Test Cards

Use these test cards in the LAB environment:

- **Visa**: 4761 3400 0000 0035
- **MasterCard**: 5461 3400 0000 2700
- **CVV**: Any 3-digit number
- **Expiry**: Any future date

### Test Flow

1. Set `CARDNET_ENV=lab` in your environment
2. Go to `/store/checkout` with items in cart
3. Fill out customer information
4. Select "Pagar con tarjeta ahora"
5. Click "Pagar ahora" - you'll be redirected to CardNet's test gateway
6. Use test card details
7. Complete the payment
8. You'll return to `/notify/success` with transaction details

## Production Deployment

1. **Get Production Credentials**: Contact CardNet to get your production merchant credentials
2. **Update Environment**: Set production values in your environment variables
3. **Switch Environment**: Change `CARDNET_ENV=prod`
4. **Test**: Perform a small real transaction (RD$1.00) to verify
5. **Go Live**: Enable for customers

## API Endpoints

### Created Endpoints

- `POST /api/payments/cardnet/session` - Creates payment session
- `GET /api/payments/cardnet/status` - Verifies payment status  
- `POST /api/payments/process-order` - Processes successful orders
- `GET /notify/success` - Payment success page
- `GET /notify/cancelled` - Payment cancelled page

## Security Features

- ✅ 3DS authentication mandatory (v1.2 compliant)
- ✅ TLS 1.2+ encryption
- ✅ Session keys never exposed to client
- ✅ Server-side amount validation
- ✅ Idempotent transaction processing
- ✅ Timeout protection on API calls
- ✅ Input sanitization and validation
- ✅ Dominican province code mapping
- ✅ Phone number formatting for CardNet

## 3DS Data Requirements

CardNet requires ALL these 3DS fields in exact format:

### Mandatory Fields
- `3DS_email`: Valid email address
- `3DS_mobilePhone`: 10-15 digit phone (e.g., "18298062770")
- `3DS_workPhone`: Work phone (fallback to mobile if not provided)
- `3DS_homePhone`: Home phone (fallback to mobile if not provided)
- `3DS_billAddr_line1`: Billing address line 1 (UPPERCASE, max 50 chars)
- `3DS_billAddr_line2`: Billing address line 2 (can be empty)
- `3DS_billAddr_line3`: Billing address line 3 (often repeat of line1)
- `3DS_billAddr_city`: Billing city (UPPERCASE, max 50 chars)
- `3DS_billAddr_state`: Province code (2 digits, e.g., "25" for Santiago)
- `3DS_billAddr_country`: Country code ("214" for Dominican Republic)
- `3DS_billAddr_postcode`: Postal code (e.g., "51000")

### Shipping Fields (usually same as billing)
- `3DS_shipAddr_line1`: Shipping address line 1
- `3DS_shipAddr_line2`: Shipping address line 2
- `3DS_shipAddr_line3`: Shipping address line 3
- `3DS_shipAddr_city`: Shipping city
- `3DS_shipAddr_state`: Shipping province code
- `3DS_shipAddr_country`: Shipping country code
- `3DS_shipAddr_postcode`: Shipping postal code

### Province Codes
- Distrito Nacional: "01"
- Santo Domingo: "32"  
- Santiago: "25"
- La Romana: "12"
- Puerto Plata: "18"
- (See `/debug/3ds-format` for complete mapping)

## Payment Flow

1. **Customer fills checkout form** → Required for 3DS data
2. **Session creation** → POST to CardNet with 3DS info
3. **Gateway redirect** → Auto-POST to CardNet payment page
4. **Customer pays** → Enters card details on CardNet
5. **Return handling** → CardNet redirects back with SESSION
6. **Status verification** → Verify payment result via API
7. **Order processing** → Send confirmations, clear cart

## Response Codes

- `00` - Approved ✅
- `04`, `05`, `07` - Declined ❌  
- `33` - Card expired ❌
- `51` - Insufficient funds ❌
- `TF` - 3DS authentication failed ❌
- `94` - Duplicate transaction ❌

## Troubleshooting

### Common Issues

1. **Session not found (404)**
   - Sessions expire after 30 minutes
   - Create new session and retry

2. **3DS validation errors**
   - Ensure all required 3DS fields are provided
   - Phone numbers should be numeric only
   - Addresses should not exceed field limits

3. **Amount formatting errors**
   - Amounts must be in minor units (centavos)
   - 12-digit zero-padded format required

4. **Merchant configuration errors**
   - Verify merchant credentials with CardNet
   - Ensure terminal IDs are correct
   - Check environment settings

### Logs

Check your application logs for:
- `[CardNet]` prefixed messages for payment flow
- `[Order]` prefixed messages for order processing
- Error details and response codes

## Support

For CardNet-specific issues, contact CardNet support with:
- Your merchant number
- Transaction ID or session ID
- Timestamp of the issue
- Response codes received

For implementation issues, check:
- Environment variable configuration
- Network connectivity to CardNet endpoints
- TLS 1.2+ support in your hosting environment

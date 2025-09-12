# Stripe Integration Guide

This guide explains how to set up and use the Stripe payment integration in the application.

## Prerequisites

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Node.js and npm installed
3. Basic understanding of React and Express

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in the root directory with your Stripe publishable key:
```env
VITE_STRIPE_PUBLIC_KEY=your_publishable_key_here
```

Create a `.env` file in the `server` directory with your Stripe secret key:
```env
STRIPE_SECRET_KEY=your_stripe_secret_key_here
PORT=3001
```

### 2. Install Dependencies

Install both frontend and server dependencies:
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install express cors stripe dotenv
cd ..
```

### 3. Start the Application

Run both the frontend and server concurrently:
```bash
# Install concurrently if you haven't already
npm install -g concurrently

# Start both frontend and backend
npm run dev:all
```

Or start them separately in different terminals:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
node index.js
```

## Testing the Payment Flow

1. Navigate to the order test page at `/order-test`
2. Fill out the order form with test data
3. Click "Proceed to Payment"
4. Use Stripe's test card numbers for payment:
   - Card number: 4242 4242 4242 4242
   - Any future date for expiry
   - Any 3 digits for CVC
   - Any postal code
5. Click "Pay Now" and wait for the confirmation

## Security Notes

- Never commit your Stripe secret keys to version control
- Use environment variables to store sensitive information
- In production, use HTTPS and implement proper authentication
- Follow Stripe's security best practices: https://stripe.com/docs/security

## Troubleshooting

- **Payment fails with "No such payment_intent"**: Ensure your server is running and the Stripe secret key is correct
- **CORS errors**: Make sure the frontend URL is whitelisted in the CORS configuration
- **Stripe elements not loading**: Verify your publishable key is correct and internet connection is stable

## Going to Production

1. Replace test API keys with live keys
2. Configure your Stripe webhook for payment confirmation
3. Set up proper error handling and logging
4. Implement order confirmation emails
5. Set up monitoring and alerts

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Elements](https://stripe.com/docs/stripe-js/react)
- [Stripe Testing](https://stripe.com/docs/testing)

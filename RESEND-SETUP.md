# Resend Email Setup Guide

This guide explains how to set up Resend for sending invoice emails from VecHorses.

## Quick Start

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (no credit card required)
3. Free tier includes 3,000 emails/month

### 2. Get API Key

1. Log in to Resend dashboard
2. Go to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name like "vechorses-production"
5. Copy the API key (starts with `re_`)

### 3. Add to Environment Variables

Add the API key to your environment:

**Local Development (.env.local):**
```bash
RESEND_API_KEY=re_your_api_key_here
```

**Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `RESEND_API_KEY` with your key
4. Redeploy the application

### 4. Domain Setup (Optional but Recommended)

For production, configure a custom domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `vechorses.com`)
4. Add the DNS records Resend provides:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)

Once verified, emails will be sent from `invoices@yourdomain.com` instead of `@resend.dev`.

## Testing Without Resend

If you don't have a Resend API key configured:

1. Set `RESEND_API_KEY=test` in your environment
2. Emails will be logged to the console instead of sent
3. The API will return success with `testMode: true`

## API Usage

### Send Invoice Email

```bash
POST /api/send-invoice
Content-Type: application/json

{
  "invoiceId": "uuid-of-invoice",
  "recipientEmail": "client@example.com",
  "stableId": "uuid-of-stable",
  "testMode": false,
  "sendCopyToSelf": true,
  "selfEmail": "you@stable.com",
  "markAsSent": true
}
```

**Response:**
```json
{
  "success": true,
  "sentTo": "client@example.com",
  "copySentTo": "you@stable.com"
}
```

### Test Mode

To send a test email to yourself:

```json
{
  "invoiceId": "uuid-of-invoice",
  "stableId": "uuid-of-stable",
  "testMode": true
}
```

This sends the invoice to `ferdinand.straehuber@gmail.com` regardless of the recipient.

## Email Template

Invoices are sent as beautifully formatted HTML emails with:

- Stable logo (if configured)
- Invoice details (number, dates, line items)
- Payment information (bank details)
- Custom accent color from settings
- Footer message from settings

## Troubleshooting

### "Email failed to send"

1. Check your API key is correct
2. Verify your domain is properly configured
3. Check Resend dashboard for error logs

### "No recipient email"

Ensure the invoice has either:
- A linked client with an email address
- Custom recipient info with email
- A `recipientEmail` parameter in the request

### Emails going to spam

1. Set up proper domain authentication (SPF, DKIM, DMARC)
2. Use a custom domain instead of `@resend.dev`
3. Avoid spam trigger words in subject/body

## Rate Limits

Resend free tier:
- 3,000 emails/month
- 100 emails/day
- 1 email/second

For higher limits, upgrade to a paid plan.

## Support

- Resend Documentation: [resend.com/docs](https://resend.com/docs)
- VecHorses Issues: [github.com/vechorses/issues](https://github.com/vechorses/issues)

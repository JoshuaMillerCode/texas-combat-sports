# PDF Ticket Generation System

A comprehensive, stateless PDF ticket generation system for the Texas Combat Sports boxing event website. This system integrates with Stripe for payments and Resend for email delivery, generating tickets on-the-fly without persistent storage.

## Features

- **Stateless PDF Generation**: Tickets are generated in-memory using pdf-lib
- **Stripe Integration**: Seamless integration with Stripe payment flow
- **Email Delivery**: Automatic ticket delivery via Resend
- **Secure Downloads**: Authenticated ticket download API
- **QR Code Support**: Placeholder for QR code integration
- **Modern UI**: Clean, responsive ticket management interface

## Architecture

### Core Components

1. **TicketGenerator** (`lib/utils/ticket-generator.ts`)

   - PDF generation using pdf-lib
   - Stateless design - no file persistence
   - Customizable ticket design with boxing theme
   - Support for multiple tickets per transaction

2. **EmailService** (`lib/services/email.service.ts`)

   - Resend integration for email delivery
   - PDF attachment support
   - Fallback email system
   - Professional HTML email templates

3. **API Routes**

   - `/api/tickets/[ticketId]/download` - Secure ticket download
   - `/api/users/tickets` - User ticket management
   - Webhook integration with Stripe

4. **UI Components**
   - `TicketDownloadButton` - Download component with auth
   - `TicketStatus` - Ticket validation display
   - `/tickets` page - User ticket management interface

## Installation & Setup

### Dependencies

```bash
pnpm add pdf-lib resend
```

### Environment Variables

Add these to your `.env.local`:

```env
# Resend API Key
RESEND_API_KEY=your_resend_api_key

# Stripe Configuration (existing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# JWT Secret (existing)
JWT_SECRET=your_jwt_secret
```

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use Resend's sandbox domain
3. Get your API key from the dashboard
4. Update the `from` email in `EmailService` to match your verified domain

## Usage

### Automatic Ticket Generation

Tickets are automatically generated and emailed when a Stripe payment is completed:

1. Customer completes payment via Stripe
2. Stripe webhook triggers ticket generation
3. PDF tickets are generated in-memory
4. Tickets are emailed to customer via Resend
5. Fallback email sent if PDF generation fails

### Manual Ticket Download

Users can download tickets from their account:

```tsx
import { TicketDownloadButton } from '@/components/ticket-download-button';

<TicketDownloadButton ticketId="stripe_session_id" />;
```

### API Usage

#### Download Ticket

```bash
GET /api/tickets/{ticketId}/download
Authorization: Bearer {jwt_token}
```

#### Get User Tickets

```bash
GET /api/users/tickets
Authorization: Bearer {jwt_token}
```

#### Validate Ticket

```bash
POST /api/users/tickets
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "ticketId": "ticket_number",
  "action": "validate"
}
```

## Ticket Design

The PDF tickets feature:

- **Landscape Layout**: 8.5" x 4" professional format
- **Boxing Theme**: Red accent colors and combat sports branding
- **Complete Information**: Event details, purchaser info, ticket numbers
- **Security Features**: Unique ticket numbers, usage tracking
- **Professional Typography**: Clean, readable fonts and layout

### Customization

Modify ticket design in `TicketGenerator`:

```typescript
// Custom colors
const options = {
  primaryColor: '#1a1a1a',
  secondaryColor: '#cccccc',
  includeQRCode: true,
};

// Generate ticket
const pdfBytes = await TicketGenerator.generateTicket(ticketData, options);
```

## Security Features

- **Authentication Required**: All ticket operations require valid JWT
- **Ownership Verification**: Users can only access their own tickets
- **Unique Ticket Numbers**: Each ticket has a unique identifier
- **Usage Tracking**: Tickets can be marked as used
- **No Storage**: PDFs are generated on-demand, not stored

## Error Handling

The system includes comprehensive error handling:

- **PDF Generation Failures**: Fallback to simple email
- **Email Delivery Failures**: Logged for monitoring
- **Authentication Errors**: Clear user feedback
- **Network Issues**: Retry mechanisms and user notifications

## Monitoring & Logging

Key events are logged for monitoring:

```typescript
// Successful ticket generation
console.log('Ticket email sent successfully:', result);

// Failed email delivery
console.error('Failed to send ticket email:', error);

// PDF generation errors
console.error('Error generating/sending tickets:', error);
```

## Performance Considerations

- **Memory Efficient**: PDFs generated in-memory, not stored
- **Scalable**: Stateless design supports high concurrency
- **Caching**: Consider Redis for frequently accessed tickets
- **CDN**: PDFs can be cached at CDN level for downloads

## Future Enhancements

1. **QR Code Integration**: Add actual QR code generation
2. **Ticket Validation App**: Mobile app for event staff
3. **Bulk Operations**: Admin interface for bulk ticket management
4. **Analytics**: Ticket usage and validation analytics
5. **Offline Support**: PWA for offline ticket access

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**

   - Check pdf-lib installation
   - Verify font embedding
   - Check memory limits

2. **Email Not Sending**

   - Verify Resend API key
   - Check domain verification
   - Review email templates

3. **Authentication Errors**

   - Verify JWT token format
   - Check token expiration
   - Ensure proper headers

4. **Download Issues**
   - Check file permissions
   - Verify content-type headers
   - Test with different browsers

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('Ticket data:', ticketData);
console.log('PDF bytes length:', pdfBytes.length);
```

## Support

For issues or questions:

1. Check the logs for error details
2. Verify environment variables
3. Test with minimal ticket data
4. Review Stripe webhook configuration

## License

This system is part of the Texas Combat Sports website and follows the same licensing terms.

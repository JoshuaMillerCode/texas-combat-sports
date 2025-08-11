# Ticket Scanner - Admin Guide

## Overview

The Ticket Scanner is a mobile-friendly web application that allows event staff to scan QR codes on tickets at event doors to validate and mark them as used.

## Access

- **URL**: `/admin/ticket-scan`
- **Authentication**: Requires admin login
- **Access from**: Admin Dashboard → "Ticket Scanner" button

## Features

### Mobile Optimized

- Works on Android and iOS mobile browsers
- Full-screen interface for easy use
- Large buttons and text for non-technical staff
- Camera controls (torch, zoom) when supported

### QR Code Format

The scanner expects QR codes containing JSON data with:

```json
{
  "ticketNumber": "TXCS-12345",
  "transactionId": "txn_1234567890",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Scan Results

- **✅ Valid Ticket**: Green success indicator with "Ticket Accepted"
- **❌ Invalid Ticket**: Red error indicator with specific error message
- **🔄 Scan Again**: Button to scan another ticket
- **🏠 Back to Dashboard**: Return to admin dashboard

## How to Use

1. **Access the Scanner**

   - Log into admin dashboard
   - Click "Ticket Scanner" button in header
   - Or navigate directly to `/admin/ticket-scan`

2. **Start Scanning**

   - Click "Start Scanner" button
   - Allow camera permissions when prompted
   - Point camera at ticket QR code

3. **Process Results**
   - Scanner automatically processes the ticket
   - View result (success/error)
   - Click "Scan Again" for next ticket
   - Or "Back to Dashboard" to return

## API Integration

The scanner calls the existing API endpoint:

```
POST /api/tickets/use/[transactionId]/[ticketNumber]
```

This endpoint:

- Validates the ticket exists
- Checks if already used
- Marks ticket as used if valid
- Returns success/error response

## Technical Details

### Dependencies

- `html5-qrcode`: QR code scanning library
- `lucide-react`: Icons
- Existing UI components and auth context

### Mobile Features

- Viewport optimized for mobile
- Touch-friendly interface
- Camera permissions handling
- Responsive design

### Security

- Admin authentication required
- Same auth context as dashboard
- Automatic redirect to login if not authenticated

## Troubleshooting

### Camera Not Working

- Ensure HTTPS connection (required for camera access)
- Check browser permissions
- Try refreshing the page
- Use a modern mobile browser

### QR Code Not Scanning

- Ensure good lighting
- Hold camera steady
- Check QR code is not damaged
- Verify QR code format matches expected JSON structure

### Network Issues

- Check internet connection
- Verify API endpoint is accessible
- Contact technical support if persistent issues

## Support

For technical issues or questions, contact the development team.

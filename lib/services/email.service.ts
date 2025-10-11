import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTicketData {
  transaction: any;
  event: any;
  tickets: Uint8Array[];
}

export class EmailService {
  /**
   * Sends ticket confirmation email with PDF attachments
   */
  static async sendTicketConfirmation(data: EmailTicketData): Promise<boolean> {
    try {
      const { transaction, event, tickets } = data;

      // Generate email content
      const emailContent = this.generateTicketEmailContent(transaction, event);

      // Prepare attachments
      const attachments = tickets.map((ticketPdf, index) => ({
        filename: `ticket-${index + 1}-${transaction.orderId}.pdf`,
        content: Buffer.from(ticketPdf),
      }));

      // Send email
      const result = await resend.emails.send({
        from: 'Texas Combat Sports <tickets@texascombatsportsllc.com>',
        // from: 'Texas Combat Sports <support@joshuarmiller.dev>',
        to: [transaction.customerDetails.email],
        subject: `Your Tickets for ${event.title} - Texas Combat Sports`,
        html: emailContent,
        attachments,
      });

      console.log('Ticket email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send ticket email:', error);
      return false;
    }
  }

  /**
   * Sends a simple confirmation email without attachments (fallback)
   */
  static async sendSimpleConfirmation(
    transaction: any,
    event: any
  ): Promise<boolean> {
    try {
      const emailContent = this.generateSimpleEmailContent(transaction, event);

      const result = await resend.emails.send({
        from: 'Texas Combat Sports <tickets@joshuarmiller.dev>',
        to: [transaction.customerDetails.email],
        subject: `Ticket Purchase Confirmed - ${event.title}`,
        html: emailContent,
      });

      console.log('Simple confirmation email sent:', result);
      return true;
    } catch (error) {
      console.error('Failed to send simple confirmation email:', error);
      return false;
    }
  }

  private static generateTicketEmailContent(
    transaction: any,
    event: any
  ): string {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Chicago', // Central Time Zone for Texas
    });

    const eventTime = new Date(event.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Chicago', // Central Time Zone for Texas
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Tickets - Texas Combat Sports</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e60000; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .ticket-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #e60000; color: white; text-decoration: none; border-radius: 4px; }
          .important { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Your Tickets Are Here!</h1>
            <p>Texas Combat Sports</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your purchase, ${
              transaction.customerDetails.name
            }!</h2>
            
            <div class="ticket-info">
              <h3>Event Details</h3>
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Time:</strong> ${eventTime} (Central Time)</p>
              <p><strong>Venue:</strong> ${event.venue}</p>
              <p><strong>Address:</strong> ${event.address}</p>
            </div>

            <div class="ticket-info">
              <h3>Order Summary</h3>
              <p><strong>Order ID:</strong> ${transaction.orderId}</p>
              <p><strong>Total Tickets:</strong> ${
                transaction.summary.totalTickets
              }</p>
              <p><strong>Total Amount:</strong> $${(
                transaction.summary.totalAmount / 100
              ).toFixed(2)}</p>
            </div>

            <div class="important">
              <h4>📋 Important Information</h4>
              <ul>
                <li>Your tickets are attached to this email as PDF files</li>
                <li>Please save these tickets to your device or print them</li>
                <li>Bring a valid photo ID to the event</li>
                <li>Arrive at least 30 minutes before the event starts</li>
                <li>Tickets are non-refundable and non-transferable</li>
              </ul>
            </div>

            <p>If you have any questions, please contact us at <a href="mailto:support@texascombatsports.com">support@texascombatsports.com</a></p>
            
            <p>We look forward to seeing you at the event!</p>
            
            <p>Best regards,<br>The Texas Combat Sports Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Texas Combat Sports. All rights reserved.</p>
            <p>This email was sent to ${transaction.customerDetails.email}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateSimpleEmailContent(
    transaction: any,
    event: any
  ): string {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Chicago', // Central Time Zone for Texas
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Confirmed - Texas Combat Sports</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e60000; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Purchase Confirmed!</h1>
            <p>Texas Combat Sports</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your purchase, ${transaction.customerDetails.name}!</h2>
            
            <p>Your ticket purchase for <strong>${event.title}</strong> has been confirmed.</p>
            
            <p><strong>Event Date:</strong> ${eventDate}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Order ID:</strong> ${transaction.orderId}</p>
            
            <p>You will receive your tickets in a separate email shortly.</p>
            
            <p>If you have any questions, please contact us at <a href="mailto:support@texascombatsports.com">support@texascombatsports.com</a></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Texas Combat Sports. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

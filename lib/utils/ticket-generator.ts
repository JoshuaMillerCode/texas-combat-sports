import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import QRCode from 'qrcode';
import { formatAmountForDisplay } from '@/lib/stripe';

export interface TicketData {
  ticketId: string;
  purchaserName: string;
  purchaserEmail: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventVenue: string;
  ticketTier: string;
  ticketNumber: string;
  price: string;
  transactionId?: string; // Transaction ID for QR code
  qrCode?: string; // Optional QR code data
}

export interface TicketGenerationOptions {
  includeQRCode?: boolean;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export class TicketGenerator {
  private static readonly DEFAULT_PRIMARY_COLOR = rgb(0.1, 0.1, 0.1);
  private static readonly DEFAULT_SECONDARY_COLOR = rgb(0.8, 0.8, 0.8);
  private static readonly ACCENT_COLOR = rgb(0.9, 0.2, 0.2); // Red accent for boxing theme
  private static readonly DEFAULT_LOGO_URL =
    'https://res.cloudinary.com/dujmomznj/image/upload/v1753627714/txcs-logo_wb9qnx.jpg';

  /**
   * Generates a PDF ticket as a Uint8Array without persisting to storage
   */
  static async generateTicket(
    ticketData: TicketData,
    options: TicketGenerationOptions = {}
  ): Promise<Uint8Array> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 450]); // 8.5" x 6.25" landscape ticket (increased height for QR code)

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set up colors
    const primaryColor = options.primaryColor
      ? this.hexToRgb(options.primaryColor)
      : this.DEFAULT_PRIMARY_COLOR;
    const secondaryColor = options.secondaryColor
      ? this.hexToRgb(options.secondaryColor)
      : this.DEFAULT_SECONDARY_COLOR;

    // Draw background elements
    this.drawBackground(page, primaryColor, secondaryColor);

    // Draw header section with logo
    await this.drawHeader(page, helveticaBold, primaryColor, options.logoUrl);

    // Draw main content
    this.drawMainContent(
      page,
      ticketData,
      helveticaFont,
      helveticaBold,
      primaryColor
    );

    // Draw ticket details
    this.drawTicketDetails(
      page,
      ticketData,
      helveticaFont,
      helveticaBold,
      primaryColor
    );

    // Draw footer
    this.drawFooter(page, helveticaFont, secondaryColor);

    // Generate QR code if requested - now positioned at the bottom
    if (options.includeQRCode) {
      await this.drawQRCode(
        page,
        ticketData.ticketNumber,
        helveticaFont,
        ticketData.transactionId
      );
    }

    // Return the PDF as Uint8Array
    return await pdfDoc.save();
  }

  private static drawBackground(
    page: any,
    primaryColor: any,
    secondaryColor: any
  ) {
    const { width, height } = page.getSize();

    // Draw main background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1), // White background
    });

    // Draw accent stripe on the left
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 20,
      height,
      color: this.ACCENT_COLOR,
    });

    // Draw subtle grid pattern
    for (let i = 0; i < width; i += 40) {
      page.drawLine({
        start: { x: i, y: 0 },
        end: { x: i, y: height },
        color: secondaryColor,
        thickness: 0.5,
      });
    }
  }

  private static async drawHeader(
    page: any,
    font: PDFFont,
    color: any,
    logoUrl?: string
  ) {
    const { width, height } = page.getSize();

    // Company name
    page.drawText('TEXAS COMBAT SPORTS', {
      x: 40,
      y: height - 40,
      size: 24,
      font,
      color,
    });

    // Subtitle
    page.drawText('OFFICIAL EVENT TICKET', {
      x: 40,
      y: height - 65,
      size: 12,
      font,
      color: this.ACCENT_COLOR,
    });

    // Draw logo in top right corner
    if (logoUrl || this.DEFAULT_LOGO_URL) {
      try {
        const logoImageUrl = logoUrl || this.DEFAULT_LOGO_URL;
        const logoResponse = await fetch(logoImageUrl);
        const logoArrayBuffer = await logoResponse.arrayBuffer();
        const logoImage = await page.doc.embedJpg(logoArrayBuffer);

        // Calculate logo dimensions and position
        const logoWidth = 80;
        const logoHeight = 60;
        const logoX = width - logoWidth - 20; // 20px from right edge
        const logoY = height - logoHeight - 20; // 20px from top edge

        page.drawImage(logoImage, {
          x: logoX,
          y: logoY,
          width: logoWidth,
          height: logoHeight,
        });
      } catch (error) {
        console.warn('Failed to load logo image:', error);
        // Fallback: draw a placeholder rectangle
        page.drawRectangle({
          x: width - 100,
          y: height - 80,
          width: 80,
          height: 60,
          color: rgb(0.95, 0.95, 0.95),
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
        });

        page.drawText('LOGO', {
          x: width - 85,
          y: height - 45,
          size: 12,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
    }
  }

  private static drawMainContent(
    page: any,
    ticketData: TicketData,
    font: PDFFont,
    boldFont: PDFFont,
    color: any
  ) {
    const { width, height } = page.getSize();

    // Event name
    page.drawText('EVENT:', {
      x: 40,
      y: height - 120,
      size: 14,
      font: boldFont,
      color,
    });

    page.drawText(ticketData.eventName, {
      x: 40,
      y: height - 140,
      size: 18,
      font: boldFont,
      color,
    });

    // Event details in a structured layout
    const detailsY = height - 180;
    const labelX = 40;
    const valueX = 200;

    // Date
    page.drawText('DATE:', {
      x: labelX,
      y: detailsY,
      size: 12,
      font: boldFont,
      color,
    });

    page.drawText(ticketData.eventDate, {
      x: valueX,
      y: detailsY,
      size: 12,
      font,
      color,
    });

    // Time
    page.drawText('TIME:', {
      x: labelX,
      y: detailsY - 25,
      size: 12,
      font: boldFont,
      color,
    });

    page.drawText(ticketData.eventTime, {
      x: valueX,
      y: detailsY - 25,
      size: 12,
      font,
      color,
    });

    // Location
    page.drawText('VENUE:', {
      x: labelX,
      y: detailsY - 50,
      size: 12,
      font: boldFont,
      color,
    });

    page.drawText(ticketData.eventVenue, {
      x: valueX,
      y: detailsY - 50,
      size: 12,
      font,
      color,
    });

    // Address - moved up to avoid footer overlap
    page.drawText(ticketData.eventLocation, {
      x: valueX,
      y: detailsY - 70,
      size: 10,
      font,
      color,
    });
  }

  private static drawTicketDetails(
    page: any,
    ticketData: TicketData,
    font: PDFFont,
    boldFont: PDFFont,
    color: any
  ) {
    const { width, height } = page.getSize();

    // Right side ticket details - moved further right for better alignment
    const rightX = width - 200;
    const startY = height - 120;

    // Ticket tier
    page.drawText('TICKET TYPE:', {
      x: rightX,
      y: startY,
      size: 12,
      font: boldFont,
      color,
    });

    page.drawText(ticketData.ticketTier, {
      x: rightX,
      y: startY - 20,
      size: 14,
      font: boldFont,
      color: this.ACCENT_COLOR,
    });

    // Ticket number
    page.drawText('TICKET #:', {
      x: rightX,
      y: startY - 50,
      size: 12,
      font: boldFont,
      color,
    });

    page.drawText(ticketData.ticketNumber, {
      x: rightX,
      y: startY - 70,
      size: 12,
      font,
      color,
    });

    // Price
    page.drawText('PRICE:', {
      x: rightX,
      y: startY - 100,
      size: 12,
      font: boldFont,
      color,
    });

    page.drawText(`${ticketData.price}`, {
      x: rightX,
      y: startY - 120,
      size: 16,
      font: boldFont,
      color: this.ACCENT_COLOR,
    });

    // Purchaser info - moved up to ensure it's not cut off
    page.drawText('PURCHASED BY:', {
      x: rightX,
      y: startY - 140,
      size: 12,
      font: boldFont,
      color,
    });

    page.drawText(ticketData.purchaserName, {
      x: rightX,
      y: startY - 160,
      size: 12,
      font,
      color,
    });

    page.drawText(ticketData.purchaserEmail, {
      x: rightX,
      y: startY - 175,
      size: 10,
      font,
      color,
    });
  }

  private static drawFooter(page: any, font: PDFFont, color: any) {
    const { width, height } = page.getSize();

    // Terms and conditions - adjusted for taller ticket with QR code space
    page.drawText(
      'TERMS: This ticket is non-refundable and non-transferable. Valid ID required for entry.',
      {
        x: 40,
        y: 40,
        size: 8,
        font,
        color,
      }
    );

    // Security notice - adjusted for taller ticket with QR code space
    page.drawText(
      'SECURITY: This ticket contains security features. Duplicates will be rejected.',
      {
        x: 40,
        y: 25,
        size: 8,
        font,
        color,
      }
    );

    // Generated timestamp - adjusted for taller ticket with QR code space
    const timestamp = new Date().toLocaleString();
    page.drawText(`Generated: ${timestamp}`, {
      x: width - 150,
      y: 25,
      size: 8,
      font,
      color,
    });
  }

  private static async drawQRCode(
    page: any,
    ticketNumber: string,
    font: PDFFont,
    transactionId?: string
  ) {
    const { width, height } = page.getSize();

    // QR code now positioned at the bottom center of the ticket with more space
    const qrSize = 80; // Increased from 60 to 80 for better scanning
    const qrX = (width - qrSize) / 2; // Center horizontally
    const qrY = 90; // Positioned to avoid event location overlap

    try {
      // Create JSON object with ticket and transaction data
      const qrData = {
        ticketNumber: ticketNumber,
        transactionId: transactionId || '',
        timestamp: new Date().toISOString(),
      };

      // Convert JSON to string for QR code
      const qrCodeString = JSON.stringify(qrData);

      // Generate QR code as PNG buffer
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeString, {
        width: qrSize,
        margin: 1,
        color: {
          dark: '#000000', // Black QR code
          light: '#FFFFFF', // White background
        },
        errorCorrectionLevel: 'M', // Medium error correction
      });

      // Convert data URL to buffer
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const qrCodeBuffer = Buffer.from(base64Data, 'base64');

      // Embed the QR code image in the PDF
      const qrCodeImage = await page.doc.embedPng(qrCodeBuffer);

      // Draw the QR code image
      page.drawImage(qrCodeImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
      });
    } catch (error) {
      console.warn('Failed to generate QR code, using placeholder:', error);

      // Fallback: draw placeholder rectangle
      page.drawRectangle({
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });

      // Draw QR code text
      page.drawText('QR', {
        x: qrX + 30,
        y: qrY + 50,
        size: 14,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText('CODE', {
        x: qrX + 25,
        y: qrY + 35,
        size: 14,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Draw ticket ID below QR code with much more space
    page.drawText(`ID: ${ticketNumber}`, {
      x: qrX - 15,
      y: qrY - 25,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  private static hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return this.DEFAULT_PRIMARY_COLOR;

    return rgb(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }

  /**
   * Generates multiple tickets for a transaction
   */
  static async generateMultipleTickets(
    transaction: any,
    event: any,
    options: TicketGenerationOptions = {}
  ): Promise<Uint8Array[]> {
    const tickets: Uint8Array[] = [];

    if (!transaction.ticketItems) {
      return tickets;
    }
    for (const ticketItem of transaction.ticketItems) {
      for (const ticket of ticketItem.tickets) {
        const ticketData: TicketData = {
          ticketId:
            transaction.stripePaymentIntentId || transaction.stripeSessionId,
          purchaserName: transaction.customerDetails.name,
          purchaserEmail: transaction.customerDetails.email,
          eventName: event.title,
          eventDate: event.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          eventTime: event.date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          eventLocation: event.address,
          eventVenue: event.venue,
          ticketTier: ticketItem.tierName,
          ticketNumber: ticket.ticketNumber,
          price: formatAmountForDisplay(ticketItem.price / 100, 'USD'),
          transactionId:
            transaction._id?.toString() || transaction.orderId || '',
        };

        const pdfBytes = await this.generateTicket(ticketData, options);
        tickets.push(pdfBytes);
      }
    }

    return tickets;
  }
}

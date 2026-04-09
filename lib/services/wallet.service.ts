import { ITransaction } from '@/lib/models/Transaction';

export interface WalletPassData {
  orderId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  customerName: string;
  tierName: string;
  ticketNumber: string;
  quantity: number;
}

// ─── Apple Wallet ──────────────────────────────────────────────────────────
//
// .pkpass generation requires three Apple Developer credentials stored as
// environment variables. These are obtained from the Apple Developer Portal:
//
//   APPLE_PASS_TYPE_IDENTIFIER  — e.g. "pass.com.texascombatsports.ticket"
//   APPLE_TEAM_IDENTIFIER       — e.g. "AB12CD34EF"
//   APPLE_CERT_P12_BASE64       — base64-encoded .p12 signing certificate
//   APPLE_CERT_P12_PASSWORD     — password for the .p12 file
//   APPLE_WWDR_CERT_BASE64      — base64-encoded Apple WWDR intermediate cert
//                                 (download from: https://www.apple.com/certificateauthority/)
//
// TODO: Uncomment and complete this implementation once Apple Developer
//       credentials are available. The pass structure below is complete.

export class AppleWalletService {
  static isConfigured(): boolean {
    return !!(
      process.env.APPLE_PASS_TYPE_IDENTIFIER &&
      process.env.APPLE_TEAM_IDENTIFIER &&
      process.env.APPLE_CERT_P12_BASE64 &&
      process.env.APPLE_CERT_P12_PASSWORD &&
      process.env.APPLE_WWDR_CERT_BASE64
    );
  }

  static async generatePass(data: WalletPassData): Promise<Buffer> {
    if (!this.isConfigured()) {
      throw new Error(
        'Apple Wallet is not configured. Set APPLE_PASS_TYPE_IDENTIFIER, ' +
          'APPLE_TEAM_IDENTIFIER, APPLE_CERT_P12_BASE64, APPLE_CERT_P12_PASSWORD, ' +
          'and APPLE_WWDR_CERT_BASE64 environment variables.'
      );
    }

    // Dynamic import so the module is only loaded server-side when needed
    const { PKPass } = await import('passkit-generator');

    const eventDate = new Date(data.eventDate);

    const pass = new PKPass(
      {},
      {
        signerCert: Buffer.from(
          process.env.APPLE_CERT_P12_BASE64!,
          'base64'
        ),
        signerKey: Buffer.from(
          process.env.APPLE_CERT_P12_BASE64!,
          'base64'
        ),
        signerKeyPassphrase: process.env.APPLE_CERT_P12_PASSWORD,
        wwdr: Buffer.from(process.env.APPLE_WWDR_CERT_BASE64!, 'base64'),
      },
      {
        passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER!,
        teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER!,
        organizationName: 'Texas Combat Sports',
        description: data.eventTitle,
        serialNumber: data.ticketNumber,
        foregroundColor: 'rgb(255, 255, 255)',
        backgroundColor: 'rgb(220, 38, 38)',
        labelColor: 'rgb(200, 200, 200)',
        relevantDate: eventDate.toISOString(),
      }
    );

    pass.type = 'eventTicket';

    // Header field — event name
    pass.headerFields.push({
      key: 'event',
      label: 'EVENT',
      value: data.eventTitle,
    });

    // Primary fields — customer name
    pass.primaryFields.push({
      key: 'name',
      label: 'ATTENDEE',
      value: data.customerName,
    });

    // Secondary fields — tier and quantity
    pass.secondaryFields.push(
      {
        key: 'tier',
        label: 'TICKET TYPE',
        value: data.tierName,
      },
      {
        key: 'qty',
        label: 'QTY',
        value: String(data.quantity),
      }
    );

    // Auxiliary fields — date, venue, order
    pass.auxiliaryFields.push(
      {
        key: 'date',
        label: 'DATE',
        value: eventDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        dateStyle: 'PKDateStyleShort',
      },
      {
        key: 'venue',
        label: 'VENUE',
        value: data.eventVenue,
      }
    );

    // Back fields — order ID for reference
    pass.backFields.push(
      {
        key: 'orderId',
        label: 'Order ID',
        value: data.orderId,
      },
      {
        key: 'ticketNumber',
        label: 'Ticket Number',
        value: data.ticketNumber,
      },
      {
        key: 'support',
        label: 'Support',
        value: 'For questions, contact stevemares@nwec.edu or 832-955-5180',
      }
    );

    // QR code barcode
    pass.setBarcodes({
      message: data.ticketNumber,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: data.ticketNumber,
    });

    return pass.getAsBuffer();
  }
}

// ─── Google Wallet ──────────────────────────────────────────────────────────
//
// Google Wallet requires a Google Cloud service account with the
// "Google Wallet API" enabled. Setup:
//
//   1. Create a project at console.cloud.google.com
//   2. Enable "Google Wallet API"
//   3. Create a service account and download the JSON key
//   4. Create an "Issuer" at pay.google.com/gp/m/issuer/list
//   5. Set these env vars:
//
//   GOOGLE_WALLET_ISSUER_ID         — numeric issuer ID from Google Pay console
//   GOOGLE_WALLET_SERVICE_ACCOUNT   — full JSON key file content (stringified)
//
// The JWT link generated by generatePassJwt can be opened directly on Android
// to add the pass to Google Wallet.

export class GoogleWalletService {
  private static readonly SAVE_LINK = 'https://pay.google.com/gp/v/save/';
  private static readonly AUDIENCE = 'google';
  private static readonly JWT_TYPE = 'savetoandroidpay';
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/wallet_object.issuer',
  ];

  static isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_WALLET_ISSUER_ID &&
      process.env.GOOGLE_WALLET_SERVICE_ACCOUNT
    );
  }

  static async generatePassUrl(data: WalletPassData): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error(
        'Google Wallet is not configured. Set GOOGLE_WALLET_ISSUER_ID and ' +
          'GOOGLE_WALLET_SERVICE_ACCOUNT environment variables.'
      );
    }

    const { GoogleAuth } = await import('google-auth-library');

    const serviceAccount = JSON.parse(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT!);
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;

    const eventDate = new Date(data.eventDate);
    const classId = `${issuerId}.tcs-event-ticket`;
    const objectId = `${issuerId}.${data.ticketNumber}`;

    // Event class definition (upserted on each request for simplicity)
    const eventClass = {
      id: classId,
      issuerName: 'Texas Combat Sports',
      reviewStatus: 'UNDER_REVIEW',
      eventName: { defaultValue: { language: 'en-US', value: data.eventTitle } },
      venue: {
        name: { defaultValue: { language: 'en-US', value: data.eventVenue } },
      },
      dateTime: {
        doorsOpen: eventDate.toISOString(),
        start: eventDate.toISOString(),
      },
    };

    // Pass object for this specific ticket
    const eventObject = {
      id: objectId,
      classId,
      state: 'ACTIVE',
      ticketHolderName: data.customerName,
      ticketNumber: data.ticketNumber,
      seatInfo: {
        section: { defaultValue: { language: 'en-US', value: data.tierName } },
      },
      barcode: {
        type: 'QR_CODE',
        value: data.ticketNumber,
        alternateText: data.ticketNumber,
      },
      textModulesData: [
        {
          header: 'Order ID',
          body: data.orderId,
          id: 'order_id',
        },
        {
          header: 'Quantity',
          body: String(data.quantity),
          id: 'quantity',
        },
      ],
      infoModuleData: {
        labelValueRows: [
          {
            columns: [
              { label: 'Date', value: eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
              { label: 'Venue', value: data.eventVenue },
            ],
          },
        ],
      },
    };

    // Build JWT payload
    const payload = {
      iss: serviceAccount.client_email,
      aud: this.AUDIENCE,
      typ: this.JWT_TYPE,
      iat: Math.floor(Date.now() / 1000),
      payload: {
        eventTicketClasses: [eventClass],
        eventTicketObjects: [eventObject],
      },
    };

    // Sign JWT with the service account key
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: this.SCOPES,
    });
    const client = await auth.getClient() as any;
    const jwt = await client.sign(JSON.stringify(payload));

    return `${this.SAVE_LINK}${jwt}`;
  }
}

// ─── Shared helper ──────────────────────────────────────────────────────────

export function buildWalletPassData(
  transaction: ITransaction,
  ticketIndex = 0
): WalletPassData {
  const ticketItem = transaction.ticketItems?.[ticketIndex];
  const firstTicket = ticketItem?.tickets?.[0];

  return {
    orderId: transaction.orderId,
    eventTitle: transaction.metadata.eventTitle ?? 'Texas Combat Sports Event',
    eventDate: transaction.metadata.eventDate ?? new Date().toISOString(),
    eventVenue: transaction.metadata.eventVenue ?? 'Texas',
    customerName: transaction.customerDetails.name,
    tierName: ticketItem?.tierName ?? 'General Admission',
    ticketNumber: firstTicket?.ticketNumber ?? transaction.orderId,
    quantity: ticketItem?.quantity ?? 1,
  };
}

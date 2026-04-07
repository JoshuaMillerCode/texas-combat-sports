import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class CustomerEmailService {
  static async sendMagicLink(email: string, magicLinkUrl: string): Promise<boolean> {
    try {
      await resend.emails.send({
        from: 'Texas Combat Sports <tickets@texascombatsportsllc.com>',
        to: [email],
        subject: 'Access Your Tickets — Texas Combat Sports',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" style="max-width:520px;background:#111;border-radius:12px;overflow:hidden;border:1px solid #222;">
                    <!-- Header -->
                    <tr>
                      <td style="background:#e60000;padding:28px 32px;text-align:center;">
                        <p style="margin:0;color:#fff;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Texas Combat Sports</p>
                        <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:800;">Your Ticket Access Link</h1>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:36px 32px;">
                        <p style="margin:0 0 8px;color:#999;font-size:13px;">Requested for</p>
                        <p style="margin:0 0 28px;color:#fff;font-size:15px;font-weight:600;">${email}</p>
                        <p style="margin:0 0 28px;color:#aaa;font-size:14px;line-height:1.6;">
                          Click the button below to view and download your tickets. This link expires in <strong style="color:#fff;">15 minutes</strong> and can only be used once.
                        </p>
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center">
                              <a href="${magicLinkUrl}"
                                style="display:inline-block;background:#e60000;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                                View My Tickets
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:28px 0 0;color:#555;font-size:12px;line-height:1.6;">
                          If the button doesn't work, copy and paste this link into your browser:<br />
                          <span style="color:#888;word-break:break-all;">${magicLinkUrl}</span>
                        </p>
                        <p style="margin:20px 0 0;color:#444;font-size:12px;">
                          If you didn't request this, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 32px;border-top:1px solid #222;text-align:center;">
                        <p style="margin:0;color:#444;font-size:11px;">© ${new Date().getFullYear()} Texas Combat Sports. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send magic link email:', error);
      return false;
    }
  }
}

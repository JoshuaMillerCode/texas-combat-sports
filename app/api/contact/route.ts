import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formType, ...formData } = body;

    // Validate form type
    if (!['fight', 'venue', 'sponsor', 'general'].includes(formType)) {
      return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
    }

    // Get recipient email based on form type
    const recipientEmails = {
      general: process.env.RESEND_GENERAL_EMAIL,
      fight: process.env.RESEND_FIGHT_EMAIL,
      venue: process.env.RESEND_VENUE_EMAIL,
      sponsor: process.env.RESEND_SPONSOR_EMAIL,
    };

    const recipientEmail =
      recipientEmails[formType as keyof typeof recipientEmails];

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email not configured' },
        { status: 500 }
      );
    }

    // Create email subject and content based on form type
    let subject = '';
    let htmlContent = '';

    switch (formType) {
      case 'fight':
        subject = 'New Fighter Inquiry - Texas Combat Sports';
        htmlContent = generateFighterEmailContent(formData);
        break;

      case 'venue':
        subject = 'New Venue Contact - Texas Combat Sports';
        htmlContent = generateVenueEmailContent(formData);
        break;

      case 'sponsor':
        subject = 'New Sponsor Contact - Texas Combat Sports';
        htmlContent = generateSponsorEmailContent(formData);
        break;

      case 'general':
        subject = 'New General Contact - Texas Combat Sports';
        htmlContent = generateGeneralEmailContent(formData);
        break;
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Texas Combat Sports <noreply@texascombatsportsllc.com>',
      // from: 'Texas Combat Sports <noreply@joshuarmiller.dev>',
      to: [recipientEmail],
      replyTo: formData.email,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateGeneralEmailContent(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New General Contact - Texas Combat Sports</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e60000; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e60000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤝 New General Contact</h1>
          <p>Texas Combat Sports</p>
        </div>
        
        <div class="content">
          <h2>General Inquiry</h2>
          
          <div class="info-box">
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Message:</strong> ${data.message}</p>
          </div>

          <p>Please respond to this inquiry within 24-48 hours.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateFighterEmailContent(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Fighter Inquiry - Texas Combat Sports</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e60000; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e60000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🥊 New Fighter Inquiry</h1>
          <p>Texas Combat Sports</p>
        </div>
        
        <div class="content">
          <h2>Fighter Contact Information</h2>
          
          <div class="info-box">
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Weight Class:</strong> ${data.weightClass}</p>
          </div>

          <div class="info-box">
            <h3>Message</h3>
            <p>${data.message}</p>
          </div>

          <p>Please respond to this inquiry within 24-48 hours.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Texas Combat Sports. All rights reserved.</p>
          <p>This inquiry was submitted via the TCS website contact form.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateVenueEmailContent(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Venue Contact - Texas Combat Sports</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e60000; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e60000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏟️ New Venue Contact</h1>
          <p>Texas Combat Sports</p>
        </div>
        
        <div class="content">
          <h2>Venue Partnership Inquiry</h2>
          
          <div class="info-box">
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
          </div>

          <div class="info-box">
            <h3>Venue Information</h3>
            <p><strong>Venue Name:</strong> ${data.venueName}</p>
            <p><strong>Location:</strong> ${data.location}</p>
          </div>

          <div class="info-box">
            <h3>Message</h3>
            <p>${data.message}</p>
          </div>

          <p>Please respond to this inquiry within 24-48 hours.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Texas Combat Sports. All rights reserved.</p>
          <p>This inquiry was submitted via the TCS website contact form.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateSponsorEmailContent(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Sponsor Contact - Texas Combat Sports</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e60000; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #e60000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💼 New Sponsor Contact</h1>
          <p>Texas Combat Sports</p>
        </div>
        
        <div class="content">
          <h2>Sponsorship Partnership Inquiry</h2>
          
          <div class="info-box">
            <h3>Contact Details</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
          </div>

          <div class="info-box">
            <h3>Company Information</h3>
            <p><strong>Company Name:</strong> ${data.companyName}</p>
            <p><strong>Sponsorship Type:</strong> ${data.sponsorshipType}</p>
          </div>

          <div class="info-box">
            <h3>Message</h3>
            <p>${data.message}</p>
          </div>

          <p>Please respond to this inquiry within 24-48 hours.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Texas Combat Sports. All rights reserved.</p>
          <p>This inquiry was submitted via the TCS website contact form.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

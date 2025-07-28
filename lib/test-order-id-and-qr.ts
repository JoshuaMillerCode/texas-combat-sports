import { OrderIDGenerator } from './order-id-generator';
import { TicketGenerator } from './ticket-generator';

async function testOrderIDAndQR() {
  console.log('🧪 Testing Order ID Generation and QR Code Functionality\n');

  // Test Order ID Generation
  console.log('📋 Testing Order ID Generation:');
  const orderId1 = OrderIDGenerator.generateOrderID();
  const orderId2 = OrderIDGenerator.generateOrderID();
  const shortOrderId = OrderIDGenerator.generateShortOrderID();
  const ticketNumber = OrderIDGenerator.generateTicketNumber('TXCS');

  console.log(`Full Order ID 1: ${orderId1}`);
  console.log(`Full Order ID 2: ${orderId2}`);
  console.log(`Short Order ID: ${shortOrderId}`);
  console.log(`Ticket Number: ${ticketNumber}`);

  // Test validation
  console.log('\n✅ Validation Tests:');
  console.log(
    `Is valid Order ID: ${OrderIDGenerator.isValidOrderID(orderId1)}`
  );
  console.log(
    `Is valid Short Order ID: ${OrderIDGenerator.isValidShortOrderID(
      shortOrderId
    )}`
  );
  console.log(
    `Is valid Ticket Number: ${OrderIDGenerator.isValidTicketNumber(
      ticketNumber
    )}`
  );

  // Test QR Code Generation
  console.log('\n📱 Testing QR Code Generation:');

  const testTicketData = {
    ticketId: orderId1,
    purchaserName: 'John Doe',
    purchaserEmail: 'john@example.com',
    eventName: 'Texas Combat Sports Championship',
    eventDate: 'December 15, 2024',
    eventTime: '7:00 PM',
    eventLocation: '123 Main St, Houston, TX 77001',
    eventVenue: 'Houston Arena',
    ticketTier: 'VIP',
    ticketNumber: ticketNumber,
    price: '$150.00',
  };

  try {
    console.log('Generating ticket with QR code...');
    const pdfBytes = await TicketGenerator.generateTicket(testTicketData, {
      includeQRCode: true,
      logoUrl:
        'https://res.cloudinary.com/dujmomznj/image/upload/v1753627714/txcs-logo_wb9qnx.jpg',
    });

    console.log(`✅ QR Code generated successfully!`);
    console.log(`📄 PDF size: ${pdfBytes.length} bytes`);
    console.log(`🎫 Ticket ID: ${testTicketData.ticketId}`);
    console.log(`📱 QR Code contains: ${testTicketData.ticketId}`);

    // Test with JSON data in QR code
    console.log('\n🔄 Testing QR Code with JSON data...');
    const qrData = {
      ticketId: testTicketData.ticketId,
      eventName: testTicketData.eventName,
      eventDate: testTicketData.eventDate,
      purchaserName: testTicketData.purchaserName,
      ticketNumber: testTicketData.ticketNumber,
      validationUrl: `https://texascombatsports.com/validate/${testTicketData.ticketId}`,
    };

    const jsonTicketData = {
      ...testTicketData,
      ticketId: JSON.stringify(qrData),
    };

    const jsonPdfBytes = await TicketGenerator.generateTicket(jsonTicketData, {
      includeQRCode: true,
      logoUrl:
        'https://res.cloudinary.com/dujmomznj/image/upload/v1753627714/txcs-logo_wb9qnx.jpg',
    });

    console.log(`✅ JSON QR Code generated successfully!`);
    console.log(`📄 PDF size: ${jsonPdfBytes.length} bytes`);
    console.log(`📱 QR Code contains JSON data with validation URL`);
  } catch (error) {
    console.error('❌ Error generating ticket with QR code:', error);
  }

  console.log('\n🎉 All tests completed!');
}

// Run the test
testOrderIDAndQR().catch(console.error);

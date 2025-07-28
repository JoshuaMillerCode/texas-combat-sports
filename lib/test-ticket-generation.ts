import { TicketGenerator } from './utils/ticket-generator';
import fs from 'fs';
import path from 'path';

// Test data
const testTicketData = {
  ticketId: 'pi_test_123456789',
  purchaserName: 'John Doe',
  purchaserEmail: 'john.doe@example.com',
  eventName: 'Houston Showdown 2024',
  eventDate: 'Saturday, December 14, 2024',
  eventTime: '7:00 PM',
  eventLocation: '123 Main Street, Houston, TX 77001',
  eventVenue: 'Houston Arena',
  ticketTier: 'VIP Ringside',
  ticketNumber: 'TCS-1703123456-ABC123DEF',
  price: '$150.00',
};

async function testTicketGeneration() {
  try {
    console.log('🧪 Testing PDF Ticket Generation...');

    // Test single ticket generation
    console.log('📄 Generating single ticket...');
    const singleTicket = await TicketGenerator.generateTicket(testTicketData, {
      includeQRCode: true,
      primaryColor: '#1a1a1a',
      secondaryColor: '#cccccc',
    });

    console.log(`✅ Single ticket generated: ${singleTicket.length} bytes`);

    // Test multiple tickets generation
    console.log('📄 Generating multiple tickets...');
    const mockTransaction = {
      stripeSessionId: 'cs_test_123456789',
      stripePaymentIntentId: 'pi_test_123456789',
      customerDetails: {
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      ticketItems: [
        {
          tierName: 'VIP Ringside',
          quantity: 2,
          tickets: [
            {
              ticketNumber: 'TCS-1703123456-ABC123DEF',
              isUsed: false,
            },
            {
              ticketNumber: 'TCS-1703123456-GHI456JKL',
              isUsed: false,
            },
          ],
        },
      ],
      summary: {
        totalAmount: 30000, // $300.00 in cents
        currency: 'USD',
      },
    };

    const mockEvent = {
      title: 'Houston Showdown 2024',
      date: new Date('2024-12-14T19:00:00Z'),
      venue: 'Houston Arena',
      address: '123 Main Street, Houston, TX 77001',
    };

    const multipleTickets = await TicketGenerator.generateMultipleTickets(
      mockTransaction,
      mockEvent,
      { includeQRCode: true }
    );

    console.log(
      `✅ Multiple tickets generated: ${multipleTickets.length} tickets`
    );
    console.log(
      `📊 Total size: ${multipleTickets.reduce(
        (sum, ticket) => sum + ticket.length,
        0
      )} bytes`
    );

    // Save test files (optional - for visual inspection)
    const testDir = path.join(process.cwd(), 'test-output');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Save single ticket
    fs.writeFileSync(
      path.join(testDir, 'single-ticket-test.pdf'),
      singleTicket
    );

    // Save first ticket from multiple
    if (multipleTickets.length > 0) {
      fs.writeFileSync(
        path.join(testDir, 'multiple-ticket-test.pdf'),
        multipleTickets[0]
      );
    }

    console.log('💾 Test files saved to ./test-output/');
    console.log('🎉 All tests passed!');

    return {
      success: true,
      singleTicketSize: singleTicket.length,
      multipleTicketsCount: multipleTickets.length,
      totalSize: multipleTickets.reduce(
        (sum, ticket) => sum + ticket.length,
        0
      ),
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testTicketGeneration()
    .then((result) => {
      if (result.success) {
        console.log('✅ Ticket generation test completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Ticket generation test failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { testTicketGeneration };

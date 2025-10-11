import Stripe from 'stripe';
import { TransactionService } from './transaction.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const SERVICE_ACCOUNT_ID =
  process.env.SERVICE_ACCOUNT_ID || 'acct_YOUR_ACCOUNT_ID';
const SERVICE_FEE_PERCENTAGE = 4; // 4% service fee

export class TransferService {
  /**
   * Calculate the service fee amount (4% of total)
   */
  static calculateServiceFee(totalAmount: number): number {
    return Math.round(totalAmount * (SERVICE_FEE_PERCENTAGE / 100));
  }

  /**
   * Create a transfer to the service account after successful payment
   */
  static async createServiceFeeTransfer(
    paymentIntentId: string,
    totalAmount: number,
    transactionId: string
  ): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      console.log('🏦 TransferService.createServiceFeeTransfer called with:', {
        paymentIntentId,
        totalAmount,
        transactionId,
        SERVICE_ACCOUNT_ID: SERVICE_ACCOUNT_ID || 'NOT SET',
        SERVICE_FEE_PERCENTAGE,
      });

      if (
        !SERVICE_ACCOUNT_ID ||
        SERVICE_ACCOUNT_ID === 'acct_YOUR_ACCOUNT_ID'
      ) {
        console.error('❌ SERVICE_ACCOUNT_ID not properly configured');
        return {
          success: false,
          error: 'SERVICE_ACCOUNT_ID not configured',
        };
      }

      const transferAmount = this.calculateServiceFee(totalAmount);

      console.log('Creating service fee transfer:', {
        paymentIntentId,
        totalAmount,
        transferAmount,
        percentage: SERVICE_FEE_PERCENTAGE,
        serviceAccountId: SERVICE_ACCOUNT_ID,
        willUseSourceTransaction: paymentIntentId.startsWith('pi_'),
      });

      // Get the charge ID from the payment intent to use as source_transaction
      let sourceTransactionId = null;

      if (paymentIntentId.startsWith('pi_')) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntentId
          );
          if (paymentIntent.latest_charge) {
            sourceTransactionId = paymentIntent.latest_charge as string;
            console.log(
              'Found source transaction (charge ID):',
              sourceTransactionId
            );
          }
        } catch (error) {
          console.warn(
            'Could not retrieve payment intent for source_transaction:',
            error
          );
        }
      }

      // Create the transfer to service account
      const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: 'usd',
        destination: SERVICE_ACCOUNT_ID,
        // Link transfer to the original charge - this allows transfer to be queued
        // and executed automatically once funds become available
        ...(sourceTransactionId
          ? { source_transaction: sourceTransactionId }
          : {}),
        description: `Service fee (${SERVICE_FEE_PERCENTAGE}%) for transaction ${transactionId}`,
        metadata: {
          transactionId,
          paymentIntentId,
          serviceFeePercentage: SERVICE_FEE_PERCENTAGE.toString(),
          originalAmount: totalAmount.toString(),
          sourceTransactionId: sourceTransactionId || 'none',
        },
      });

      console.log('Transfer created successfully:', {
        transferId: transfer.id,
        amount: transfer.amount,
        destination: transfer.destination,
        sourceTransaction: sourceTransactionId || 'none',
      });

      // Update transaction with transfer information
      await TransactionService.updateTransaction(transactionId, {
        serviceAccountTransfer: {
          transferId: transfer.id,
          amount: transferAmount,
          status: 'completed',
          createdAt: new Date(),
        },
      });

      return {
        success: true,
        transferId: transfer.id,
      };
    } catch (error: any) {
      console.error('Error creating service fee transfer:', error);

      // Update transaction with failed status
      await TransactionService.updateTransaction(transactionId, {
        serviceAccountTransfer: {
          transferId: '',
          amount: this.calculateServiceFee(totalAmount),
          status: 'failed',
          createdAt: new Date(),
        },
      });

      return {
        success: false,
        error: error.message || 'Failed to create transfer',
      };
    }
  }

  /**
   * Reverse a transfer when a refund occurs
   */
  static async reverseServiceFeeTransfer(
    transferId: string,
    transactionId: string,
    refundAmount?: number
  ): Promise<{ success: boolean; reversalId?: string; error?: string }> {
    try {
      console.log('Reversing service fee transfer:', {
        transferId,
        transactionId,
        refundAmount,
      });

      // Retrieve the original transfer to get the amount
      const transfer = await stripe.transfers.retrieve(transferId);

      // Calculate reversal amount
      // If partial refund, calculate proportional reversal
      let reversalAmount = transfer.amount;
      if (refundAmount && transfer.metadata?.originalAmount) {
        const originalAmount = parseInt(transfer.metadata.originalAmount);
        const refundPercentage = refundAmount / originalAmount;
        reversalAmount = Math.round(transfer.amount * refundPercentage);
      }

      console.log('Creating transfer reversal:', {
        transferId,
        originalAmount: transfer.amount,
        reversalAmount,
        isPartial: reversalAmount < transfer.amount,
      });

      // Create the transfer reversal
      const reversal = await stripe.transfers.createReversal(transferId, {
        amount: reversalAmount,
        description: `Reversal for refunded transaction ${transactionId}`,
        metadata: {
          transactionId,
          refundAmount: refundAmount?.toString() || 'full',
        },
      });

      console.log('Transfer reversed successfully:', {
        reversalId: reversal.id,
        amount: reversal.amount,
      });

      // Update transaction with reversal information
      const transaction = await TransactionService.getTransactionById(
        transactionId
      );
      if (transaction && transaction.serviceAccountTransfer) {
        await TransactionService.updateTransaction(transactionId, {
          serviceAccountTransfer: {
            ...transaction.serviceAccountTransfer,
            status: 'reversed',
            reversedAt: new Date(),
            reversalId: reversal.id,
          },
        });
      }

      return {
        success: true,
        reversalId: reversal.id,
      };
    } catch (error: any) {
      console.error('Error reversing service fee transfer:', error);
      return {
        success: false,
        error: error.message || 'Failed to reverse transfer',
      };
    }
  }

  /**
   * Get transfer details
   */
  static async getTransferDetails(transferId: string) {
    try {
      const transfer = await stripe.transfers.retrieve(transferId);
      return transfer;
    } catch (error: any) {
      console.error('Error retrieving transfer:', error);
      throw error;
    }
  }

  /**
   * List all reversals for a transfer
   */
  static async getTransferReversals(transferId: string) {
    try {
      const reversals = await stripe.transfers.listReversals(transferId);
      return reversals.data;
    } catch (error: any) {
      console.error('Error retrieving transfer reversals:', error);
      throw error;
    }
  }
}

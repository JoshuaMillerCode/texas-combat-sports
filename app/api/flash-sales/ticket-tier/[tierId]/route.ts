import { type NextRequest, NextResponse } from 'next/server';
import { FlashSaleService } from '@/lib/services/flashSale.service';
import { isFeatureEnabled } from '@/lib/feature-flags';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/flash-sales/ticket-tier/[tierId]
 * Get active flash sale for a specific ticket tier
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { tierId: string } }
) {
  try {
    // Check if flash sales are enabled
    if (!isFeatureEnabled('FLASH_SALES_ENABLED')) {
      return NextResponse.json({ hasFlashSale: false });
    }

    const pricing = await FlashSaleService.getFlashSalePricing(params.tierId);

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Error fetching flash sale for ticket tier:', error);
    return NextResponse.json({ hasFlashSale: false });
  }
}

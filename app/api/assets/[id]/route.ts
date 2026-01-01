import { NextResponse } from 'next/server'
import { assets, initialPortfolio } from '@/lib/mockData'

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } },
) => {
  const asset = assets.find((item) => item.id === params.id)
  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  const shares = initialPortfolio.holdings[asset.id] ?? 0
  const userPosition = {
    amount: shares * asset.price,
    shares,
  }

  return NextResponse.json({ asset, userPosition })
}

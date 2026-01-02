import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Define AssetType locally
type AssetType = 'treasury' | 'real_estate' | 'credit' | 'cash'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as AssetType | null
  const minAPY = searchParams.get('minAPY')
  const maxRisk = searchParams.get('maxRisk')

  const where: any = {}

  if (type) {
    where.type = type
  }
  if (minAPY) {
    const minAPYNum = Number(minAPY)
    if (!isNaN(minAPYNum)) {
      where.apy = { gte: minAPYNum }
    }
  }
  if (maxRisk) {
    const maxRiskNum = Number(maxRisk)
    if (!isNaN(maxRiskNum)) {
      where.riskScore = { lte: maxRiskNum }
    }
  }

  const filtered = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Transform Decimal fields to numbers for JSON serialization
  // Map database type format (real_estate) to frontend format (real-estate)
  const typeMap: Record<string, string> = {
    real_estate: 'real-estate',
    treasury: 'treasury',
    credit: 'credit',
    cash: 'cash',
  }
  const assets = filtered.map((asset: any) => ({
    id: asset.id,
    name: asset.name,
    type: typeMap[asset.type] || asset.type,
    apy: Number(asset.apy),
    durationDays: asset.durationDays,
    riskScore: asset.riskScore,
    yieldConfidence: asset.yieldConfidence,
    aumUsd: Number(asset.aumUsd),
    price: Number(asset.price),
    status: asset.status,
    nextPayoutDate: asset.nextPayoutDate.toISOString().split('T')[0],
    description: asset.description,
    tokenAddress: asset.tokenAddress,
    distributorAddress: asset.distributorAddress,
  }))

  return NextResponse.json({
    assets,
    total: assets.length,
    page: 1,
    pageSize: 20,
  })
}

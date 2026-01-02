import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params
  // Fetch asset with all related data
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      yieldBreakdowns: true,
      confidenceFactors: true,
      realWorldInfo: true,
      realWorldKeyFacts: true,
      realWorldVerifications: true,
      cashFlowSources: true,
      events: {
        orderBy: { eventDate: 'desc' },
        take: 10,
      },
      yieldHistory: {
        orderBy: { dayIndex: 'asc' },
      },
      navHistory: {
        orderBy: { dayIndex: 'asc' },
      },
    },
  })

  if (!asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  // Hardcoded demo user ID
  const userId = '00000000-0000-0000-0000-000000000001'

  // Fetch user's holdings for this asset
  const holding = await prisma.portfolioHolding.findUnique({
    where: {
      userId_assetId: {
        userId,
        assetId: id,
      },
    },
  })

  const shares = holding ? Number(holding.shares) : 0
  const userPosition = {
    amount: shares * Number(asset.price),
    shares,
  }

  // Transform asset data to match mock format
  // Map database type format (real_estate) to frontend format (real-estate)
  const typeMap: Record<string, string> = {
    real_estate: 'real-estate',
    treasury: 'treasury',
    credit: 'credit',
    cash: 'cash',
  }
  const transformedAsset = {
    id: asset.id,
    name: asset.name,
    type: typeMap[asset.type] || asset.type,
    apy: Number(asset.apy),
    durationDays: asset.durationDays,
    riskScore: asset.riskScore,
    yieldConfidence: asset.yieldConfidence,
    yieldBreakdown: asset.yieldBreakdowns.map((yb) => ({
      label: yb.label,
      percentage: Number(yb.percentage),
      description: yb.description,
      impact: yb.impact as 'positive' | 'negative' | 'neutral',
    })),
    confidenceFactors: asset.confidenceFactors.map((cf) => ({
      label: cf.label,
      score: cf.score,
      description: cf.description,
    })),
    realWorld: asset.realWorldInfo
      ? {
          title: asset.realWorldInfo.title,
          summary: asset.realWorldInfo.summary ?? '',
          keyFacts: asset.realWorldKeyFacts.map((kf) => ({
            label: kf.label,
            value: kf.value,
          })),
          verification: asset.realWorldVerifications.map((v) => v.item),
        }
      : null,
    aumUsd: Number(asset.aumUsd),
    price: Number(asset.price),
    status: asset.status,
    nextPayoutDate: asset.nextPayoutDate.toISOString().split('T')[0],
    yieldHistory: asset.yieldHistory.map((yh) => Number(yh.yieldValue)),
    navHistory: asset.navHistory.map((nh) => Number(nh.navValue)),
    description: asset.description,
    cashFlowSources: asset.cashFlowSources.map((cfs) => ({
      source: cfs.source,
      frequency: cfs.frequency,
      description: cfs.description,
    })),
    tokenAddress: asset.tokenAddress,
    distributorAddress: asset.distributorAddress,
    events: asset.events.map((e) => ({
      type: e.type,
      amount: Number(e.amount),
      date: e.eventDate.toISOString().split('T')[0],
      txHash: e.txHash ?? '',
    })),
  }

  return NextResponse.json({ asset: transformedAsset, userPosition })
}

import { NextResponse } from 'next/server'
import { assets } from '@/lib/mockData'

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const minAPY = searchParams.get('minAPY')
  const maxRisk = searchParams.get('maxRisk')

  const filtered = assets.filter((asset) => {
    const matchesType = !type || asset.type === type
    const matchesApy = !minAPY || asset.apy >= Number(minAPY)
    const matchesRisk = !maxRisk || asset.riskScore <= Number(maxRisk)
    return matchesType && matchesApy && matchesRisk
  })

  return NextResponse.json({
    assets: filtered,
    total: filtered.length,
    page: 1,
    pageSize: 20,
  })
}

import { useState, useEffect } from 'react'
import usePortfolio from '@/lib/hooks/usePortfolio'
import { getRiskLevel, type Asset } from '@/lib/mockData'

export default function usePortfolioSummary() {
  const {
    getTotalAUM,
    getWeightedAPY,
    getRiskScore,
    getAllocation,
    portfolio,
  } = usePortfolio()
  const [assets, setAssets] = useState<Asset[]>([])

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/assets')
        if (!response.ok) return
        const data = await response.json()
        // Map database type format (real_estate) to frontend format (real-estate)
        const mappedAssets = data.assets.map((asset: any) => ({
          ...asset,
          type: asset.type === 'real_estate' ? 'real-estate' : asset.type,
        }))
        setAssets(mappedAssets)
      } catch (err) {
        console.error('Error fetching assets:', err)
      }
    }

    fetchAssets()
  }, [])

  const totalAUM = getTotalAUM()
  const weightedAPY = getWeightedAPY()
  const riskScore = getRiskScore()
  const riskLevel = getRiskLevel(riskScore)
  const allocation = getAllocation()

  // Get next payout date
  const getNextPayout = () => {
    const holdingAssets = Object.keys(portfolio.holdings)
      .map((id) => assets.find((a) => a.id === id))
      .filter(Boolean)
    if (holdingAssets.length === 0) return 'N/A'

    const sorted = holdingAssets.sort(
      (a, b) =>
        new Date(a!.nextPayoutDate).getTime() -
        new Date(b!.nextPayoutDate).getTime(),
    )
    return new Date(sorted[0]!.nextPayoutDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const yieldCurve = Array.from({ length: 30 }, (_, i) => {
    const base = 0.02 + i * 0.00015
    const realized = base + (Math.random() - 0.5) * 0.002
    const projected = base + 0.0015 + (Math.random() - 0.5) * 0.001
    return {
      day: i + 1,
      realized: Number(realized.toFixed(4)),
      projected: Number(projected.toFixed(4)),
    }
  })

  const payoutEvents = [
    { day: 7, label: 'Payout' },
    { day: 15, label: 'Distribution' },
    { day: 23, label: 'Payout' },
  ]

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'text-green-400'
      case 'Medium':
        return 'text-yellow-400'
      case 'High':
        return 'text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return {
    totalAUM,
    weightedAPY,
    riskScore,
    riskLevel,
    allocation,
    getNextPayout,
    getRiskColor,
    yieldCurve,
    payoutEvents,
  }
}

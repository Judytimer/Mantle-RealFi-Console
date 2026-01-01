import usePortfolio from '@/lib/hooks/usePortfolio'
import { getRiskLevel, assets } from '@/lib/mockData'

export default function usePortfolioSummary() {
  const {
    getTotalAUM,
    getWeightedAPY,
    getRiskScore,
    getAllocation,
    portfolio,
  } = usePortfolio()

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

  // Mock yield curve data
  const yieldCurve = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    yield: 0.02 + Math.random() * 0.01 + i * 0.0002,
  }))

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
  }
}

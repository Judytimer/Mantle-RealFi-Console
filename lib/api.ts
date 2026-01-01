import { assets, initialPortfolio, getAssetTypeLabel } from '@/lib/mockData'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchAssets = async () => {
  await delay(300)
  return {
    assets,
    total: assets.length,
    page: 1,
    pageSize: 20,
  }
}

export const fetchAssetById = async (id: string) => {
  await delay(200)
  return assets.find((asset) => asset.id === id) ?? null
}

export const fetchPortfolio = async () => {
  await delay(250)
  const { holdings, cashUsd } = initialPortfolio
  const positions = Object.entries(holdings)
    .map(([assetId, shares]) => {
      const asset = assets.find((item) => item.id === assetId)
      if (!asset) return null
      const value = shares * asset.price
      return {
        assetId,
        shares,
        value,
        apy: asset.apy,
        riskScore: asset.riskScore,
        type: asset.type,
      }
    })
    .filter(Boolean)

  const totalAUM = positions.reduce(
    (sum, position) => sum + (position?.value ?? 0),
    cashUsd,
  )
  const weightedAPY =
    totalAUM === 0
      ? 0
      : positions.reduce((sum, position) => {
          if (!position) return sum
          return sum + (position.value / totalAUM) * position.apy
        }, 0)
  const riskScore =
    totalAUM === 0
      ? 0
      : Math.round(
          positions.reduce((sum, position) => {
            if (!position) return sum
            return sum + (position.value / totalAUM) * position.riskScore
          }, 0),
        )

  const allocation = positions.reduce<Record<string, number>>(
    (map, position) => {
      if (!position) return map
      const label = getAssetTypeLabel(position.type)
      map[label] = (map[label] ?? 0) + position.value
      return map
    },
    { Cash: cashUsd },
  )

  return {
    portfolio: {
      userId: 'demo-user',
      totalAUM,
      weightedAPY: Number(weightedAPY.toFixed(2)),
      riskScore,
      positions: positions.filter(Boolean),
      allocation,
    },
  }
}

const copilotResponses: Record<
  string,
  {
    summary: string
    recommendations: { action: string; reason: string }[]
    riskNotes: string
  }
> = {
  risk: {
    summary:
      'Your portfolio has a moderate risk profile with a weighted score of 28/100. The main risk contributors are your Credit positions and SaaS Revenue Pool.',
    recommendations: [
      {
        action: 'Consider increasing Treasury allocation',
        reason: 'Treasury positions provide stability with lowest risk.',
      },
      {
        action: 'Monitor Credit exposure',
        reason: 'Higher yield comes with elevated counterparty risk.',
      },
    ],
    riskNotes:
      'Risk scores are simulated based on asset class volatility and duration. Past performance does not guarantee future results.',
  },
  conservative: {
    summary:
      'For a conservative 6% target APY, shift allocation towards treasuries and real estate, reducing credit exposure.',
    recommendations: [
      {
        action: 'Increase Treasury allocation by 30%',
        reason: 'Stable yield with minimal risk.',
      },
      {
        action: 'Add to Real Estate holdings',
        reason: 'Balanced yield with tangible collateral.',
      },
      {
        action: 'Reduce Credit exposure by 40%',
        reason: 'Lower portfolio volatility.',
      },
    ],
    riskNotes:
      'Conservative allocation may limit upside potential. Rebalancing involves transaction costs. Yields are not guaranteed.',
  },
  payout: {
    summary:
      'Upcoming payouts are concentrated in the next 2 weeks across credit pools and revenue assets.',
    recommendations: [
      {
        action: 'Trade Finance Pool: Jan 2',
        reason: 'Maturing position with final distribution.',
      },
      {
        action: 'Supply Chain Factoring: Jan 5',
        reason: 'Regular monthly payout cycle.',
      },
      {
        action: 'SaaS Revenue Pool: Jan 8',
        reason: 'Monthly revenue share distribution.',
      },
    ],
    riskNotes:
      'Payout amounts are estimates based on historical distributions. Actual amounts may vary.',
  },
  default: {
    summary:
      'I can help you understand your RWA portfolio, analyze risks, and suggest allocation adjustments. What would you like to explore?',
    recommendations: [
      {
        action: 'Ask about portfolio risk analysis',
        reason: 'Understand your exposure across asset classes.',
      },
      {
        action: 'Request conservative allocation advice',
        reason: 'Optimize for lower volatility and stable yields.',
      },
      {
        action: 'Check upcoming payouts',
        reason: 'Plan around distribution schedules.',
      },
    ],
    riskNotes:
      'This is a demo environment. All yields and recommendations are simulated. Not financial advice.',
  },
}

export const postCopilotMessage = async (content: string) => {
  await delay(700)
  const lowerContent = content.toLowerCase()
  if (lowerContent.includes('risk') || lowerContent.includes('风险'))
    return copilotResponses.risk
  if (
    lowerContent.includes('conservative') ||
    lowerContent.includes('保守') ||
    lowerContent.includes('6%')
  )
    return copilotResponses.conservative
  if (
    lowerContent.includes('payout') ||
    lowerContent.includes('分红') ||
    lowerContent.includes('next')
  )
    return copilotResponses.payout
  return copilotResponses.default
}

export const postTransaction = async () => {
  await delay(500)
  return {
    transaction: {
      id: `tx-${Date.now()}`,
      status: 'Completed',
      txHash: '0xmock...',
      timestamp: new Date().toISOString(),
    },
  }
}

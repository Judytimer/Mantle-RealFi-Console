const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const copilotResponses = {
  risk: {
    summary:
      "Your portfolio leans toward medium-risk assets with strong yield potential. The largest risk drivers are private credit and alternatives, which can be more sensitive to market shifts.",
    score: 62,
    insights: [
      'Private credit allocation increases default risk exposure.',
      'Real estate positions provide stability but are less liquid.',
      'Fixed income holdings help reduce overall volatility.',
    ],
    recommendations: [
      {
        action: 'Increase fixed income exposure',
        reason: 'Lower volatility and stabilize cash flows.',
      },
      {
        action: 'Reduce alternatives allocation',
        reason: 'Improve risk-adjusted returns.',
      },
      {
        action: 'Diversify real estate holdings',
        reason: 'Mitigate property-specific downturns.',
      },
    ],
    riskNotes:
      'This is a demo environment. All yields and recommendations are simulated. Not financial advice.',
  },
  conservative: {
    summary:
      'For a conservative portfolio, aim to increase fixed income and reduce exposure to higher-risk alternatives. Target a weighted APY of 5-6% with lower volatility.',
    score: 45,
    insights: [
      'Fixed income should represent 50%+ of allocation.',
      'Limit private credit exposure to under 15%.',
      'Maintain 5-10% cash buffer for liquidity.',
    ],
    recommendations: [
      {
        action: 'Shift 20% to treasury tokens',
        reason: 'Provides predictable yield with low risk.',
      },
      {
        action: 'Reduce private credit by 10%',
        reason: 'Lower default exposure.',
      },
    ],
    riskNotes:
      'This is a demo environment. All yields and recommendations are simulated. Not financial advice.',
  },
  payout: {
    summary:
      'Your next payout is expected within the next 7 days from your real estate holdings. Total estimated payout: $12,450.',
    score: 0,
    insights: [
      'Real estate payouts are monthly and predictable.',
      'Private credit payouts are quarterly with higher variability.',
    ],
    recommendations: [
      {
        action: 'Reinvest upcoming payouts',
        reason: 'Compound yields over time.',
      },
      {
        action: 'Set payout to cash buffer',
        reason: 'Improve liquidity for future opportunities.',
      },
    ],
    riskNotes:
      'This is a demo environment. All yields and recommendations are simulated. Not financial advice.',
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
  if (lowerContent.includes('risk') || lowerContent.includes('风险')) {
    return copilotResponses.risk
  }
  if (
    lowerContent.includes('conservative') ||
    lowerContent.includes('保守') ||
    lowerContent.includes('6%')
  ) {
    return copilotResponses.conservative
  }
  if (
    lowerContent.includes('payout') ||
    lowerContent.includes('分红') ||
    lowerContent.includes('next')
  ) {
    return copilotResponses.payout
  }
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

export type AssetType = 'real-estate' | 'bonds' | 'invoices' | 'cash-flow'
export type AssetStatus = 'Active' | 'Maturing' | 'Paused'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface Asset {
  id: string
  name: string
  type: AssetType
  apy: number
  durationDays: number
  riskScore: number
  aumUsd: number
  price: number
  status: AssetStatus
  nextPayoutDate: string
  yieldHistory: number[]
  navHistory: number[]
  description: string
  cashFlowSources: {
    source: string
    frequency: string
    description: string
  }[]
  tokenAddress: string
  distributorAddress: string
  events: {
    type: 'Deposit' | 'Withdraw' | 'Payout'
    amount: number
    date: string
    txHash: string
  }[]
}

export interface Portfolio {
  holdings: Record<string, number>
  cashUsd: number
  lastUpdated: string
}

// Generate 30 days of mock history data
const generateHistory = (base: number, variance: number): number[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const trend = i * 0.001
    const noise = (Math.random() - 0.5) * variance
    return Number((base + trend + noise).toFixed(4))
  })
}

const generateNavHistory = (base: number): number[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const trend = i * 0.002
    const noise = (Math.random() - 0.5) * 0.02
    return Number((base * (1 + trend + noise)).toFixed(2))
  })
}

export const assets: Asset[] = [
  {
    id: 'mre-manhattan-01',
    name: 'Manhattan Commercial Complex',
    type: 'real-estate',
    apy: 8.2,
    durationDays: 365,
    riskScore: 25,
    aumUsd: 12500000,
    price: 1000,
    status: 'Active',
    nextPayoutDate: '2025-01-15',
    yieldHistory: generateHistory(0.022, 0.003),
    navHistory: generateNavHistory(1000),
    description:
      'Class A commercial real estate in Midtown Manhattan. Triple-net lease structure with Fortune 500 tenants.',
    cashFlowSources: [
      {
        source: 'Rent Income',
        frequency: 'Monthly',
        description: 'Base rent from 15 commercial tenants',
      },
      {
        source: 'Parking Revenue',
        frequency: 'Monthly',
        description: 'Underground parking facility',
      },
    ],
    tokenAddress: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    distributorAddress: '0xdist1234567890abcdef1234567890abcdef1234',
    events: [
      {
        type: 'Payout',
        amount: 85000,
        date: '2024-12-15',
        txHash: '0xabc123...',
      },
      {
        type: 'Deposit',
        amount: 250000,
        date: '2024-12-10',
        txHash: '0xdef456...',
      },
      {
        type: 'Payout',
        amount: 82000,
        date: '2024-11-15',
        txHash: '0xghi789...',
      },
      {
        type: 'Withdraw',
        amount: 50000,
        date: '2024-11-05',
        txHash: '0xjkl012...',
      },
      {
        type: 'Deposit',
        amount: 100000,
        date: '2024-10-20',
        txHash: '0xmno345...',
      },
    ],
  },
  {
    id: 'mre-miami-02',
    name: 'Miami Waterfront Residences',
    type: 'real-estate',
    apy: 9.5,
    durationDays: 180,
    riskScore: 35,
    aumUsd: 8200000,
    price: 500,
    status: 'Active',
    nextPayoutDate: '2025-01-20',
    yieldHistory: generateHistory(0.026, 0.004),
    navHistory: generateNavHistory(500),
    description:
      'Luxury residential development in Miami Beach. Short-term rental income with high occupancy rates.',
    cashFlowSources: [
      {
        source: 'Rental Income',
        frequency: 'Monthly',
        description: 'Short-term vacation rentals',
      },
      {
        source: 'Amenity Fees',
        frequency: 'Quarterly',
        description: 'Pool, gym, concierge services',
      },
    ],
    tokenAddress: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
    distributorAddress: '0xdist2345678901abcdef1234567890abcdef2345',
    events: [
      {
        type: 'Payout',
        amount: 65000,
        date: '2024-12-20',
        txHash: '0xpqr678...',
      },
      {
        type: 'Deposit',
        amount: 180000,
        date: '2024-12-12',
        txHash: '0xstu901...',
      },
      {
        type: 'Payout',
        amount: 62000,
        date: '2024-11-20',
        txHash: '0xvwx234...',
      },
      {
        type: 'Deposit',
        amount: 75000,
        date: '2024-11-08',
        txHash: '0xyza567...',
      },
      {
        type: 'Payout',
        amount: 58000,
        date: '2024-10-20',
        txHash: '0xbcd890...',
      },
    ],
  },
  {
    id: 'bond-treasury-01',
    name: 'US Treasury 2Y Tokenized',
    type: 'bonds',
    apy: 4.8,
    durationDays: 730,
    riskScore: 5,
    aumUsd: 25000000,
    price: 100,
    status: 'Active',
    nextPayoutDate: '2025-02-01',
    yieldHistory: generateHistory(0.013, 0.001),
    navHistory: generateNavHistory(100),
    description:
      'Tokenized exposure to US Treasury 2-year notes. Lowest risk, sovereign-backed yield.',
    cashFlowSources: [
      {
        source: 'Coupon Payment',
        frequency: 'Semi-annual',
        description: 'Fixed coupon from underlying treasuries',
      },
    ],
    tokenAddress: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
    distributorAddress: '0xdist3456789012abcdef1234567890abcdef3456',
    events: [
      {
        type: 'Payout',
        amount: 250000,
        date: '2024-12-01',
        txHash: '0xefg123...',
      },
      {
        type: 'Deposit',
        amount: 500000,
        date: '2024-11-28',
        txHash: '0xhij456...',
      },
      {
        type: 'Deposit',
        amount: 1000000,
        date: '2024-11-15',
        txHash: '0xklm789...',
      },
      {
        type: 'Withdraw',
        amount: 200000,
        date: '2024-10-30',
        txHash: '0xnop012...',
      },
      {
        type: 'Payout',
        amount: 245000,
        date: '2024-10-01',
        txHash: '0xqrs345...',
      },
    ],
  },
  {
    id: 'bond-corp-02',
    name: 'Investment Grade Corporate',
    type: 'bonds',
    apy: 6.2,
    durationDays: 365,
    riskScore: 18,
    aumUsd: 15000000,
    price: 100,
    status: 'Active',
    nextPayoutDate: '2025-01-10',
    yieldHistory: generateHistory(0.017, 0.002),
    navHistory: generateNavHistory(100),
    description:
      'Diversified portfolio of investment-grade corporate bonds. BBB+ average rating.',
    cashFlowSources: [
      {
        source: 'Coupon Payment',
        frequency: 'Quarterly',
        description: 'Blended coupons from corporate issuers',
      },
    ],
    tokenAddress: '0x4d5e6f7890abcdef1234567890abcdef12345678',
    distributorAddress: '0xdist4567890123abcdef1234567890abcdef4567',
    events: [
      {
        type: 'Payout',
        amount: 155000,
        date: '2024-12-10',
        txHash: '0xtuv678...',
      },
      {
        type: 'Deposit',
        amount: 350000,
        date: '2024-12-05',
        txHash: '0xwxy901...',
      },
      {
        type: 'Payout',
        amount: 150000,
        date: '2024-11-10',
        txHash: '0xzab234...',
      },
      {
        type: 'Withdraw',
        amount: 100000,
        date: '2024-10-25',
        txHash: '0xcde567...',
      },
      {
        type: 'Deposit',
        amount: 200000,
        date: '2024-10-15',
        txHash: '0xfgh890...',
      },
    ],
  },
  {
    id: 'inv-factoring-01',
    name: 'Supply Chain Factoring',
    type: 'invoices',
    apy: 11.5,
    durationDays: 90,
    riskScore: 45,
    aumUsd: 5500000,
    price: 100,
    status: 'Active',
    nextPayoutDate: '2025-01-05',
    yieldHistory: generateHistory(0.032, 0.005),
    navHistory: generateNavHistory(100),
    description:
      'Invoice factoring for verified supply chain participants. Higher yield, shorter duration.',
    cashFlowSources: [
      {
        source: 'Invoice Discount',
        frequency: 'On Settlement',
        description: 'Discount fee from invoice purchases',
      },
      {
        source: 'Late Fees',
        frequency: 'Variable',
        description: 'Penalty fees for late payments',
      },
    ],
    tokenAddress: '0x5e6f7890abcdef1234567890abcdef1234567890',
    distributorAddress: '0xdist5678901234abcdef1234567890abcdef5678',
    events: [
      {
        type: 'Payout',
        amount: 52000,
        date: '2024-12-25',
        txHash: '0xijk123...',
      },
      {
        type: 'Deposit',
        amount: 120000,
        date: '2024-12-18',
        txHash: '0xlmn456...',
      },
      {
        type: 'Payout',
        amount: 48000,
        date: '2024-12-05',
        txHash: '0xopq789...',
      },
      {
        type: 'Withdraw',
        amount: 30000,
        date: '2024-11-28',
        txHash: '0xrst012...',
      },
      {
        type: 'Payout',
        amount: 45000,
        date: '2024-11-15',
        txHash: '0xuvw345...',
      },
    ],
  },
  {
    id: 'inv-trade-02',
    name: 'Trade Finance Pool',
    type: 'invoices',
    apy: 10.2,
    durationDays: 60,
    riskScore: 40,
    aumUsd: 4200000,
    price: 100,
    status: 'Maturing',
    nextPayoutDate: '2025-01-02',
    yieldHistory: generateHistory(0.028, 0.004),
    navHistory: generateNavHistory(100),
    description:
      'Cross-border trade finance with credit insurance. Diversified across geographies.',
    cashFlowSources: [
      {
        source: 'Trade Discount',
        frequency: 'On Settlement',
        description: 'Discount from trade receivables',
      },
    ],
    tokenAddress: '0x6f7890abcdef1234567890abcdef123456789012',
    distributorAddress: '0xdist6789012345abcdef1234567890abcdef6789',
    events: [
      {
        type: 'Payout',
        amount: 35000,
        date: '2024-12-20',
        txHash: '0xxyz678...',
      },
      {
        type: 'Deposit',
        amount: 80000,
        date: '2024-12-14',
        txHash: '0xabc901...',
      },
      {
        type: 'Payout',
        amount: 32000,
        date: '2024-12-02',
        txHash: '0xdef234...',
      },
      {
        type: 'Deposit',
        amount: 60000,
        date: '2024-11-22',
        txHash: '0xghi567...',
      },
      {
        type: 'Withdraw',
        amount: 25000,
        date: '2024-11-10',
        txHash: '0xjkl890...',
      },
    ],
  },
  {
    id: 'cf-saas-01',
    name: 'SaaS Revenue Pool',
    type: 'cash-flow',
    apy: 12.8,
    durationDays: 180,
    riskScore: 55,
    aumUsd: 3800000,
    price: 250,
    status: 'Active',
    nextPayoutDate: '2025-01-08',
    yieldHistory: generateHistory(0.035, 0.006),
    navHistory: generateNavHistory(250),
    description:
      'Revenue-backed financing for B2B SaaS companies. Monthly recurring revenue as collateral.',
    cashFlowSources: [
      {
        source: 'MRR Share',
        frequency: 'Monthly',
        description: 'Percentage of monthly recurring revenue',
      },
      {
        source: 'Success Fee',
        frequency: 'Quarterly',
        description: 'Performance-based bonus',
      },
    ],
    tokenAddress: '0x7890abcdef1234567890abcdef12345678901234',
    distributorAddress: '0xdist7890123456abcdef1234567890abcdef7890',
    events: [
      {
        type: 'Payout',
        amount: 40000,
        date: '2024-12-22',
        txHash: '0xmno123...',
      },
      {
        type: 'Deposit',
        amount: 95000,
        date: '2024-12-15',
        txHash: '0xpqr456...',
      },
      {
        type: 'Payout',
        amount: 38000,
        date: '2024-12-08',
        txHash: '0xstu789...',
      },
      {
        type: 'Withdraw',
        amount: 20000,
        date: '2024-11-30',
        txHash: '0xvwx012...',
      },
      {
        type: 'Payout',
        amount: 36000,
        date: '2024-11-22',
        txHash: '0xyza345...',
      },
    ],
  },
  {
    id: 'cf-royalty-02',
    name: 'Music Royalties Fund',
    type: 'cash-flow',
    apy: 7.5,
    durationDays: 365,
    riskScore: 30,
    aumUsd: 6500000,
    price: 50,
    status: 'Active',
    nextPayoutDate: '2025-01-25',
    yieldHistory: generateHistory(0.021, 0.003),
    navHistory: generateNavHistory(50),
    description:
      'Streaming royalties from established music catalogs. Stable, recurring income streams.',
    cashFlowSources: [
      {
        source: 'Streaming Royalties',
        frequency: 'Monthly',
        description: 'Revenue from Spotify, Apple Music, etc.',
      },
      {
        source: 'Sync Licensing',
        frequency: 'Quarterly',
        description: 'TV, film, and ad placements',
      },
    ],
    tokenAddress: '0x890abcdef1234567890abcdef1234567890123456',
    distributorAddress: '0xdist8901234567abcdef1234567890abcdef8901',
    events: [
      {
        type: 'Payout',
        amount: 40500,
        date: '2024-12-25',
        txHash: '0xbcd678...',
      },
      {
        type: 'Deposit',
        amount: 110000,
        date: '2024-12-18',
        txHash: '0xefg901...',
      },
      {
        type: 'Payout',
        amount: 39000,
        date: '2024-11-25',
        txHash: '0xhij234...',
      },
      {
        type: 'Deposit',
        amount: 85000,
        date: '2024-11-12',
        txHash: '0xklm567...',
      },
      {
        type: 'Payout',
        amount: 38000,
        date: '2024-10-25',
        txHash: '0xnop890...',
      },
    ],
  },
]

export const initialPortfolio: Portfolio = {
  holdings: {
    'mre-manhattan-01': 25,
    'mre-miami-02': 40,
    'bond-treasury-01': 500,
    'bond-corp-02': 200,
    'inv-factoring-01': 100,
    'cf-saas-01': 16,
    'cf-royalty-02': 260,
  },
  cashUsd: 12500,
  lastUpdated: new Date().toISOString(),
}

export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 20) return 'Low'
  if (score <= 45) return 'Medium'
  return 'High'
}

export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(2)}`
}

export const formatDuration = (days: number): string => {
  if (days >= 365) {
    const years = days / 365
    return years === 1 ? '1Y' : `${years.toFixed(1)}Y`
  }
  return `${days}D`
}

export const getAssetTypeLabel = (type: AssetType): string => {
  const labels: Record<AssetType, string> = {
    'real-estate': 'Real Estate',
    bonds: 'Bonds',
    invoices: 'Invoices',
    'cash-flow': 'Cash Flow',
  }
  return labels[type]
}

export const getAssetTypeColor = (type: AssetType): string => {
  const colors: Record<AssetType, string> = {
    'real-estate': 'bg-blue-500/20 text-blue-400',
    bonds: 'bg-green-500/20 text-green-400',
    invoices: 'bg-yellow-500/20 text-yellow-400',
    'cash-flow': 'bg-purple-500/20 text-purple-400',
  }
  return colors[type]
}

export type AssetType = 'treasury' | 'real-estate' | 'credit' | 'cash'
export type AssetStatus = 'Active' | 'Maturing' | 'Paused'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface YieldBreakdownItem {
  label: string
  percentage: number
  description: string
  impact: 'positive' | 'negative' | 'neutral'
}

export interface ConfidenceFactor {
  label: string
  score: number
  description: string
}

export interface RealWorldInfo {
  title: string
  summary: string
  keyFacts: { label: string; value: string }[]
  verification: string[]
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  apy: number
  durationDays: number
  riskScore: number
  yieldConfidence: number
  yieldBreakdown: YieldBreakdownItem[]
  confidenceFactors: ConfidenceFactor[]
  realWorld: RealWorldInfo
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
    yieldConfidence: 82,
    yieldBreakdown: [
      {
        label: 'Base Rent Yield',
        percentage: 68,
        description: 'Net lease income from tenants.',
        impact: 'positive',
      },
      {
        label: 'Operating Fees',
        percentage: 12,
        description: 'Maintenance, insurance, and admin costs.',
        impact: 'negative',
      },
      {
        label: 'Location Premium',
        percentage: 20,
        description: 'Prime Midtown demand supports yield.',
        impact: 'positive',
      },
    ],
    confidenceFactors: [
      {
        label: 'Tenant Quality',
        score: 86,
        description: 'Weighted by Fortune 500 occupancy.',
      },
      {
        label: 'Lease Stability',
        score: 78,
        description: 'Average remaining lease term is 4.2 years.',
      },
      {
        label: 'On-chain Disclosure',
        score: 92,
        description: 'Monthly cash-flow attestations published.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: Manhattan Commercial Complex',
      summary:
        'An SPV holds a Class A office property with triple-net leases and audited rent rolls.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'New York, US' },
        { label: 'Collateral', value: 'First-lien claim on rental cash flow' },
        { label: 'Issuer', value: 'Manhattan SPV LLC' },
      ],
      verification: [
        'Property registry referenced in monthly attestations',
        'Rent roll audited quarterly by third party',
        'Insurance certificates refreshed annually',
      ],
    },
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
    yieldConfidence: 74,
    yieldBreakdown: [
      {
        label: 'Rental Yield',
        percentage: 62,
        description: 'Short-term rental income net of vacancy.',
        impact: 'positive',
      },
      {
        label: 'Seasonality',
        percentage: 14,
        description: 'Tourism cycles reduce consistency.',
        impact: 'negative',
      },
      {
        label: 'Amenity Premium',
        percentage: 24,
        description: 'Higher ADR from beachfront access.',
        impact: 'positive',
      },
    ],
    confidenceFactors: [
      {
        label: 'Occupancy Trend',
        score: 70,
        description: 'Trailing 12-month occupancy at 82%.',
      },
      {
        label: 'Revenue Volatility',
        score: 63,
        description: 'Seasonal swings remain material.',
      },
      {
        label: 'Data Freshness',
        score: 88,
        description: 'Weekly booking data posted to chain.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: Miami Waterfront Residences',
      summary:
        'Tokenized revenue share from a managed beachfront residential portfolio.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'Florida, US' },
        { label: 'Collateral', value: 'Rental income escrow + property lien' },
        { label: 'Operator', value: 'Atlantic Shore Management' },
      ],
      verification: [
        'Monthly occupancy report hashed on-chain',
        'Property insurance verified in escrow',
        'Quarterly appraisal updates shared',
      ],
    },
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
    type: 'treasury',
    apy: 4.8,
    durationDays: 730,
    riskScore: 5,
    yieldConfidence: 95,
    yieldBreakdown: [
      {
        label: 'Coupon Yield',
        percentage: 85,
        description: 'Fixed coupon from US Treasury notes.',
        impact: 'positive',
      },
      {
        label: 'Custody Fees',
        percentage: 5,
        description: 'Tokenization and custody overhead.',
        impact: 'negative',
      },
      {
        label: 'Liquidity Buffer',
        percentage: 10,
        description: 'Treasury market depth reduces risk.',
        impact: 'positive',
      },
    ],
    confidenceFactors: [
      {
        label: 'Issuer Credit',
        score: 98,
        description: 'Sovereign-backed US Treasury.',
      },
      {
        label: 'Duration Risk',
        score: 90,
        description: 'Low duration volatility for 2Y tenor.',
      },
      {
        label: 'Settlement Transparency',
        score: 92,
        description: 'Daily NAV proofs on chain.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: US Treasury 2Y Tokenized',
      summary:
        'A regulated custodian holds US Treasury notes with daily proof of reserves.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'US' },
        { label: 'Collateral', value: 'Treasury notes held in custody' },
        { label: 'Custodian', value: 'Regulated trust company' },
      ],
      verification: [
        'Daily proof-of-reserve attestation',
        'CUSIP holdings reported weekly',
        'Custody statements signed by auditor',
      ],
    },
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
    type: 'treasury',
    apy: 6.2,
    durationDays: 365,
    riskScore: 18,
    yieldConfidence: 88,
    yieldBreakdown: [
      {
        label: 'Corporate Coupon',
        percentage: 72,
        description: 'Investment-grade coupon stream.',
        impact: 'positive',
      },
      {
        label: 'Credit Spread',
        percentage: 18,
        description: 'AAA/BBB mix premium.',
        impact: 'positive',
      },
      {
        label: 'Management Fees',
        percentage: 10,
        description: 'Portfolio servicing and admin.',
        impact: 'negative',
      },
    ],
    confidenceFactors: [
      {
        label: 'Issuer Mix',
        score: 85,
        description: 'Diversified across 24 issuers.',
      },
      {
        label: 'Default History',
        score: 90,
        description: 'No defaults in past 36 months.',
      },
      {
        label: 'Disclosure Cadence',
        score: 78,
        description: 'Monthly bond holdings updates.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: Investment Grade Corporate',
      summary:
        'A basket of BBB+ average corporate bonds with monthly exposure reporting.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'US/EU diversified' },
        { label: 'Collateral', value: 'Senior unsecured corporate debt' },
        { label: 'Manager', value: 'Credit index manager' },
      ],
      verification: [
        'Monthly holdings file hashed on chain',
        'Issuer credit ratings updated quarterly',
        'Custody statements signed monthly',
      ],
    },
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
    type: 'credit',
    apy: 11.5,
    durationDays: 90,
    riskScore: 45,
    yieldConfidence: 63,
    yieldBreakdown: [
      {
        label: 'Invoice Discount',
        percentage: 58,
        description: 'Discount margin on invoices.',
        impact: 'positive',
      },
      {
        label: 'Counterparty Risk',
        percentage: 22,
        description: 'SME credit exposure premium.',
        impact: 'negative',
      },
      {
        label: 'Acceleration Premium',
        percentage: 20,
        description: 'Faster settlement yields boost.',
        impact: 'positive',
      },
    ],
    confidenceFactors: [
      {
        label: 'Buyer Quality',
        score: 68,
        description: 'Top 20 buyers cover 72% of volume.',
      },
      {
        label: 'Invoice Aging',
        score: 60,
        description: 'Average DSO 42 days.',
      },
      {
        label: 'Audit Coverage',
        score: 70,
        description: 'Monthly receivable audits.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: Supply Chain Factoring',
      summary:
        'Tokenized participation in verified invoice factoring for tier-1 suppliers.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'Singapore' },
        { label: 'Collateral', value: 'Invoice receivables pledged' },
        { label: 'Originator', value: 'Supply chain finance desk' },
      ],
      verification: [
        'Invoice batches verified weekly',
        'Buyer acceptance proofs stored on chain',
        'Delinquency statistics published monthly',
      ],
    },
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
    type: 'credit',
    apy: 10.2,
    durationDays: 60,
    riskScore: 40,
    yieldConfidence: 66,
    yieldBreakdown: [
      {
        label: 'Trade Discount',
        percentage: 64,
        description: 'Short-dated trade receivables yield.',
        impact: 'positive',
      },
      {
        label: 'Insurance Costs',
        percentage: 12,
        description: 'Credit insurance and hedging.',
        impact: 'negative',
      },
      {
        label: 'Cross-border Premium',
        percentage: 24,
        description: 'FX and shipment risk uplift.',
        impact: 'positive',
      },
    ],
    confidenceFactors: [
      {
        label: 'Insured Coverage',
        score: 72,
        description: '85% of invoices insured.',
      },
      {
        label: 'Settlement Speed',
        score: 67,
        description: 'Median settlement 32 days.',
      },
      {
        label: 'Reporting Cadence',
        score: 80,
        description: 'Bi-weekly pool updates.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: Trade Finance Pool',
      summary:
        'Short-duration trade receivables with credit insurance and diversified counterparties.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'UK/Singapore corridor' },
        { label: 'Collateral', value: 'Insured trade receivables' },
        { label: 'Servicer', value: 'Global trade finance operator' },
      ],
      verification: [
        'Insurance certificates verified monthly',
        'Shipment documents hashed on chain',
        'Pool performance updated bi-weekly',
      ],
    },
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
    type: 'cash',
    apy: 12.8,
    durationDays: 180,
    riskScore: 55,
    yieldConfidence: 58,
    yieldBreakdown: [
      {
        label: 'MRR Share',
        percentage: 55,
        description: 'Revenue share on monthly recurring revenue.',
        impact: 'positive',
      },
      {
        label: 'Churn Impact',
        percentage: 25,
        description: 'Customer churn compresses yield.',
        impact: 'negative',
      },
      {
        label: 'Growth Upside',
        percentage: 20,
        description: 'Expansion revenue upside.',
        impact: 'positive',
      },
    ],
    confidenceFactors: [
      {
        label: 'Customer Concentration',
        score: 52,
        description: 'Top 5 clients are 48% of revenue.',
      },
      {
        label: 'Net Revenue Retention',
        score: 65,
        description: 'Trailing NRR at 112%.',
      },
      {
        label: 'Reporting Reliability',
        score: 68,
        description: 'MRR proofs updated monthly.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: SaaS Revenue Pool',
      summary:
        'Revenue-backed financing tied to contracted SaaS subscriptions.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'US' },
        { label: 'Collateral', value: 'Subscription revenue escrow' },
        { label: 'Manager', value: 'Revenue finance platform' },
      ],
      verification: [
        'MRR ledger snapshots hashed monthly',
        'Bank account escrow statements verified',
        'Customer concentration reports quarterly',
      ],
    },
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
    type: 'cash',
    apy: 7.5,
    durationDays: 365,
    riskScore: 30,
    yieldConfidence: 76,
    yieldBreakdown: [
      {
        label: 'Streaming Royalties',
        percentage: 70,
        description: 'Catalog streaming revenue share.',
        impact: 'positive',
      },
      {
        label: 'Platform Fees',
        percentage: 8,
        description: 'Distribution and admin fees.',
        impact: 'negative',
      },
      {
        label: 'Catalog Stability',
        percentage: 22,
        description: 'Long-tail royalty support.',
        impact: 'positive',
      },
    ],
    confidenceFactors: [
      {
        label: 'Catalog Diversity',
        score: 80,
        description: 'Top 10 tracks are 35% of revenue.',
      },
      {
        label: 'Contract Duration',
        score: 75,
        description: 'Average contract length 3 years.',
      },
      {
        label: 'Reporting Cadence',
        score: 82,
        description: 'Monthly platform statements.',
      },
    ],
    realWorld: {
      title: 'If This Was Real: Music Royalties Fund',
      summary:
        'Tokenized participation in a diversified music royalty catalog.',
      keyFacts: [
        { label: 'Jurisdiction', value: 'UK' },
        { label: 'Collateral', value: 'Royalty contracts and catalog rights' },
        { label: 'Administrator', value: 'Royalty collection agent' },
      ],
      verification: [
        'Platform royalty statements hashed monthly',
        'Catalog valuation updated semi-annually',
        'Collection agent reports on chain',
      ],
    },
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
    treasury: 'Treasury',
    'real-estate': 'Real Estate',
    credit: 'Credit',
    cash: 'Cash',
  }
  return labels[type]
}

export const getAssetTypeColor = (type: AssetType): string => {
  const colors: Record<AssetType, string> = {
    treasury: 'bg-blue-500/20 text-blue-400',
    'real-estate': 'bg-purple-500/20 text-purple-400',
    credit: 'bg-pink-500/20 text-pink-400',
    cash: 'bg-slate-500/20 text-slate-300',
  }
  return colors[type]
}

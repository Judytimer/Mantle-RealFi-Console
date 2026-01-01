'use client'
import { createContext, useState, useEffect, ReactNode } from 'react'

import { Portfolio, initialPortfolio, assets } from '../mockData'

interface PortfolioContextType {
  portfolio: Portfolio
  addPosition: (assetId: string, shares: number) => void
  redeemPosition: (assetId: string, shares: number) => void
  getTotalAUM: () => number
  getWeightedAPY: () => number
  getRiskScore: () => number
  getAllocation: () => { type: string; value: number; percentage: number }[]
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined,
)

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    if (typeof window === 'undefined') return initialPortfolio
    const saved = localStorage.getItem('portfolio')
    return saved ? JSON.parse(saved) : initialPortfolio
  })

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio))
  }, [portfolio])

  const addPosition = (assetId: string, shares: number) => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) return

    const cost = shares * asset.price
    if (cost > portfolio.cashUsd) return

    setPortfolio((prev) => ({
      ...prev,
      holdings: {
        ...prev.holdings,
        [assetId]: (prev.holdings[assetId] || 0) + shares,
      },
      cashUsd: prev.cashUsd - cost,
      lastUpdated: new Date().toISOString(),
    }))
  }

  const redeemPosition = (assetId: string, shares: number) => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) return

    const currentShares = portfolio.holdings[assetId] || 0
    if (shares > currentShares) return

    const value = shares * asset.price

    setPortfolio((prev) => ({
      ...prev,
      holdings: {
        ...prev.holdings,
        [assetId]: currentShares - shares,
      },
      cashUsd: prev.cashUsd + value,
      lastUpdated: new Date().toISOString(),
    }))
  }

  const getTotalAUM = () => {
    let total = portfolio.cashUsd
    Object.entries(portfolio.holdings).forEach(([assetId, shares]) => {
      const asset = assets.find((a) => a.id === assetId)
      if (asset) {
        total += shares * asset.price
      }
    })
    return total
  }

  const getWeightedAPY = () => {
    const totalAUM = getTotalAUM()
    if (totalAUM === 0) return 0

    let weightedSum = 0
    Object.entries(portfolio.holdings).forEach(([assetId, shares]) => {
      const asset = assets.find((a) => a.id === assetId)
      if (asset) {
        const value = shares * asset.price
        weightedSum += (value / totalAUM) * asset.apy
      }
    })
    return weightedSum
  }

  const getRiskScore = () => {
    const totalAUM = getTotalAUM()
    if (totalAUM === 0) return 0

    let weightedSum = 0
    Object.entries(portfolio.holdings).forEach(([assetId, shares]) => {
      const asset = assets.find((a) => a.id === assetId)
      if (asset) {
        const value = shares * asset.price
        weightedSum += (value / totalAUM) * asset.riskScore
      }
    })
    return Math.round(weightedSum)
  }

  const getAllocation = () => {
    const totalAUM = getTotalAUM()
    const allocationMap: Record<string, number> = {
      'Real Estate': 0,
      Bonds: 0,
      Invoices: 0,
      'Cash Flow': 0,
      Cash: portfolio.cashUsd,
    }

    Object.entries(portfolio.holdings).forEach(([assetId, shares]) => {
      const asset = assets.find((a) => a.id === assetId)
      if (asset) {
        const value = shares * asset.price
        const label =
          asset.type === 'real-estate'
            ? 'Real Estate'
            : asset.type === 'bonds'
              ? 'Bonds'
              : asset.type === 'invoices'
                ? 'Invoices'
                : 'Cash Flow'
        allocationMap[label] += value
      }
    })

    return Object.entries(allocationMap)
      .filter(([_, value]) => value > 0)
      .map(([type, value]) => ({
        type,
        value,
        percentage: totalAUM > 0 ? (value / totalAUM) * 100 : 0,
      }))
  }

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        addPosition,
        redeemPosition,
        getTotalAUM,
        getWeightedAPY,
        getRiskScore,
        getAllocation,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

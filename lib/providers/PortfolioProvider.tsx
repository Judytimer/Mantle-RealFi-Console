'use client'
import { createContext, useState, useEffect, ReactNode } from 'react'
import { useAccount } from 'wagmi'

import { Portfolio, initialPortfolio } from '../mockData'

interface PortfolioContextType {
  portfolio: Portfolio
  addPosition: (assetId: string, shares: number) => void
  redeemPosition: (assetId: string, shares: number) => void
  getTotalAUM: () => number
  getWeightedAPY: () => number
  getRiskScore: () => number
  getAllocation: () => { type: string; value: number; percentage: number }[]
  loading: boolean
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined,
)

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { address } = useAccount()
  const [portfolio, setPortfolio] = useState<Portfolio>(initialPortfolio)
  const [loading, setLoading] = useState(true)
  const [apiMetrics, setApiMetrics] = useState<{
    totalAUM: number
    weightedAPY: number
    riskScore: number
    allocation: Record<string, number>
  } | null>(null)

  const fetchPortfolio = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/portfolio')
      if (!response.ok) {
        console.error('Failed to fetch portfolio')
        return
      }
      const data = await response.json()
      // Transform API response to Portfolio format
      const holdings: Record<string, number> = {}
      data.portfolio.positions.forEach((pos: any) => {
        holdings[pos.assetId] = pos.shares
      })

      // Extract cash from allocation or use 0 if not found
      const cashUsd = data.portfolio.allocation?.Cash || 0

      setPortfolio({
        holdings,
        cashUsd,
        lastUpdated: new Date().toISOString(),
      })

      // Store API-provided metrics
      setApiMetrics({
        totalAUM: data.portfolio.totalAUM,
        weightedAPY: data.portfolio.weightedAPY,
        riskScore: data.portfolio.riskScore,
        allocation: data.portfolio.allocation,
      })
    } catch (err) {
      console.error('Error fetching portfolio:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch portfolio on mount
  useEffect(() => {
    fetchPortfolio()
  }, [])

  // Refresh portfolio when wallet address changes
  useEffect(() => {
    if (address) {
      fetchPortfolio()
    }
  }, [address])

  const addPosition = (assetId: string, shares: number) => {
    // TODO: Update database via API endpoint
    // For now, update local state and refetch
    setPortfolio((prev) => ({
      ...prev,
      holdings: {
        ...prev.holdings,
        [assetId]: (prev.holdings[assetId] || 0) + shares,
      },
      lastUpdated: new Date().toISOString(),
    }))
    // Refetch portfolio to sync with database
    setTimeout(() => {
      fetch('/api/portfolio')
        .then((res) => res.json())
        .then((data) => {
          const holdings: Record<string, number> = {}
          data.portfolio.positions.forEach((pos: any) => {
            holdings[pos.assetId] = pos.shares
          })
          const cashUsd = data.portfolio.allocation?.Cash || 0
          setPortfolio({
            holdings,
            cashUsd,
            lastUpdated: new Date().toISOString(),
          })
          setApiMetrics({
            totalAUM: data.portfolio.totalAUM,
            weightedAPY: data.portfolio.weightedAPY,
            riskScore: data.portfolio.riskScore,
            allocation: data.portfolio.allocation,
          })
        })
        .catch(console.error)
    }, 100)
  }

  const redeemPosition = (assetId: string, shares: number) => {
    // TODO: Update database via API endpoint
    // For now, update local state and refetch
    const currentShares = portfolio.holdings[assetId] || 0
    if (shares > currentShares) return

    setPortfolio((prev) => ({
      ...prev,
      holdings: {
        ...prev.holdings,
        [assetId]: currentShares - shares,
      },
      lastUpdated: new Date().toISOString(),
    }))
    // Refetch portfolio to sync with database
    setTimeout(() => {
      fetch('/api/portfolio')
        .then((res) => res.json())
        .then((data) => {
          const holdings: Record<string, number> = {}
          data.portfolio.positions.forEach((pos: any) => {
            holdings[pos.assetId] = pos.shares
          })
          const cashUsd = data.portfolio.allocation?.Cash || 0
          setPortfolio({
            holdings,
            cashUsd,
            lastUpdated: new Date().toISOString(),
          })
          setApiMetrics({
            totalAUM: data.portfolio.totalAUM,
            weightedAPY: data.portfolio.weightedAPY,
            riskScore: data.portfolio.riskScore,
            allocation: data.portfolio.allocation,
          })
        })
        .catch(console.error)
    }, 100)
  }

  const getTotalAUM = () => {
    return apiMetrics?.totalAUM || 0
  }

  const getWeightedAPY = () => {
    return apiMetrics?.weightedAPY || 0
  }

  const getRiskScore = () => {
    return apiMetrics?.riskScore || 0
  }

  const getAllocation = () => {
    if (!apiMetrics?.allocation) {
      return []
    }
    const totalAUM = getTotalAUM()
    return Object.entries(apiMetrics.allocation)
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
        loading,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import usePortfolio from '@/lib/hooks/usePortfolio'
import { assets, getRiskLevel, getAssetTypeLabel, Asset } from '@/lib/mockData'

type SortDirection = 'asc' | 'desc'
type SortField = 'name' | 'apy' | 'durationDays' | 'riskScore' | 'aumUsd'

export default function useAssetsTable() {
  const router = useRouter()
  const { portfolio } = usePortfolio()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('aumUsd')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [modalType, setModalType] = useState<'add' | 'redeem' | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedAssets = useMemo(() => {
    let filtered = assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        getAssetTypeLabel(asset.type)
          .toLowerCase()
          .includes(search.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const modifier = sortDirection === 'asc' ? 1 : -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier
      }
      return ((aVal as number) - (bVal as number)) * modifier
    })
  }, [search, sortField, sortDirection])

  const getRiskBadgeClass = (score: number) => {
    const level = getRiskLevel(score)
    return level === 'Low'
      ? 'risk-low'
      : level === 'Medium'
        ? 'risk-medium'
        : 'risk-high'
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/10 text-green-400'
      case 'Maturing':
        return 'bg-yellow-500/10 text-yellow-400'
      case 'Paused':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return {
    router,
    search,
    portfolio,
    setSearch,
    sortField,
    handleSort,
    setModalType,
    sortedAssets,
    setSelectedAsset,
    getRiskBadgeClass,
    getStatusBadgeClass,
  }
}

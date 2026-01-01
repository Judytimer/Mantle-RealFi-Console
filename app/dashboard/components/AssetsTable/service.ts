import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import usePortfolio from '@/lib/hooks/usePortfolio'
import {
  assets,
  getRiskLevel,
  getAssetTypeLabel,
  type Asset,
  type AssetType,
  type RiskLevel,
} from '@/lib/mockData'

type SortDirection = 'asc' | 'desc'
type SortField = 'name' | 'apy' | 'durationDays' | 'riskScore' | 'aumUsd'
type DurationFilter = 'all' | '0-90' | '91-180' | '181-365' | '365+'
type StatusFilter = 'all' | 'Active' | 'Maturing' | 'Paused'

export default function useAssetsTable() {
  const router = useRouter()
  const { portfolio } = usePortfolio()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('aumUsd')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')
  const [minApy, setMinApy] = useState(0)
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [confidenceRange, setConfidenceRange] = useState<[number, number]>([
    0, 100,
  ])
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
    const filtered = assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        getAssetTypeLabel(asset.type)
          .toLowerCase()
          .includes(search.toLowerCase())
      const matchesType = typeFilter === 'all' || asset.type === typeFilter
      const matchesRisk =
        riskFilter === 'all' || getRiskLevel(asset.riskScore) === riskFilter
      const matchesApy = asset.apy >= minApy
      const matchesDuration =
        durationFilter === 'all' ||
        (durationFilter === '0-90'
          ? asset.durationDays <= 90
          : durationFilter === '91-180'
            ? asset.durationDays > 90 && asset.durationDays <= 180
            : durationFilter === '181-365'
              ? asset.durationDays > 180 && asset.durationDays <= 365
              : asset.durationDays > 365)
      const matchesStatus =
        statusFilter === 'all' || asset.status === statusFilter
      const confidence = asset.yieldConfidence ?? 0
      const matchesConfidence =
        confidence >= confidenceRange[0] && confidence <= confidenceRange[1]
      return (
        matchesSearch &&
        matchesType &&
        matchesRisk &&
        matchesApy &&
        matchesDuration &&
        matchesStatus &&
        matchesConfidence
      )
    })

    return filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const modifier = sortDirection === 'asc' ? 1 : -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier
      }
      return ((aVal as number) - (bVal as number)) * modifier
    })
  }, [
    search,
    sortField,
    sortDirection,
    typeFilter,
    riskFilter,
    minApy,
    durationFilter,
    statusFilter,
    confidenceRange,
  ])

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
    sortField,
    typeFilter,
    riskFilter,
    minApy,
    durationFilter,
    statusFilter,
    confidenceRange,
    selectedAsset,
    modalType,
    setSearch,
    handleSort,
    setTypeFilter,
    setRiskFilter,
    setMinApy,
    setDurationFilter,
    setStatusFilter,
    setConfidenceRange,
    setSelectedAsset,
    setModalType,
    sortedAssets,
    getRiskBadgeClass,
    getStatusBadgeClass,
  }
}

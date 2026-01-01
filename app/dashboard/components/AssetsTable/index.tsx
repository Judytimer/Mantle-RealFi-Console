'use client'
import { Search, ArrowUpDown, Eye, Plus, ArrowDownToLine } from 'lucide-react'

import useAssetsTable from './service'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  formatCurrency,
  formatDuration,
  getRiskLevel,
  getAssetTypeLabel,
  getAssetTypeColor,
} from '@/lib/mockData'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type SortField = 'name' | 'apy' | 'durationDays' | 'riskScore' | 'aumUsd'

export default function AssetsTable() {
  const {
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
  } = useAssetsTable()

  const SortHeader: React.FC<{
    field: SortField
    children: React.ReactNode
  }> = ({ field, children }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown
        className={`w-3 h-3 ${sortField === field ? 'text-primary' : ''}`}
      />
    </Button>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Assets
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64 h-9 bg-secondary border-border"
          />
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="table-header">
                <SortHeader field="name">Asset</SortHeader>
              </TableHead>
              <TableHead className="table-header text-right">
                <SortHeader field="apy">APY</SortHeader>
              </TableHead>
              <TableHead className="table-header text-right">
                <SortHeader field="durationDays">Duration</SortHeader>
              </TableHead>
              <TableHead className="table-header text-right">
                <SortHeader field="riskScore">Risk</SortHeader>
              </TableHead>
              <TableHead className="table-header text-right">
                <SortHeader field="aumUsd">AUM</SortHeader>
              </TableHead>
              <TableHead className="table-header text-right">
                Your Share
              </TableHead>
              <TableHead className="table-header">Status</TableHead>
              <TableHead className="table-header text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAssets.map((asset) => {
              const shares = portfolio.holdings[asset.id] || 0
              return (
                <TableRow
                  key={asset.id}
                  className="border-border hover:bg-muted/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-sm">{asset.name}</div>
                        <span
                          className={`status-badge text-xs mt-1 ${getAssetTypeColor(asset.type)}`}
                        >
                          {getAssetTypeLabel(asset.type)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-400 font-medium">
                      {asset.apy}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDuration(asset.durationDays)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`status-badge ${getRiskBadgeClass(asset.riskScore)}`}
                    >
                      {getRiskLevel(asset.riskScore)} ({asset.riskScore})
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(asset.aumUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    {shares > 0 ? (
                      <span className="font-medium">{shares}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`status-badge ${getStatusBadgeClass(asset.status)}`}
                    >
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => router.push(`/asset/${asset.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setSelectedAsset(asset)
                          setModalType('add')
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      {shares > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setSelectedAsset(asset)
                            setModalType('redeem')
                          }}
                        >
                          <ArrowDownToLine className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* {selectedAsset && modalType === 'add' && (
        <AddPositionModal
          asset={selectedAsset}
          onClose={() => {
            setSelectedAsset(null)
            setModalType(null)
          }}
        />
      )}

      {selectedAsset && modalType === 'redeem' && (
        <RedeemModal
          asset={selectedAsset}
          onClose={() => {
            setSelectedAsset(null)
            setModalType(null)
          }}
        />
      )} */}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import usePortfolio from '@/lib/hooks/usePortfolio'
import { type Asset, formatCurrency } from '@/lib/mockData'

interface AddPositionModalProps {
  asset: Asset
  onClose: () => void
}

export default function AddPositionModal({
  asset,
  onClose,
}: AddPositionModalProps) {
  const { portfolio, addPosition } = usePortfolio()
  const [shares, setShares] = useState(1)

  const cost = shares * asset.price
  const canAfford = cost <= portfolio.cashUsd

  const handleSubmit = () => {
    if (!canAfford) return

    addPosition(asset.id, shares)
    toast.success('Position Added', {
      description: `Added ${shares} units of ${asset.name}`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Add Position</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="text-lg font-medium">{asset.name}</div>
            <div className="text-sm text-muted-foreground">
              {asset.apy}% APY • {formatCurrency(asset.price)}/unit
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Number of Units
            </label>
            <Input
              type="number"
              min={1}
              value={shares}
              onChange={(event) =>
                setShares(
                  Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                )
              }
              className="bg-secondary"
            />
          </div>

          <div className="flex justify-between items-center py-3 border-t border-b border-border">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-semibold">{formatCurrency(cost)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Available Cash</span>
            <span
              className={canAfford ? 'text-foreground' : 'text-destructive'}
            >
              {formatCurrency(portfolio.cashUsd)}
            </span>
          </div>

          {!canAfford && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Insufficient funds</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canAfford}
              className="flex-1"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

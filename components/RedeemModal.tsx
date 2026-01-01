'use client'

import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import usePortfolio from '@/lib/hooks/usePortfolio'
import { type Asset, formatCurrency } from '@/lib/mockData'

interface RedeemModalProps {
  asset: Asset
  onClose: () => void
}

export default function RedeemModal({ asset, onClose }: RedeemModalProps) {
  const { portfolio, redeemPosition } = usePortfolio()
  const currentShares = portfolio.holdings[asset.id] || 0
  const [shares, setShares] = useState(1)

  const value = shares * asset.price
  const canRedeem = shares <= currentShares && shares > 0

  const handleSubmit = () => {
    if (!canRedeem) return

    redeemPosition(asset.id, shares)
    toast.success('Position Redeemed', {
      description: `Redeemed ${shares} units of ${asset.name}`,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Redeem Position</h3>
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
              {formatCurrency(asset.price)}/unit
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Your Position</span>
            <span>{currentShares} units</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Units to Redeem
            </label>
            <Input
              type="number"
              min={1}
              max={currentShares}
              value={shares}
              onChange={(event) =>
                setShares(
                  Math.max(
                    1,
                    Math.min(
                      currentShares,
                      Number.parseInt(event.target.value, 10) || 1,
                    ),
                  ),
                )
              }
              className="bg-secondary"
            />
          </div>

          <div className="flex justify-between items-center py-3 border-t border-b border-border">
            <span className="text-muted-foreground">Proceeds</span>
            <span className="font-semibold text-green-400">
              {formatCurrency(value)}
            </span>
          </div>

          {!canRedeem && shares > currentShares && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Cannot exceed current position</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canRedeem}
              className="flex-1"
            >
              Confirm Redemption
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

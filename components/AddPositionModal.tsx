'use client'

import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { AlertCircle, X, Loader2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/hooks/useWallet'
import usePortfolio from '@/lib/hooks/usePortfolio'
import { useInvest } from '@/lib/hooks/useContractWrite'
import { type Asset, formatCurrency } from '@/lib/mockData'
import { mantleTestnet } from '@/lib/config/networks'

interface AddPositionModalProps {
  asset: Asset
  onClose: () => void
}

export default function AddPositionModal({
  asset,
  onClose,
}: AddPositionModalProps) {
  const { portfolio, addPosition } = usePortfolio()
  const { isConnected, connect } = useWallet()
  const { address } = useAccount()
  const chainId = useChainId()
  const [shares, setShares] = useState(1)

  const { invest, reset, status, hash, error, isPending, isSuccess } =
    useInvest({
      id: asset.id,
      name: asset.name,
      tokenAddress: asset.tokenAddress,
    })

  const cost = shares * asset.price
  const isCorrectNetwork = chainId === mantleTestnet.id
  const canInvest = isConnected && isCorrectNetwork && !isPending

  // Close modal on successful transaction
  useEffect(() => {
    if (isSuccess) {
      // Refresh portfolio after a short delay to allow blockchain state to update
      setTimeout(() => {
        window.location.reload() // Simple refresh for now, can be optimized later
      }, 2000)
      onClose()
    }
  }, [isSuccess, onClose])

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to invest',
        action: {
          label: 'Connect',
          onClick: () => connect(),
        },
      })
      return
    }

    if (!isCorrectNetwork) {
      toast.error('Wrong network', {
        description: `Please switch to ${mantleTestnet.name}`,
      })
      return
    }

    if (shares <= 0) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid number of shares',
      })
      return
    }

    try {
      await invest(cost)
    } catch (err) {
      // Error handling is done in useInvest hook
      console.error('Invest error:', err)
    }
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
            <span className="text-foreground">
              {formatCurrency(portfolio.cashUsd)}
            </span>
          </div>

          {!isConnected && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Please connect your wallet to invest</span>
            </div>
          )}

          {isConnected && !isCorrectNetwork && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Please switch to {mantleTestnet.name}</span>
            </div>
          )}

          {status === 'pending' && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transaction pending...</span>
              {hash && (
                <a
                  href={`https://sepolia.mantlescan.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on Explorer
                </a>
              )}
            </div>
          )}

          {status === 'error' && error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error.message || 'Transaction failed'}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canInvest || shares <= 0}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Invest'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

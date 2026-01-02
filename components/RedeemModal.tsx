'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount, useChainId } from 'wagmi'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import usePortfolio from '@/lib/hooks/usePortfolio'
import { useWallet } from '@/lib/hooks/useWallet'
import { useRedeem } from '@/lib/hooks/useContractWrite'
import { useTokenBalance } from '@/lib/hooks/useContract'
import { type Asset, formatCurrency } from '@/lib/mockData'
import { mantleTestnet } from '@/lib/config/networks'

interface RedeemModalProps {
  asset: Asset
  onClose: () => void
}

export default function RedeemModal({ asset, onClose }: RedeemModalProps) {
  const { portfolio, redeemPosition } = usePortfolio()
  const { isConnected, connect } = useWallet()
  const { address } = useAccount()
  const chainId = useChainId()
  const [shares, setShares] = useState(1)

  // Read token balance from contract
  const { balance: contractBalance, isLoading: isLoadingBalance } =
    useTokenBalance(
      {
        id: asset.id,
        name: asset.name,
        tokenAddress: asset.tokenAddress,
      },
      address,
    )

  // Use contract balance if available, otherwise fall back to portfolio holdings
  const currentShares =
    contractBalance > 0 ? contractBalance : portfolio.holdings[asset.id] || 0

  const { redeem, reset, status, hash, error, isPending, isSuccess } =
    useRedeem({
      id: asset.id,
      name: asset.name,
      tokenAddress: asset.tokenAddress,
    })

  const value = shares * asset.price
  const isCorrectNetwork = chainId === mantleTestnet.id
  const canRedeem =
    isConnected &&
    isCorrectNetwork &&
    shares <= currentShares &&
    shares > 0 &&
    !isPending

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
        description: 'Please connect your wallet to redeem',
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

    if (shares <= 0 || shares > currentShares) {
      toast.error('Invalid amount', {
        description: 'Please enter a valid number of shares to redeem',
      })
      return
    }

    try {
      await redeem(shares)
    } catch (err) {
      // Error handling is done in useRedeem hook
      console.error('Redeem error:', err)
    }
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
            <span>
              {isLoadingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                `${currentShares.toFixed(4)} units`
              )}
            </span>
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

          {!isConnected && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Please connect your wallet to redeem</span>
            </div>
          )}

          {isConnected && !isCorrectNetwork && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Please switch to {mantleTestnet.name}</span>
            </div>
          )}

          {shares > currentShares && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Cannot exceed current position</span>
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
              disabled={!canRedeem}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Redemption'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

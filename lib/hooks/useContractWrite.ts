'use client'

import { toast } from 'sonner'
import { parseUnits } from 'viem'
import { useMemo, useState, useEffect } from 'react'
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi'

import { getContractAddress } from '@/lib/services/contractService'
import { RWA_TOKEN_ABI, getTxExplorerUrl } from '@/app/frontend-abi'

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error'

export interface TransactionState {
  status: TransactionStatus
  hash: string | null
  error: Error | null
}

/**
 * Hook to execute invest transaction
 */
export function useInvest(asset: {
  id: string
  name: string
  tokenAddress?: string | null
}) {
  const { address } = useAccount()
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  })

  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
  } = useWriteContract()

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({
    hash: hash || undefined,
    query: {
      enabled: !!hash,
    },
  })

  // Update transaction state based on wagmi hooks
  useEffect(() => {
    if (isPending) {
      setTxState({ status: 'pending', hash: hash || null, error: null })
    } else if (isSuccess && receipt) {
      setTxState({ status: 'success', hash: hash || null, error: null })

      // Store transaction record in database
      if (hash) {
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: hash,
            assetId: asset.id,
            type: 'Deposit',
            amount: 0, // Amount will be read from transaction receipt if needed
            userAddress: address || '',
            status: 'Completed',
          }),
        }).catch((err) => {
          console.error('Failed to store transaction record:', err)
          // Don't show error to user as transaction already succeeded
        })
      }

      toast.success('Investment successful!', {
        description: `Transaction confirmed`,
        action: hash
          ? {
              label: 'View on Explorer',
              onClick: () => {
                window.open(getTxExplorerUrl(hash), '_blank')
              },
            }
          : undefined,
      })
    } else if (writeError || isReceiptError) {
      const error = (writeError || new Error('Transaction failed')) as Error
      setTxState({ status: 'error', hash: hash || null, error })

      // User-friendly error messages
      if (error.message.includes('User rejected')) {
        toast.error('Transaction rejected', {
          description: 'You rejected the transaction in your wallet',
        })
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds', {
          description:
            'You do not have enough balance to complete this transaction',
        })
      } else {
        toast.error('Transaction failed', {
          description: error.message || 'An error occurred',
        })
      }
    }
  }, [isPending, isSuccess, isReceiptError, writeError, hash, receipt])

  const invest = async (amount: number) => {
    if (!contractAddress) {
      const error = new Error('Contract address not found for this asset')
      setTxState({ status: 'error', hash: null, error })
      toast.error('Invalid asset', {
        description: 'Could not find contract address for this asset',
      })
      return
    }

    try {
      // Convert amount to wei (assuming 18 decimals for payment token)
      const amountWei = parseUnits(amount.toString(), 18)

      writeContract({
        address: contractAddress,
        abi: RWA_TOKEN_ABI,
        functionName: 'invest',
        args: [amountWei],
      })
    } catch (error) {
      const err = error as Error
      setTxState({ status: 'error', hash: null, error: err })
      toast.error('Transaction failed', {
        description: err.message || 'Failed to submit transaction',
      })
    }
  }

  const reset = () => {
    setTxState({ status: 'idle', hash: null, error: null })
  }

  return {
    invest,
    reset,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isPending: isPending || isConfirming,
    isSuccess,
    receipt,
  }
}

/**
 * Hook to execute redeem transaction
 */
export function useRedeem(asset: {
  id: string
  name: string
  tokenAddress?: string | null
}) {
  const { address } = useAccount()
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  })

  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
  } = useWriteContract()

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({
    hash: hash || undefined,
    query: {
      enabled: !!hash,
    },
  })

  // Update transaction state based on wagmi hooks
  useEffect(() => {
    if (isPending) {
      setTxState({ status: 'pending', hash: hash || null, error: null })
    } else if (isSuccess && receipt) {
      setTxState({ status: 'success', hash: hash || null, error: null })

      // Store transaction record in database
      if (hash) {
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: hash,
            assetId: asset.id,
            type: 'Withdraw',
            amount: 0, // Amount will be read from transaction receipt if needed
            userAddress: address || '',
            status: 'Completed',
          }),
        }).catch((err) => {
          console.error('Failed to store transaction record:', err)
          // Don't show error to user as transaction already succeeded
        })
      }

      toast.success('Redemption successful!', {
        description: `Transaction confirmed`,
        action: hash
          ? {
              label: 'View on Explorer',
              onClick: () => {
                window.open(getTxExplorerUrl(hash), '_blank')
              },
            }
          : undefined,
      })
    } else if (writeError || isReceiptError) {
      const error = (writeError || new Error('Transaction failed')) as Error
      setTxState({ status: 'error', hash: hash || null, error })

      // User-friendly error messages
      if (error.message.includes('User rejected')) {
        toast.error('Transaction rejected', {
          description: 'You rejected the transaction in your wallet',
        })
      } else if (error.message.includes('insufficient')) {
        toast.error('Insufficient balance', {
          description: 'You do not have enough tokens to redeem',
        })
      } else {
        toast.error('Transaction failed', {
          description: error.message || 'An error occurred',
        })
      }
    }
  }, [isPending, isSuccess, isReceiptError, writeError, hash, receipt])

  const redeem = async (tokenAmount: number) => {
    if (!contractAddress) {
      const error = new Error('Contract address not found for this asset')
      setTxState({ status: 'error', hash: null, error })
      toast.error('Invalid asset', {
        description: 'Could not find contract address for this asset',
      })
      return
    }

    try {
      // Convert token amount to wei (assuming 18 decimals)
      const amountWei = parseUnits(tokenAmount.toString(), 18)

      writeContract({
        address: contractAddress,
        abi: RWA_TOKEN_ABI,
        functionName: 'redeem',
        args: [amountWei],
      })
    } catch (error) {
      const err = error as Error
      setTxState({ status: 'error', hash: null, error: err })
      toast.error('Transaction failed', {
        description: err.message || 'Failed to submit transaction',
      })
    }
  }

  const reset = () => {
    setTxState({ status: 'idle', hash: null, error: null })
  }

  return {
    redeem,
    reset,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isPending: isPending || isConfirming,
    isSuccess,
    receipt,
  }
}

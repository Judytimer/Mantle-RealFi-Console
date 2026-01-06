'use client'

import { toast } from 'sonner'
import { parseUnits, formatUnits, type Address, decodeEventLog } from 'viem'
import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi'

import { getContractAddress } from '@/lib/services/contractService'
import {
  RWA_TOKEN_ABI,
  getTxExplorerUrl,
  type AssetStatus,
} from '@/app/frontend-abi'
import {
  usePaymentTokenAddress,
  usePaymentTokenAllowance,
  useMinimumInvestment,
  useUserInvestment,
} from './useContract'

// ERC20 ABI for approval
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error'

export interface TransactionState {
  status: TransactionStatus
  hash: string | null
  error: Error | null
}

/**
 * Helper function to parse Invested event from transaction receipt
 */
function parseInvestedEvent(receipt: any): {
  paymentAmount: number
  tokenAmount: number
} | null {
  try {
    if (!receipt.logs) return null

    // Find Invested event from RWA_TOKEN_ABI
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: RWA_TOKEN_ABI,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === 'Invested') {
          return {
            paymentAmount: Number(formatUnits(decoded.args.paymentAmount, 18)),
            tokenAmount: Number(formatUnits(decoded.args.tokenAmount, 18)),
          }
        }
      } catch {
        // Not the event we're looking for, continue
      }
    }
    return null
  } catch (error) {
    console.error('Error parsing Invested event:', error)
    return null
  }
}

/**
 * Helper function to parse Redeemed event from transaction receipt
 */
function parseRedeemedEvent(receipt: any): {
  tokenAmount: number
  paymentAmount: number
} | null {
  try {
    if (!receipt.logs) return null

    // Find Redeemed event from RWA_TOKEN_ABI
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: RWA_TOKEN_ABI,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === 'Redeemed') {
          return {
            tokenAmount: Number(formatUnits(decoded.args.tokenAmount, 18)),
            paymentAmount: Number(formatUnits(decoded.args.paymentAmount, 18)),
          }
        }
      } catch {
        // Not the event we're looking for, continue
      }
    }
    return null
  } catch (error) {
    console.error('Error parsing Redeemed event:', error)
    return null
  }
}

/**
 * Helper function to get user-friendly error message from contract error
 */
function getErrorMessage(error: Error): string {
  const message = error.message || ''
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('user rejected') ||
    lowerMessage.includes('denied')
  ) {
    return 'Transaction was rejected'
  }
  if (lowerMessage.includes('insufficient allowance')) {
    return 'Insufficient token allowance. Please approve the payment token first.'
  }
  if (
    lowerMessage.includes('insufficient funds') ||
    lowerMessage.includes('insufficient balance')
  ) {
    return 'Insufficient balance'
  }
  if (
    lowerMessage.includes('below minimum') ||
    lowerMessage.includes('minimum investment')
  ) {
    return 'Amount is below minimum investment requirement'
  }
  if (
    lowerMessage.includes('cannot redeem') ||
    lowerMessage.includes('redemption not allowed')
  ) {
    return 'Redemption is not allowed at this time'
  }
  if (lowerMessage.includes('execution reverted')) {
    // Try to extract revert reason if available
    const revertMatch = message.match(/execution reverted: (.+)/i)
    if (revertMatch) {
      return revertMatch[1]
    }
    return 'Transaction failed: Contract reverted'
  }

  return message || 'Transaction failed'
}

/**
 * Hook to execute payment token approval
 */
export function useApprovePaymentToken(
  paymentTokenAddress: Address | null,
  spenderAddress: Address | null,
) {
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  })

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

  useEffect(() => {
    if (isPending) {
      setTxState({ status: 'pending', hash: hash || null, error: null })
    } else if (isSuccess && receipt) {
      setTxState({ status: 'success', hash: hash || null, error: null })
      toast.success('Approval successful!', {
        description: 'Payment token approved',
      })
    } else if (writeError || isReceiptError) {
      const error = (writeError || new Error('Approval failed')) as Error
      setTxState({ status: 'error', hash: hash || null, error })
      toast.error('Approval failed', {
        description: getErrorMessage(error),
      })
    }
  }, [isPending, isSuccess, isReceiptError, writeError, hash, receipt])

  const approve = useCallback(
    async (amount: bigint) => {
      if (!paymentTokenAddress || !spenderAddress) {
        const error = new Error('Payment token or spender address not found')
        setTxState({ status: 'error', hash: null, error })
        toast.error('Invalid configuration', {
          description: 'Payment token or spender address is missing',
        })
        return
      }

      try {
        writeContract({
          address: paymentTokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spenderAddress, amount],
        })
      } catch (error) {
        const err = error as Error
        setTxState({ status: 'error', hash: null, error: err })
        toast.error('Approval failed', {
          description: getErrorMessage(err),
        })
      }
    },
    [paymentTokenAddress, spenderAddress, writeContract],
  )

  const reset = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null })
  }, [])

  return {
    approve,
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
 * Hook to execute invest transaction with approval flow and validations
 */
export function useInvest(
  asset: {
    id: string
    name: string
    tokenAddress?: string | null
  },
  onSuccess?: () => void,
) {
  const { address } = useAccount()
  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  })
  const [pendingAmount, setPendingAmount] = useState<number | null>(null)

  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  // Read payment token address
  const { paymentTokenAddress, isLoading: isLoadingPaymentToken } =
    usePaymentTokenAddress(asset)

  // Read minimum investment
  const { minimumInvestment, isLoading: isLoadingMinimum } =
    useMinimumInvestment(asset)

  // Read allowance if payment token is available
  const {
    allowance,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = usePaymentTokenAllowance(
    paymentTokenAddress,
    address || null,
    contractAddress,
  )

  // Approval hook
  const {
    approve: approvePaymentToken,
    isSuccess: isApprovalSuccess,
    isPending: isApprovalPending,
    reset: resetApproval,
  } = useApprovePaymentToken(paymentTokenAddress, contractAddress)

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

  // Auto-proceed with invest after approval succeeds
  useEffect(() => {
    if (
      isApprovalSuccess &&
      pendingAmount !== null &&
      contractAddress &&
      !isPending &&
      !hash
    ) {
      // Reset approval state and proceed with invest
      resetApproval()
      const amountWei = parseUnits(pendingAmount.toString(), 18)
      writeContract({
        address: contractAddress,
        abi: RWA_TOKEN_ABI,
        functionName: 'invest',
        args: [amountWei],
      })
    }
  }, [
    isApprovalSuccess,
    pendingAmount,
    contractAddress,
    isPending,
    hash,
    resetApproval,
    writeContract,
  ])

  // Update transaction state based on wagmi hooks
  useEffect(() => {
    if (isPending) {
      setTxState({ status: 'pending', hash: hash || null, error: null })
    } else if (isSuccess && receipt) {
      setTxState({ status: 'success', hash: hash || null, error: null })

      // Parse Invested event to get actual amounts
      const eventData = parseInvestedEvent(receipt)
      const actualAmount = eventData?.paymentAmount || pendingAmount || 0

      // Store transaction record in database
      if (hash) {
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: hash,
            assetId: asset.id,
            type: 'Deposit',
            amount: actualAmount,
            userAddress: address || '',
            status: 'Completed',
          }),
        }).catch((err) => {
          console.error('Failed to store transaction record:', err)
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

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Reset pending amount
      setPendingAmount(null)
    } else if (writeError || isReceiptError) {
      const error = (writeError || new Error('Transaction failed')) as Error
      setTxState({ status: 'error', hash: hash || null, error })

      const errorMessage = getErrorMessage(error)
      toast.error('Transaction failed', {
        description: errorMessage,
      })

      // Reset pending amount on error
      setPendingAmount(null)
    }
  }, [
    isPending,
    isSuccess,
    isReceiptError,
    writeError,
    hash,
    receipt,
    pendingAmount,
    asset.id,
    address,
    onSuccess,
  ])

  const invest = useCallback(
    async (amount: number) => {
      if (!contractAddress) {
        const error = new Error('Contract address not found for this asset')
        setTxState({ status: 'error', hash: null, error })
        toast.error('Invalid asset', {
          description: 'Could not find contract address for this asset',
        })
        return
      }

      // Validate minimum investment
      if (
        !isLoadingMinimum &&
        minimumInvestment > 0 &&
        amount < minimumInvestment
      ) {
        const error = new Error(
          `Amount must be at least ${minimumInvestment.toFixed(2)}`,
        )
        setTxState({ status: 'error', hash: null, error })
        toast.error('Below minimum investment', {
          description: `Minimum investment is ${minimumInvestment.toFixed(2)}`,
        })
        return
      }

      // Check if approval is needed
      const amountWei = parseUnits(amount.toString(), 18)
      const needsApproval =
        paymentTokenAddress && !isLoadingAllowance && allowance < amount

      if (needsApproval) {
        // Store pending amount and trigger approval
        setPendingAmount(amount)
        await approvePaymentToken(amountWei)
        return
      }

      // Proceed with invest
      try {
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
          description: getErrorMessage(err),
        })
      }
    },
    [
      contractAddress,
      isLoadingMinimum,
      minimumInvestment,
      paymentTokenAddress,
      isLoadingAllowance,
      allowance,
      approvePaymentToken,
      writeContract,
    ],
  )

  const reset = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null })
    setPendingAmount(null)
    resetApproval()
  }, [resetApproval])

  return {
    invest,
    reset,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isPending: isPending || isConfirming || isApprovalPending,
    isSuccess,
    receipt,
    needsApproval:
      paymentTokenAddress &&
      !isLoadingAllowance &&
      pendingAmount !== null &&
      allowance < (pendingAmount || 0),
    isLoadingApproval: isLoadingAllowance || isLoadingPaymentToken,
    allowance,
    minimumInvestment,
    isLoadingMinimum: isLoadingMinimum || isLoadingPaymentToken,
  }
}

/**
 * Hook to execute redeem transaction with canRedeem validation
 */
export function useRedeem(
  asset: {
    id: string
    name: string
    tokenAddress?: string | null
  },
  onSuccess?: () => void,
) {
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

  // Read user investment to check canRedeem
  const { investment, isLoading: isLoadingInvestment } = useUserInvestment(
    asset,
    address,
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

      // Parse Redeemed event to get actual amounts
      const eventData = parseRedeemedEvent(receipt)
      const actualAmount = eventData?.tokenAmount || 0

      // Store transaction record in database
      if (hash) {
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: hash,
            assetId: asset.id,
            type: 'Withdraw',
            amount: actualAmount,
            userAddress: address || '',
            status: 'Completed',
          }),
        }).catch((err) => {
          console.error('Failed to store transaction record:', err)
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

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } else if (writeError || isReceiptError) {
      const error = (writeError || new Error('Transaction failed')) as Error
      setTxState({ status: 'error', hash: hash || null, error })

      const errorMessage = getErrorMessage(error)
      toast.error('Transaction failed', {
        description: errorMessage,
      })
    }
  }, [
    isPending,
    isSuccess,
    isReceiptError,
    writeError,
    hash,
    receipt,
    asset.id,
    address,
    onSuccess,
  ])

  const redeem = useCallback(
    async (tokenAmount: number) => {
      if (!contractAddress) {
        const error = new Error('Contract address not found for this asset')
        setTxState({ status: 'error', hash: null, error })
        toast.error('Invalid asset', {
          description: 'Could not find contract address for this asset',
        })
        return
      }

      // Validate canRedeem if investment data is available
      if (!isLoadingInvestment && investment && !investment.canRedeem) {
        const error = new Error('Redemption is not allowed at this time')
        setTxState({ status: 'error', hash: null, error })
        toast.error('Redemption not allowed', {
          description:
            'This position cannot be redeemed yet. Please check the asset details.',
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
          description: getErrorMessage(err),
        })
      }
    },
    [contractAddress, isLoadingInvestment, investment, writeContract],
  )

  const reset = useCallback(() => {
    setTxState({ status: 'idle', hash: null, error: null })
  }, [])

  return {
    redeem,
    reset,
    status: txState.status,
    hash: txState.hash,
    error: txState.error,
    isPending: isPending || isConfirming,
    isSuccess,
    receipt,
    canRedeem: investment?.canRedeem ?? true, // Default to true if not loaded yet
    isLoadingCanRedeem: isLoadingInvestment,
  }
}

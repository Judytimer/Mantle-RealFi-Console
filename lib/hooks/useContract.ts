'use client'

import { useReadContract, useAccount } from 'wagmi'
import { useMemo } from 'react'
import { type Address, formatUnits } from 'viem'
import { getContractAddress } from '@/lib/services/contractService'
import { RWA_TOKEN_ABI } from '@/app/frontend-abi'

// ERC20 ABI for payment token operations
const ERC20_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
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
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Hook to read asset info from contract
 */
export function useAssetInfo(asset: {
  id: string
  name: string
  tokenAddress?: string | null
}) {
  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress || undefined,
    abi: RWA_TOKEN_ABI,
    functionName: 'getAssetInfo',
    query: {
      enabled: !!contractAddress,
    },
  })

  return {
    assetInfo: data
      ? {
          assetType: data[0] as string,
          expectedAPY: Number(data[1]),
          riskScore: Number(data[2]),
          duration: Number(data[3]),
          nextPayoutDate: Number(data[4]),
          status: Number(data[5]),
        }
      : null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to read user's token balance
 */
export function useTokenBalance(
  asset: {
    id: string
    name: string
    tokenAddress?: string | null
  },
  userAddress?: Address | null,
) {
  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  const { address } = useAccount()
  const effectiveAddress = userAddress || address

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress || undefined,
    abi: RWA_TOKEN_ABI,
    functionName: 'balanceOf',
    args: effectiveAddress ? [effectiveAddress] : undefined,
    query: {
      enabled: !!contractAddress && !!effectiveAddress,
    },
  })

  return {
    balance: data ? Number(formatUnits(data, 18)) : 0,
    balanceRaw: data || BigInt(0),
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to read user's investment details
 */
export function useUserInvestment(
  asset: {
    id: string
    name: string
    tokenAddress?: string | null
  },
  userAddress?: Address | null,
) {
  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  const { address } = useAccount()
  const effectiveAddress = userAddress || address

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress || undefined,
    abi: RWA_TOKEN_ABI,
    functionName: 'getUserInvestment',
    args: effectiveAddress ? [effectiveAddress] : undefined,
    query: {
      enabled: !!contractAddress && !!effectiveAddress,
    },
  })

  return {
    investment: data
      ? {
          balance: Number(formatUnits(data[0], 18)),
          investmentTime: Number(data[1]),
          investmentAmount: Number(formatUnits(data[2], 18)),
          canRedeem: data[3],
        }
      : null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to read yield components from contract
 */
export function useYieldComponents(asset: {
  id: string
  name: string
  tokenAddress?: string | null
}) {
  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  // First get the count
  const { data: count, isLoading: isLoadingCount } = useReadContract({
    address: contractAddress || undefined,
    abi: RWA_TOKEN_ABI,
    functionName: 'getYieldComponentsCount',
    query: {
      enabled: !!contractAddress,
    },
  })

  // Then read each component
  const componentCount = count ? Number(count) : 0
  const componentIndices = useMemo(
    () => Array.from({ length: componentCount }, (_, i) => BigInt(i)),
    [componentCount],
  )

  const components = useMemo(() => {
    if (!contractAddress || componentCount === 0) return []
    return componentIndices.map((index) => ({
      address: contractAddress,
      abi: RWA_TOKEN_ABI,
      functionName: 'getYieldComponent' as const,
      args: [index],
    }))
  }, [contractAddress, componentIndices])

  // Use multiple reads - for now, we'll read them sequentially via a custom hook
  // Note: wagmi doesn't have a built-in useReadContracts that works well here
  // So we'll simplify and read components one by one or use a different approach
  // For now, return the count and let components be read individually if needed
  return {
    count: componentCount,
    isLoading: isLoadingCount,
    componentIndices,
  }
}

/**
 * Hook to read payment token address from RWA contract
 */
export function usePaymentTokenAddress(asset: {
  id: string
  name: string
  tokenAddress?: string | null
}) {
  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress || undefined,
    abi: RWA_TOKEN_ABI,
    functionName: 'paymentToken',
    query: {
      enabled: !!contractAddress,
    },
  })

  return {
    paymentTokenAddress: data ? (data as Address) : null,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to read payment token allowance
 */
export function usePaymentTokenAllowance(
  paymentTokenAddress: Address | null,
  ownerAddress: Address | null,
  spenderAddress: Address | null,
) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: paymentTokenAddress || undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args:
      ownerAddress && spenderAddress
        ? [ownerAddress, spenderAddress]
        : undefined,
    query: {
      enabled: !!paymentTokenAddress && !!ownerAddress && !!spenderAddress,
    },
  })

  return {
    allowance: data ? Number(formatUnits(data, 18)) : 0,
    allowanceRaw: data || BigInt(0),
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to read minimum investment from contract
 */
export function useMinimumInvestment(asset: {
  id: string
  name: string
  tokenAddress?: string | null
}) {
  const contractAddress = useMemo(
    () => getContractAddress(asset),
    [asset.id, asset.name, asset.tokenAddress],
  )

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress || undefined,
    abi: RWA_TOKEN_ABI,
    functionName: 'minimumInvestment',
    query: {
      enabled: !!contractAddress,
    },
  })

  return {
    minimumInvestment: data ? Number(formatUnits(data, 18)) : 0,
    minimumInvestmentRaw: data || BigInt(0),
    isLoading,
    error,
    refetch,
  }
}

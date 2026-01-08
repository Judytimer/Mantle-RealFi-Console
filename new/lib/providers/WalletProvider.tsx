'use client'

import { toast } from 'sonner'
import { createContext, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RainbowKitProvider,
  darkTheme,
  useConnectModal,
} from '@rainbow-me/rainbowkit'
import {
  WagmiProvider,
  useAccount,
  useChainId,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'

import { wagmiConfig, defaultChain } from '@/lib/config/wagmi'
import { mantleMainnet, mantleTestnet } from '@/lib/config/networks'
import {
  getPreferredNetwork,
  setPreferredNetwork,
  setLastAddress,
  clearPreferences,
  type PreferredNetwork,
} from '@/lib/utils/walletPreferences'

interface WalletContextType {
  chainId: number
  isConnected: boolean
  address: string | null
  connect: () => void
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  addNetwork: (chainId: number) => Promise<void>
}

export const WalletContext = createContext<WalletContextType>({
  chainId: defaultChain.id,
  isConnected: false,
  address: null,
  connect: () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  addNetwork: async () => {},
})

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { openConnectModal } = useConnectModal()
  const disconnectHook = useDisconnect()
  const switchChainHook = useSwitchChain()

  // Load preferred network on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const preferred = getPreferredNetwork()
    if (preferred && isConnected) {
      const targetChainId = preferred === 'mainnet' ? 5000 : 5003
      if (chainId !== targetChainId) {
        try {
          switchChainHook.mutate({ chainId: targetChainId })
        } catch {
          // User rejected or error - handled below
        }
      }
    }
  }, [isConnected, chainId, switchChainHook])

  // Save last address when connected
  useEffect(() => {
    if (address && isConnected) {
      setLastAddress(address)
    }
  }, [address, isConnected])

  // Handle network switch errors
  useEffect(() => {
    if (switchChainHook.error) {
      const error = switchChainHook.error
      if (error.message.includes('User rejected')) {
        toast.error('Network switch rejected')
      } else {
        toast.error(`Network switch error: ${error.message}`)
      }
    }
  }, [switchChainHook.error])

  const handleConnect = () => {
    if (openConnectModal) {
      openConnectModal()
      return
    }
    toast.error('Wallet connection unavailable', {
      description: 'Please install MetaMask or refresh the page.',
    })
  }

  const handleDisconnect = () => {
    disconnectHook.mutate()
    clearPreferences()
  }

  const handleSwitchNetwork = async (targetChainId: number) => {
    try {
      await switchChainHook.mutateAsync({ chainId: targetChainId })
      const network: PreferredNetwork =
        targetChainId === 5000 ? 'mainnet' : 'testnet'
      setPreferredNetwork(network)
      toast.success(
        `Switched to ${targetChainId === 5000 ? 'Mantle Mainnet' : 'Mantle Testnet'}`,
      )
    } catch (error) {
      // Error handling is done in useEffect above
      throw error
    }
  }

  const handleAddNetwork = async (targetChainId: number) => {
    const chain = targetChainId === 5000 ? mantleMainnet : mantleTestnet

    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: chain.rpcUrls.default.http,
              blockExplorerUrls: [chain.blockExplorers?.default?.url],
            },
          ],
        })
        // After adding, switch to it
        await handleSwitchNetwork(targetChainId)
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain doesn't exist, but we just tried to add it
          toast.error('Failed to add network')
        } else if (error.code === 4001) {
          toast.error('Network addition rejected')
        } else {
          toast.error(`Failed to add network: ${error.message}`)
        }
        throw error
      }
    } else {
      toast.error('Please install MetaMask to add networks')
      throw new Error('No Ethereum provider found')
    }
  }

  const value = useMemo(
    () => ({
      chainId: chainId ?? defaultChain.id,
      isConnected,
      address: address || null,
      connect: handleConnect,
      disconnect: handleDisconnect,
      switchNetwork: handleSwitchNetwork,
      addNetwork: handleAddNetwork,
    }),
    [chainId, isConnected, address, openConnectModal, switchChainHook],
  )

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Create QueryClient per provider instance to avoid SSR hydration issues
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
    [],
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={[mantleMainnet, mantleTestnet]}
          theme={darkTheme({
            accentColor: '#38bdf8',
            accentColorForeground: '#0b1220',
            borderRadius: 'medium',
          })}
        >
          <WalletProviderInner>{children}</WalletProviderInner>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string
        params?: unknown[]
      }) => Promise<unknown>
      isMetaMask?: boolean
    }
  }
}

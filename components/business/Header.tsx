'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Wallet, ChevronDown, ExternalLink, Network } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/hooks/useWallet'
import {
  getExplorerUrl,
  getNetworkName,
  defaultChain,
} from '@/lib/config/networks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TopBar() {
  const {
    isConnected,
    address,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    addNetwork,
  } = useWallet()
  const [isSwitching, setIsSwitching] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure consistent values during hydration
  const effectiveChainId = chainId ?? defaultChain.id

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Only check wrong network after mount to prevent hydration mismatch
  const isWrongNetwork =
    isMounted &&
    isConnected &&
    effectiveChainId !== 5000 &&
    effectiveChainId !== 5003

  const handleSwitchNetwork = async (targetChainId: number) => {
    setIsSwitching(true)
    try {
      await switchNetwork(targetChainId)
    } catch (error) {
      // Error handling is done in WalletProvider
    } finally {
      setIsSwitching(false)
    }
  }

  const handleAddNetwork = async (targetChainId: number) => {
    setIsSwitching(true)
    try {
      await addNetwork(targetChainId)
    } catch (error) {
      // Error handling is done in WalletProvider
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Logo */}
      <Link href="/dashboard">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              MR
            </span>
          </div>
          <span className="font-semibold text-foreground">
            Mantle RealFi Console
          </span>
        </div>
      </Link>

      {/* Network Status */}
      <div className="flex items-center gap-2 text-sm">
        {isWrongNetwork && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/50">
            <span className="text-yellow-500 text-xs font-medium">
              Wrong Network
            </span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full cursor-pointer hover:bg-secondary/80 transition-colors">
              <span
                className={`w-2 h-2 rounded-full ${isMounted && isConnected ? 'bg-green-400' : 'bg-muted-foreground'}`}
              />
              <span className="text-muted-foreground">
                {getNetworkName(effectiveChainId)}
              </span>
              {isMounted && isConnected && (
                <span className="text-muted-foreground/60 text-xs">
                  #{effectiveChainId}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => handleSwitchNetwork(5000)}
              disabled={effectiveChainId === 5000 || isSwitching}
            >
              <Network className="w-4 h-4 mr-2" />
              Mantle Mainnet
              {effectiveChainId === 5000 && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSwitchNetwork(5003)}
              disabled={effectiveChainId === 5003 || isSwitching}
            >
              <Network className="w-4 h-4 mr-2" />
              Mantle Testnet
              {effectiveChainId === 5003 && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </DropdownMenuItem>
            {isWrongNetwork && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAddNetwork(5000)}
                  disabled={isSwitching}
                  className="text-yellow-500"
                >
                  Add Mantle Mainnet
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAddNetwork(5003)}
                  disabled={isSwitching}
                  className="text-yellow-500"
                >
                  Add Mantle Testnet
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Wallet */}
      <div>
        {isMounted && isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="default"
                className="gap-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                {formatAddress(address!)}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    getExplorerUrl(effectiveChainId, address || undefined),
                    '_blank',
                  )
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={disconnect}
                className="text-destructive"
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            onClick={connect}
            variant="default"
            className="gap-2 cursor-pointer bg-blue-500 text-white hover:bg-blue-600"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  )
}

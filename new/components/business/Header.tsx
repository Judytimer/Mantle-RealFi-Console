'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronDown, Network } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

import { useWallet } from '@/lib/hooks/useWallet'
import { defaultChain, getNetworkName } from '@/lib/config/networks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const {
    isConnected,
    chainId,
    switchNetwork,
    addNetwork,
  } = useWallet()
  const [isMounted, setIsMounted] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const effectiveChainId = isMounted
    ? (chainId ?? defaultChain.id)
    : defaultChain.id
  const isWrongNetwork =
    isMounted &&
    isConnected &&
    effectiveChainId !== 5000 &&
    effectiveChainId !== 5003

  const handleSwitchNetwork = async (targetChainId: number) => {
    setIsSwitching(true)
    try {
      await switchNetwork(targetChainId)
    } finally {
      setIsSwitching(false)
    }
  }

  const handleAddNetwork = async (targetChainId: number) => {
    setIsSwitching(true)
    try {
      await addNetwork(targetChainId)
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-full border border-warning/40">
            <span className="text-warning text-xs font-medium">
              Wrong Network
            </span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full cursor-pointer">
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
                <span className="ml-auto text-xs">OK</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSwitchNetwork(5003)}
              disabled={effectiveChainId === 5003 || isSwitching}
            >
              <Network className="w-4 h-4 mr-2" />
              Mantle Testnet
              {effectiveChainId === 5003 && (
                <span className="ml-auto text-xs">OK</span>
              )}
            </DropdownMenuItem>
            {isWrongNetwork && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAddNetwork(5000)}
                  disabled={isSwitching}
                  className="text-warning"
                >
                  Add Mantle Mainnet
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAddNetwork(5003)}
                  disabled={isSwitching}
                  className="text-warning"
                >
                  Add Mantle Testnet
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Wallet */}
      <div className="flex items-center">
        <ConnectButton showBalance={false} />
      </div>
    </header>
  )
}

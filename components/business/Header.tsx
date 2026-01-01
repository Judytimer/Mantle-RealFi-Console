'use client'
import Link from 'next/link'
import { Wallet, ChevronDown, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/hooks/useWallet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TopBar() {
  const { isConnected, address, chainId, connect, disconnect } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getNetworkName = (id: number) => {
    switch (id) {
      case 5003:
        return 'Mantle Testnet'
      case 5000:
        return 'Mantle Mainnet'
      default:
        return 'Unknown Network'
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-muted-foreground'}`}
          />
          <span className="text-muted-foreground">
            {getNetworkName(chainId)}
          </span>
          {isConnected && (
            <span className="text-muted-foreground/60 text-xs">#{chainId}</span>
          )}
        </div>
      </div>

      {/* Wallet */}
      <div>
        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
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
                    `https://explorer.testnet.mantle.xyz/address/${address}`,
                    '_blank',
                  )
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={disconnect}
                className="text-destructive"
              >
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={connect} size="sm" className="gap-2 cursor-pointer">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  )
}

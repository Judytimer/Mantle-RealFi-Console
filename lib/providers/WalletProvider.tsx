'use client'

import { createContext, useState } from 'react'

export const WalletContext = createContext({
  chainId: 5003,
  isConnected: false,
  address: null as string | null,
  connect: () => {},
  disconnect: () => {},
})

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const connect = () => {
    // Mock wallet connection
    setIsConnected(true)
    setAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f8AB12')
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
  }

  return (
    <WalletContext.Provider
      value={{ isConnected, address, chainId: 5003, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}

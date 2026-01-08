'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bot, History, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

import AssetsTable from './components/AssetsTable'
import PortfolioSummary from './components/PortfolioSummary'
import RWABalanceCard from '@/components/RWABalanceCard'
import CopilotDrawer from '@/components/CopilotDrawer'
import { Button } from '@/components/ui/button'
import useCopilot from '@/lib/hooks/useCopilot'

export default function DashboardPage() {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)
  const { sendMessage, generateRebalancePlan } = useCopilot()

  const handleAskAI = () => {
    setIsCopilotOpen(true)
    sendMessage('Explain my portfolio risk')
  }

  const handleRebalance = () => {
    setIsCopilotOpen(true)
    generateRebalancePlan()
  }

  const handleExportReport = () => {
    toast.success('Report exported', {
      description: 'A demo portfolio report was generated for download.',
    })
  }

  return (
    <section className="h-full flex">
      <aside className="w-72 h-full border-r border-border p-4 overflow-y-auto scrollbar-thin space-y-4">
        <RWABalanceCard />
        <PortfolioSummary />
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>
          <Link href="/">
            <Button variant="outline" className="w-full justify-start">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Marketplace
            </Button>
          </Link>
          <Link href="/dashboard/transactions">
            <Button variant="outline" className="w-full justify-start">
              <History className="w-4 h-4 mr-2" />
              Transaction History
            </Button>
          </Link>
          <Button
            onClick={handleAskAI}
            variant="outline"
            className="w-full justify-start"
          >
            Ask AI
          </Button>
          <Button
            onClick={handleRebalance}
            variant="outline"
            className="w-full justify-start"
          >
            Rebalance
          </Button>
          <Button
            onClick={handleExportReport}
            variant="outline"
            className="w-full justify-start"
          >
            Export Report
          </Button>
        </div>
      </aside>
      <section className="flex-1 p-6 overflow-y-auto">
        <AssetsTable />
      </section>

      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {!isCopilotOpen && (
        <Button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg"
        >
          <Bot className="w-5 h-5" />
        </Button>
      )}
    </section>
  )
}

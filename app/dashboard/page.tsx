'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'
import { toast } from 'sonner'

import AssetsTable from './components/AssetsTable'
import PortfolioSummary from './components/PortfolioSummary'
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
    <section className="h-full flex flex-col lg:flex-row">
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border p-4 overflow-y-auto scrollbar-thin">
        <PortfolioSummary />
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>
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

      <main className="flex-1 p-6 overflow-y-auto">
        <AssetsTable />
      </main>

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

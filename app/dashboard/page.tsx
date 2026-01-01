import AssetsTable from './components/AssetsTable'
import PortfolioSummary from './components/PortfolioSummary'

export default function DashboardPage() {
  return (
    <section className="h-full flex">
      <aside className="w-72 h-full border-r border-border p-4 overflow-y-auto scrollbar-thin">
        <PortfolioSummary />
      </aside>
      <section className="flex-1 p-6 overflow-y-auto">
        <AssetsTable />
      </section>
    </section>
  )
}

import PortfolioSummary from './components/PortfolioSummary/page'

export default function DashboardPage() {
  return (
    <section className="h-full">
      <aside className="w-72 h-full border-r border-border p-4 overflow-y-auto scrollbar-thin">
        <PortfolioSummary />
      </aside>
    </section>
  )
}

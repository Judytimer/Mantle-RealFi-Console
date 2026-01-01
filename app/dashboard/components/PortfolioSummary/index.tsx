'use client'
import { TrendingUp, Calendar, AlertTriangle, DollarSign } from 'lucide-react'
import {
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  LineChart,
  ResponsiveContainer,
} from 'recharts'

import usePortfolioSummary from './service'
import { formatCurrency } from '@/lib/mockData'

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#6b7280']

export default function PortfolioSummary() {
  const {
    totalAUM,
    weightedAPY,
    riskScore,
    riskLevel,
    allocation,
    getNextPayout,
    yieldCurve,
  } = usePortfolioSummary()

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Portfolio Summary
      </h2>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total AUM */}
        <div className="metric-card col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="metric-label">Total AUM</span>
          </div>
          <div className="metric-value">{formatCurrency(totalAUM)}</div>
          <div className="metric-subtext">+$2,450 (24h)</div>
        </div>

        {/* Weighted APY */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="metric-label">APY</span>
          </div>
          <div className="metric-value text-green-400">
            {weightedAPY.toFixed(2)}%
          </div>
        </div>

        {/* Next Payout */}
        <div className="metric-card">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="metric-label">Next Payout</span>
          </div>
          <div className="metric-value text-lg">{getNextPayout()}</div>
        </div>

        {/* Risk Score */}
        <div className="metric-card col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="metric-label">Risk Score</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="metric-value">{riskScore}/100</div>
            <span
              className={`status-badge ${riskLevel === 'Low' ? 'risk-low' : riskLevel === 'Medium' ? 'risk-medium' : 'risk-high'}`}
            >
              {riskLevel}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${riskLevel === 'Low' ? 'bg-green-400' : riskLevel === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'}`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Allocation Pie */}
      <div className="metric-card">
        <div className="metric-label mb-3">Allocation</div>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="percentage"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  strokeWidth={0}
                >
                  {allocation.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {allocation.map((item, index) => (
              <div
                key={item.type}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{item.type}</span>
                </div>
                <span className="font-medium">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yield Curve */}
      <div className="metric-card">
        <div className="metric-label mb-3">30D Yield Trend</div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yieldCurve}>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={['dataMin - 0.005', 'dataMax + 0.005']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value?: number) => [
                  `${(value ?? 0 * 100).toFixed(2)}%`,
                  'Daily Yield',
                ]}
              />
              <Line
                type="monotone"
                dataKey="yield"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

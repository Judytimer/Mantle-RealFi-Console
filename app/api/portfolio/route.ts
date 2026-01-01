import { NextResponse } from 'next/server'
import { fetchPortfolio } from '@/lib/api'

export const GET = async () => {
  const data = await fetchPortfolio()
  return NextResponse.json(data)
}

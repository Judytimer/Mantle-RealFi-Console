import { NextResponse } from 'next/server'
import { postTransaction } from '@/lib/api'

export const POST = async () => {
  const response = await postTransaction()
  return NextResponse.json(response)
}

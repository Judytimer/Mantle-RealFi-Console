import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { txHash, assetId, type, amount, userAddress, status } = body

    // Validate required fields
    if (!txHash || !assetId || !type || !userAddress) {
      return NextResponse.json(
        {
          error: 'Missing required fields: txHash, assetId, type, userAddress',
        },
        { status: 400 },
      )
    }

    // Hardcoded demo user ID for now
    // In production, this would be derived from the authenticated user
    const userId = '00000000-0000-0000-0000-000000000001'

    // Create transaction record as AssetEvent
    // AssetEvent has: assetId, type, amount, eventDate, txHash
    const event = await prisma.assetEvent.create({
      data: {
        assetId,
        type: type as 'Deposit' | 'Withdraw' | 'Payout',
        amount: amount || 0,
        eventDate: new Date(),
        txHash,
      },
    })

    return NextResponse.json({
      transaction: {
        id: event.id.toString(),
        txHash: event.txHash,
        status: status || 'Completed',
        timestamp: event.eventDate.toISOString(),
        assetId,
        type,
        amount: Number(event.amount),
      },
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction record' },
      { status: 500 },
    )
  }
}

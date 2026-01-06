import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Define AssetType locally
type AssetType = 'treasury' | 'real_estate' | 'credit' | 'cash'
type AssetStatus = 'Active' | 'Maturing' | 'Paused'

interface CreateAssetRequest {
  id: string
  name: string
  type: 'treasury' | 'real-estate' | 'credit' | 'cash'
  apy: number
  durationDays: number
  riskScore: number
  yieldConfidence: number
  aumUsd: number
  price: number
  status: AssetStatus
  nextPayoutDate: string
  description?: string | null
  tokenAddress?: string | null
  distributorAddress?: string | null
}

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as AssetType | null
  const minAPY = searchParams.get('minAPY')
  const maxRisk = searchParams.get('maxRisk')

  const where: any = {}

  if (type) {
    where.type = type
  }
  if (minAPY) {
    const minAPYNum = Number(minAPY)
    if (!isNaN(minAPYNum)) {
      where.apy = { gte: minAPYNum }
    }
  }
  if (maxRisk) {
    const maxRiskNum = Number(maxRisk)
    if (!isNaN(maxRiskNum)) {
      where.riskScore = { lte: maxRiskNum }
    }
  }

  const filtered = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Transform Decimal fields to numbers for JSON serialization
  // Map database type format (real_estate) to frontend format (real-estate)
  const typeMap: Record<string, string> = {
    real_estate: 'real-estate',
    treasury: 'treasury',
    credit: 'credit',
    cash: 'cash',
  }
  const assets = filtered.map((asset: any) => ({
    id: asset.id,
    name: asset.name,
    type: typeMap[asset.type] || asset.type,
    apy: Number(asset.apy),
    durationDays: asset.durationDays,
    riskScore: asset.riskScore,
    yieldConfidence: asset.yieldConfidence,
    aumUsd: Number(asset.aumUsd),
    price: Number(asset.price),
    status: asset.status,
    nextPayoutDate: asset.nextPayoutDate.toISOString().split('T')[0],
    description: asset.description,
    tokenAddress: asset.tokenAddress,
    distributorAddress: asset.distributorAddress,
  }))

  return NextResponse.json({
    assets,
    total: assets.length,
    page: 1,
    pageSize: 20,
  })
}

export const POST = async (request: Request) => {
  try {
    const body: CreateAssetRequest = await request.json()

    // Validate required fields
    const requiredFields = [
      'id',
      'name',
      'type',
      'apy',
      'durationDays',
      'riskScore',
      'yieldConfidence',
      'aumUsd',
      'price',
      'status',
      'nextPayoutDate',
    ] as const

    const missingFields = requiredFields.filter(
      (field) =>
        body[field] === undefined || body[field] === null || body[field] === '',
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 },
      )
    }

    // Validate asset ID format
    if (typeof body.id !== 'string' || body.id.trim() === '') {
      return NextResponse.json(
        {
          error: 'Invalid asset ID',
          message: 'Asset ID must be a non-empty string',
        },
        { status: 400 },
      )
    }

    // Check for duplicate asset ID
    const existingAsset = await prisma.asset.findUnique({
      where: { id: body.id },
    })

    if (existingAsset) {
      return NextResponse.json(
        {
          error: 'Duplicate asset ID',
          message: `Asset with ID "${body.id}" already exists`,
        },
        { status: 409 },
      )
    }

    // Validate enum values
    const validTypes = ['treasury', 'real-estate', 'credit', 'cash']
    const validStatuses = ['Active', 'Maturing', 'Paused']

    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          error: 'Invalid asset type',
          message: `Type must be one of: ${validTypes.join(', ')}`,
          validTypes,
        },
        { status: 400 },
      )
    }

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          error: 'Invalid asset status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          validStatuses,
        },
        { status: 400 },
      )
    }

    // Validate numeric ranges
    const validationErrors: string[] = []

    if (typeof body.apy !== 'number' || body.apy < 0) {
      validationErrors.push('apy must be >= 0')
    }
    if (
      typeof body.durationDays !== 'number' ||
      body.durationDays <= 0 ||
      !Number.isInteger(body.durationDays)
    ) {
      validationErrors.push('durationDays must be a positive integer')
    }
    if (
      typeof body.riskScore !== 'number' ||
      body.riskScore < 0 ||
      body.riskScore > 100 ||
      !Number.isInteger(body.riskScore)
    ) {
      validationErrors.push('riskScore must be an integer between 0 and 100')
    }
    if (
      typeof body.yieldConfidence !== 'number' ||
      body.yieldConfidence < 0 ||
      body.yieldConfidence > 100 ||
      !Number.isInteger(body.yieldConfidence)
    ) {
      validationErrors.push(
        'yieldConfidence must be an integer between 0 and 100',
      )
    }
    if (typeof body.aumUsd !== 'number' || body.aumUsd < 0) {
      validationErrors.push('aumUsd must be >= 0')
    }
    if (typeof body.price !== 'number' || body.price < 0) {
      validationErrors.push('price must be >= 0')
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid field values',
          validationErrors,
        },
        { status: 400 },
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.nextPayoutDate)) {
      return NextResponse.json(
        {
          error: 'Invalid date format',
          message: 'nextPayoutDate must be in YYYY-MM-DD format',
        },
        { status: 400 },
      )
    }

    const nextPayoutDate = new Date(body.nextPayoutDate)
    if (isNaN(nextPayoutDate.getTime())) {
      return NextResponse.json(
        {
          error: 'Invalid date',
          message: 'nextPayoutDate must be a valid date',
        },
        { status: 400 },
      )
    }

    // Map frontend type format (real-estate) to database format (real_estate)
    const typeMap: Record<string, string> = {
      'real-estate': 'real_estate',
      treasury: 'treasury',
      credit: 'credit',
      cash: 'cash',
    }

    // Create asset in database
    const createdAsset = await prisma.asset.create({
      data: {
        id: body.id.trim(),
        name: body.name,
        type: typeMap[body.type] as AssetType,
        apy: body.apy,
        durationDays: body.durationDays,
        riskScore: body.riskScore,
        yieldConfidence: body.yieldConfidence,
        aumUsd: body.aumUsd,
        price: body.price,
        status: body.status,
        nextPayoutDate,
        description: body.description || null,
        tokenAddress: body.tokenAddress || null,
        distributorAddress: body.distributorAddress || null,
      },
    })

    // Transform to match GET response format
    const typeMapReverse: Record<string, string> = {
      real_estate: 'real-estate',
      treasury: 'treasury',
      credit: 'credit',
      cash: 'cash',
    }

    const assetResponse = {
      id: createdAsset.id,
      name: createdAsset.name,
      type: typeMapReverse[createdAsset.type] || createdAsset.type,
      apy: Number(createdAsset.apy),
      durationDays: createdAsset.durationDays,
      riskScore: createdAsset.riskScore,
      yieldConfidence: createdAsset.yieldConfidence,
      aumUsd: Number(createdAsset.aumUsd),
      price: Number(createdAsset.price),
      status: createdAsset.status,
      nextPayoutDate: createdAsset.nextPayoutDate.toISOString().split('T')[0],
      description: createdAsset.description,
      tokenAddress: createdAsset.tokenAddress,
      distributorAddress: createdAsset.distributorAddress,
    }

    return NextResponse.json(assetResponse, { status: 201 })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      {
        error: 'Failed to create asset',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

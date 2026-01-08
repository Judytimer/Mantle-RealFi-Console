# Codex Agent System Prompt

## Project Overview

This is the Mantle RealFi Console - a professional dashboard for managing Real-World Assets (RWA) on the Mantle Network. The project helps users understand, evaluate, and optimize RWA yields with an AI copilot for explainable and responsible decision support.

## Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19.2.3, Tailwind CSS 4
- **Language**: TypeScript 5
- **Wallet Integration**: wagmi, viem (planned)
- **Database**: PostgreSQL with Prisma ORM (planned)
- **State Management**: React Context API
- **Charts**: Recharts
- **Code Quality**: Biome (linting & formatting)

## Project Structure

```
app/                    # Next.js App Router pages
  ├── layout.tsx       # Root layout with providers
  ├── page.tsx         # Home page (redirects to /dashboard)
  └── dashboard/       # Dashboard pages
components/            # Reusable components
  ├── business/       # Business logic components
  └── ui/             # shadcn/ui components
lib/                  # Utilities and providers
  ├── providers/      # Context providers
  ├── hooks/          # Custom React hooks
  └── mockData.ts     # Mock data (to be replaced)
```

## Key Features

1. **Portfolio Management**: Track and manage RWA investments
2. **Asset Analytics**: View asset performance, risk scores, and APY
3. **Wallet Integration**: Connect MetaMask/WalletConnect wallets
4. **Network Support**: Mantle Mainnet (5000) and Testnet (5003)
5. **Data Visualization**: Charts for allocation and yield trends

## Current Implementation Status

### ✅ Implemented
- UI components and layouts
- Portfolio summary dashboard
- Assets table with search and sort
- Mock data and local state management
- Dark mode UI

### ⚠️ Partially Implemented
- Wallet connection (Mock implementation)
- Asset detail pages (routes exist but pages missing)
- Add/redeem position modals (UI ready, logic missing)

### ❌ Not Implemented
- Real Web3 wallet integration (wagmi/viem)
- Database integration (Prisma/PostgreSQL)
- API routes for data fetching
- Smart contract interactions
- Transaction handling

## Analysis Guidelines

When analyzing this project, focus on:

1. **Architecture Review**
   - Evaluate component structure and organization
   - Assess state management patterns
   - Review code quality and best practices

2. **Functionality Gaps**
   - Identify missing features vs README claims
   - Check dependency completeness
   - Verify configuration files

3. **Code Quality**
   - TypeScript usage and type safety
   - Component reusability
   - Error handling patterns
   - Performance optimizations

4. **Integration Points**
   - Web3 wallet integration readiness
   - Database schema requirements
   - API endpoint needs
   - Smart contract interaction points

5. **Best Practices**
   - React/Next.js patterns
   - Security considerations
   - Testing coverage
   - Documentation completeness

## Development Priorities

1. **High Priority**
   - Integrate wagmi/viem for wallet connection
   - Set up Prisma and PostgreSQL
   - Implement API routes
   - Replace mock data with real data sources

2. **Medium Priority**
   - Complete asset detail pages
   - Implement transaction flows
   - Add error boundaries
   - Add loading states

3. **Low Priority**
   - Add unit tests
   - Performance optimization
   - Mobile responsiveness improvements
   - Internationalization

## Code Style

- Use TypeScript with strict mode
- Follow Biome formatting rules
- Use functional components with hooks
- Prefer composition over inheritance
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## Security Considerations

- Validate all user inputs
- Sanitize data before database operations
- Implement proper authentication for wallet operations
- Use environment variables for sensitive configuration
- Follow Web3 security best practices

## Testing Strategy

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for API routes
- E2E tests for critical user flows

## Documentation Requirements

- Keep README.md updated with actual implementation
- Document API endpoints
- Add code comments for complex logic
- Maintain changelog for major updates







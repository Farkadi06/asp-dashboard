# Getting Started - ASP Platform Dashboard

This guide will help you get the ASP Platform Developer Dashboard up and running.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** (comes with Node.js) or **pnpm** or **yarn**

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The development server will start on **port 7000**.

### 3. Open in Browser

Navigate to:
```
http://localhost:7000
```

You should see the login page (placeholder).

## Available Scripts

- `npm run dev` - Start development server on port 7000
- `npm run build` - Build for production
- `npm run start` - Start production server on port 7000
- `npm run lint` - Run ESLint

## Project Structure

```
asp-dashboard/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── dashboard/    # Dashboard routes
│   │   ├── login/        # Login page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   └── ui/          # ShadCN UI components
│   └── lib/             # Utilities and core logic
│       ├── apiClient.ts  # API client (placeholder)
│       ├── auth-store.ts # Auth token management
│       └── react-query-client.ts # React Query setup
├── changelog/           # Step-by-step changelogs
└── docs/                # Formal documentation
```

## Development Workflow

1. **Current Status**: Step 1 Complete
   - Project architecture is set up
   - All routing placeholders are in place
   - No backend integration yet (UI-first approach)

2. **Next Steps**: 
   - Step 2: Full UX + Component Design Pass
   - Step 3: Implement Login UI
   - Step 4: Connect Login to Backend
   - Step 5+: Implement dashboard pages

## Environment Variables

Currently, no environment variables are required. When backend integration is added (Step 4), you may need:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

### Port 7000 Already in Use

If port 7000 is already in use, you can:
1. Stop the process using port 7000
2. Or temporarily use a different port: `next dev -p 7001`

### Build Errors

Run linting first:
```bash
npm run lint
```

Then try building:
```bash
npm run build
```

## Notes

- The project uses **Next.js 14** with App Router
- **TypeScript** is required
- **TailwindCSS** is configured
- **ShadCN UI** components are available in `src/components/ui/`
- All API calls are placeholders until Step 4

## Support

For step-by-step progress, check the `changelog/` folder.

For detailed documentation, check the `docs/` folder (will be populated as features are completed).


# InstaLive Frontend

> Next.js 15 frontend for the InstaLive YouTube Live Streaming platform.

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | React framework with SSR/SSG |
| **Language** | TypeScript | Type safety |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **UI Components** | Shadcn/UI (zinc) | Accessible, customizable components |
| **Auth** | Clerk | Authentication & user management |
| **Data Fetching** | TanStack Query v5 | Caching, mutations, polling |
| **State Management** | Zustand | Lightweight global state |
| **Streaming** | Native WebSocket | FFmpeg stream relay |
| **Animations** | Framer Motion | Smooth transitions |
| **Notifications** | Sonner | Toast notifications |
| **Icons** | Lucide React | Icon library |
| **Bundler** | Turbopack | Fast dev builds |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/             # Authenticated layout group
│   │   ├── dashboard/      # Broadcast history, stats
│   │   └── studio/         # Live streaming studio
│   ├── sign-in/            # Clerk sign-in
│   ├── sign-up/            # Clerk sign-up
│   ├── layout.tsx          # Root layout (Providers)
│   ├── page.tsx            # Landing page
│   └── globals.css         # Tailwind + Shadcn CSS
│
├── components/             # React components
│   ├── ui/                 # Shadcn/UI components
│   └── providers.tsx       # Clerk + TanStack Query + Sonner
│
├── hooks/                  # Custom React hooks
│   └── use-stream-websocket.ts  # WebSocket for FFmpeg relay
│
├── lib/                    # Utilities
│   ├── api-client.ts       # Go backend API client
│   └── utils.ts            # cn() helper
│
├── services/               # API service hooks (TanStack Query)
│   └── api.ts              # All query/mutation hooks
│
├── stores/                 # Zustand stores
│   ├── broadcast-store.ts  # Broadcast + livestream state
│   └── studio-store.ts     # Stream status, overlay, connection
│
├── types/                  # TypeScript type definitions
│   └── index.ts            # All types (matches Go backend)
│
└── middleware.ts           # Clerk auth middleware
```

## Getting Started

### Prerequisites

- Node.js 18+
- Go backend running on `localhost:8080`
- Clerk account with API keys

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk keys

# Run dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GO_BACKEND_URL` | Go backend URL (default: `http://localhost:8080`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page path |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page path |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up |

## Architecture

### No API Routes

This frontend has **zero** Next.js API routes. All data comes from the Go backend:

```
Browser  ──── TanStack Query ──── api-client.ts ──── Go Backend (REST)
         ──── useStreamWebSocket ──── WebSocket ──── Go Backend (/ws/stream)
```

### State Management

- **Server state** (broadcasts, chat, overlays) → **TanStack Query** (auto-caching, polling)
- **Client state** (stream status, UI toggles) → **Zustand** (lightweight, no boilerplate)

### Streaming Flow

```
MediaRecorder (WebM)  ──▶  useStreamWebSocket()  ──▶  Go Backend  ──▶  FFmpeg  ──▶  YouTube RTMP
```

## Design Workflow

1. Design pages in **Lovable** (generates React + Tailwind code)
2. Copy generated components into `src/components/`
3. Wire up data using hooks from `src/services/api.ts`
4. Wire up streaming using `useStreamWebSocket()` from `src/hooks/`

## Adding Shadcn/UI Components

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add card
# ... etc
```

# BundleGuard PWA

An independent witness for your data usage. Track where your mobile data bundles go with per-app usage tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### 1. Install Dependencies

```bash
cd pwa
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from **Settings → API**

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Features

- **Home Dashboard** - Bundle wallet, today's usage, top apps
- **Timeline** - Filterable usage history by date/network/app
- **Actions** - Step-by-step guides to reduce data usage
- **History** - Saved proof reports
- **Settings** - Device management, preferences

## 🏗️ Project Structure

```
pwa/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── bundles/     # Bundle management
│   │   │   ├── devices/     # Device registration
│   │   │   ├── pairings/    # Pairing codes
│   │   │   ├── reports/     # Report management
│   │   │   └── usage/       # Usage data
│   │   ├── actions/         # Actions page
│   │   ├── history/         # History page
│   │   ├── settings/        # Settings page
│   │   ├── timeline/        # Timeline page
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── AddBundleModal.tsx
│   │   ├── AppShell.tsx
│   │   ├── BundleWallet.tsx
│   │   ├── Navigation.tsx
│   │   ├── PairingModal.tsx
│   │   ├── ProofReport.tsx
│   │   ├── TodayUsage.tsx
│   │   └── TopApps.tsx
│   └── lib/                 # Utilities
│       ├── supabase.ts      # Supabase client & types
│       └── utils.ts         # Helper functions
├── public/                  # Static assets
│   └── manifest.json        # PWA manifest
├── supabase/
│   └── schema.sql           # Database schema
└── package.json
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pairings` | POST | Generate pairing code |
| `/api/pairings?code=XXX` | GET | Check pairing status |
| `/api/devices/register` | POST | Register Android device |
| `/api/devices` | GET | List connected devices |
| `/api/usage/batches` | POST | Upload usage data |
| `/api/usage/summary` | GET | Get usage summary |
| `/api/bundles` | GET/POST/PUT/DELETE | Manage bundles |
| `/api/reports` | GET/POST/DELETE | Manage reports |

## 📊 Database Schema

See [supabase/schema.sql](supabase/schema.sql) for the full schema.

**Tables:**
- `users` - User profiles
- `devices` - Connected Android devices
- `pairing_codes` - Device pairing codes
- `usage_batches` - Usage data batches
- `usage_items` - Per-app usage entries
- `bundles` - Data bundle tracking
- `reports` - Saved proof reports

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **QR Codes**: qrcode.react
- **Date Utils**: date-fns

## 📱 PWA Support

The app is a Progressive Web App with:
- Offline support (service worker)
- Installable on mobile devices
- App-like experience

To enable full PWA features in production:
```bash
npm install next-pwa
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Manual Build

```bash
npm run build
npm start
```

## 🔜 Next Steps

1. **Android App** - Build the data collector app
2. **Authentication** - Implement Supabase Auth
3. **Real-time Sync** - WebSocket for live updates
4. **Spike Detection** - Analyze usage patterns
5. **SMS Ingestion** - Read bundle purchase SMS (V1.5)

## 📄 License

MIT

---

Built with ❤️ for data-conscious users in Kenya

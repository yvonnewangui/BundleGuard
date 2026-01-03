BundleGuard — MVP Design & Technical Docs

BundleGuard helps users understand where their data bundles go by combining per-app usage tracking (Android) with clear reports, bundle tracking, and actionable fixes via a PWA.

1. Product Overview
Problem

Users believe mobile networks (Safaricom/Airtel) “eat” their data bundles, but:

there is little transparency

no easy way to attribute usage to apps

no simple, shareable proof

Solution

BundleGuard provides:

Per-app data usage tracking (Android)

Bundle Wallet (manual + future SMS ingestion)

Timeline & spike detection

Shareable Proof Reports

Actionable fixes, not just charts

2. Architecture (Option 1)
+------------------+        HTTPS        +------------------+
|  Android App     |  ───────────────▶  |  Backend API     |
|  (Data Collector)|                    |  (Next.js / API)|
+------------------+                    +------------------+
                                               ▲
                                               │
                                               │
                                      +------------------+
                                      |  PWA (Web App)  |
                                      |  Dashboard      |
                                      +------------------+

Components
Component	Responsibility
PWA	UI, bundle wallet, reports, history, actions
Android app	Per-app data tracking, operator detection, syncing
Backend	Auth, pairing, ingestion, aggregation
DB	Usage data, bundles, reports
3. MVP Scope
Included

Android per-app data tracking (mobile + Wi-Fi)

Bundle Wallet (manual entry)

Usage Timeline (daily)

Top app consumers

Proof Report (shareable)

Guided Actions

Excluded (V1)

SMS inbox reading

iOS per-app tracking

VPN packet inspection

Telco API integration

4. User Flows
4.1 Pairing Flow

User opens PWA → Connect Tracking

PWA generates QR / pairing code

Android app scans QR

Backend links device → user

Tracking begins

4.2 Usage Tracking Flow

Android app collects usage (NetworkStatsManager)

Usage batched every 15 minutes

Data uploaded to backend

PWA displays aggregates & timeline

4.3 Proof Report Flow

User taps Generate Proof Report

App compiles:

bundle info

per-app usage

detected spikes

common causes

Report rendered as shareable card

5. PWA Design (Screens)
5.1 Navigation

Bottom tabs:

Home

Timeline

Actions

Top right:

History

Settings

5.2 Home

Card: Bundle Wallet

Bundle type

Remaining vs used

Burn rate + ETA

Card: Today’s Usage

Total today

Mobile vs Wi-Fi

Last sync time

Card: Top Apps

Top 5 apps by usage

Toggle: Mobile / Wi-Fi

CTA

Generate Proof Report

5.3 Timeline

Filters:

Date

Network (Mobile / Wi-Fi)

Sort (Usage / Time)

List:

App name

Usage (MB/GB)

Network tag

Tap app → detail:

Daily usage

Mobile vs Wi-Fi split

Suggested fixes

5.4 Actions

Grouped guides:

Disable WhatsApp auto-download

Reduce video quality

Disable app updates on mobile data

Hotspot checklist

Night bundle tips

Each guide:

Android steps

iPhone steps (informational)

5.5 Proof Report

Single-screen exportable card:

Date

Network

Bundle

Top apps

Likely causes

What to do next

Buttons:

Share image

Copy summary text

Save to history

6. Android App Design
Screens

Welcome

QR Scan

Permissions

Status

Permissions

PACKAGE_USAGE_STATS (Usage Access)

Notifications (optional)

Status Screen

Tracking ON/OFF

Last sync time

Sync now

Open dashboard

7. Data Collection (Android)
Sources

NetworkStatsManager

PackageManager

SubscriptionManager (operator tagging)

Captured

rxBytes / txBytes

App package

Network type (MOBILE / WIFI)

Operator (best effort)

Time window

8. API Contract
Pairing

POST /v1/pairings

{
  "pairingCode": "BG-82K1P9",
  "expiresAt": "2026-01-03T12:30:00+03:00"
}

Device Registration

POST /v1/devices/register

{
  "pairingCode": "BG-82K1P9",
  "device": {
    "platform": "android",
    "model": "Pixel 7",
    "osVersion": "14"
  }
}

Usage Upload

POST /v1/usage/batches

{
  "capturedAt": "2026-01-03T11:18:00+03:00",
  "network": "mobile",
  "operator": "Safaricom",
  "apps": [
    {
      "package": "com.instagram.android",
      "rxBytes": 210000000,
      "txBytes": 12000000
    }
  ]
}

Summary

GET /v1/usage/summary?date=2026-01-03

{
  "mobileBytes": 680000000,
  "wifiBytes": 2400000000,
  "topApps": [
    { "package": "com.instagram.android", "bytes": 222000000 }
  ]
}

9. Database Schema (Minimal)
users

id

created_at

devices

id

user_id

token_hash

model

os_version

last_seen_at

usage_batches

id

device_id

network

operator

captured_at

usage_items

batch_id

package

rx_bytes

tx_bytes

bundles

user_id

operator

type

size_bytes

bought_at

expires_at

reports

id

user_id

payload_json

created_at

10. Sync Strategy

Every 15 minutes

Manual “Sync now”

Server aggregates daily usage

Spike detection via deltas

11. Tech Stack (Recommended)
PWA

Next.js

Tailwind

IndexedDB / localStorage (V1)

PWA install support

Backend

Next.js API routes or

Supabase (Auth + Postgres)

Android

Kotlin

WorkManager

NetworkStatsManager

12. Naming & Positioning

Name: BundleGuard
Tone: Neutral, factual, empowering
Positioning:

“An independent witness for your data usage.”

Avoid blaming telcos directly.

13. Next Dev Steps (Suggested Order)

PWA scaffold (Home, Timeline, Actions)

Backend pairing + usage ingestion

Android collector (usage → upload)

Proof Report rendering

Spike alerts

SMS ingestion (V1.5)
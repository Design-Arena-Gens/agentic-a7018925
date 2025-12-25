# Lumina Dreams · Pixar-Style Short Generator

Generate a Pixar-inspired vertical short that you can export as a WebM clip, add voice-over, and upload to YouTube Shorts.

## 🚀 Quick Start

> Requires Node.js 18+ (Next.js 14).

```bash
npm install
npm run dev
```

Visit http://localhost:3000, then press **Download Viral Short** to render a 45-second cinematic loop (1080×1920). The app records the animated canvas via `MediaRecorder` and saves a `.webm` file locally.

## 🧠 Highlights

- Next.js 14 App Router with a single client page.
- Custom canvas renderer that paints five cinematic story beats (Aurora & Drift in Cloud Harbor).
- Cinematic lighting, animated ribbons, parallax clouds, reflective water, and expressive character acting drawn procedurally.
- Integrated recorder that captures the full loop at 60fps for Shorts-ready output.
- Polished UI styled with glassmorphism, optimized for desktop preview of a phone screen.

## 📁 Structure

```
app/
  page.tsx       # Story renderer and recorder controls
  globals.css    # Neon cinematic styling
  layout.tsx     # Root layout & font
next.config.js   # Next.js configuration
package.json     # Scripts and dependencies
tsconfig.json    # TypeScript options
```

## 📦 Scripts

- `npm run dev` – Development server
- `npm run build` – Production build (runs TypeScript + lint checks)
- `npm start` – Run production build
- `npm run lint` – ESLint (Next.js config)

## 📸 Production Tips

1. Use Chrome or Edge (desktop) so `MediaRecorder` with VP9 is available.
2. Import the downloaded `.webm` into your editor to add narration, captions, and soundtrack.
3. Export vertically (1080×1920) and upload as YouTube Short/Reel.

## 📝 License

MIT © 2025 Lumina Dreams

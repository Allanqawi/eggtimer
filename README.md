# Egg Timer PWA 🥚⏱️
Cute, installable egg timer that works on iPhone/Android/Desktop — no App Store needed.

## Files
- `index.html`, `style.css`, `app.js`: the app
- `manifest.webmanifest`: PWA metadata (lets users “Add to Home Screen”)
- `sw.js`: service worker for offline caching
- `icons/icon-192.png`, `icons/icon-512.png`: app icons

## Run locally
Just open `index.html` to preview. (Service worker only fully works when served over HTTP/HTTPS.)

Quick local server (Python 3):
```
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy (free)
- **GitHub Pages**: push to a repo → Settings → Pages → Source: `main` → root.  
- **Netlify / Vercel**: drag and drop this folder — instant link.

## Install on iPhone
Open the URL in **Safari** → **Share** → **Add to Home Screen** → Open the icon.  
Tap **Start** once so iOS allows audio for the session.

## Notes
- Keep the timer visible for best accuracy (mobile browsers can throttle in background).

Have fun! 🎉

# PocketLight

A mobile-friendly, private photo editor inspired by the workflow of a mobile darkroom. This is an independent application, not Adobe Lightroom. Photo processing runs on the device in a browser worker; hosting only serves static application files.

## Features

- Import JPEG, PNG and WebP; desktop drag/drop and mobile photo picker.
- Exposure, contrast, highlights, shadows, whites, blacks, temperature, tint, saturation, vibrance, sharpening, grain and vignette.
- Six looks, original comparison, luminance histogram and 60-step undo/redo.
- Rotate, horizontal flip, proportional crop and crop positioning.
- Pinch/wheel zoom, pan and fit. Portrait phone layout and desktop side panel.
- Save and reopen original photos plus edit settings using IndexedDB.
- Export actual edited pixels as JPEG or PNG; choose quality and resolution. Native sharing appears when the browser supports sharing image files.
- Offline application caching after a successful first online visit. Relative paths support GitHub Pages repository hosting.

## Run locally

No dependencies, accounts, API keys or build step are needed.

```bash
cd pocketlight
python3 -m http.server 8080
```

Open http://localhost:8080. Serve over HTTP rather than opening index.html as a file: module workers require an HTTP origin. Service workers require HTTPS or localhost. For phone testing, use HTTPS hosting; an ordinary LAN HTTP address does not enable offline installation.

## Publish on GitHub Pages

1. Create a repository named `pocketlight` under your GitHub account. A public repository is the simplest Pages option; private-repository Pages availability depends on your GitHub plan.
2. Upload this folder's contents to the repository root, including `.github/workflows/pages.yml` and `tests/`.
3. In repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
4. Push to the `main` branch, or run **Actions → Deploy PocketLight to Pages → Run workflow**.
5. Wait for the deployment job to succeed. GitHub provides the actual live URL in the workflow and Pages settings. For `pkpressu/pocketlight`, the expected URL is `https://pkpressu.github.io/pocketlight/`; it is not live until deployment succeeds.

The workflow runs engine tests and publishes only the static application assets. No runtime server or database is deployed.

### Publish from a computer with GitHub CLI

Install Git, GitHub CLI and Python first. Sign into GitHub with `gh auth login`. From this folder run:

```bash
git init -b main
git add .
git commit -m "Build PocketLight local photo editor"
gh repo create pocketlight --public --source=. --remote=origin --push
gh api --method POST repos/pkpressu/pocketlight/pages -f build_type=workflow
gh workflow run pages.yml
```

If `pocketlight` already exists, use a different new repository name and substitute it in the Pages command. Do not overwrite an existing unrelated repository. If the API command is unavailable for your account, select GitHub Actions in Pages settings manually. `gh run list` shows workflow progress.

## Mobile use

Open the hosted site, import a photo, select a tool, adjust its sliders, then export. Use Save to retain an editable project on this browser. In Safari use Share → Add to Home Screen; in supported Android browsers use the install option in the browser menu. Installation behavior depends on the browser. On iPhone, use the exported image's Share button to save to Photos where supported; downloads otherwise go to Files.

## Privacy and storage

Imported photos and edit settings remain in memory or IndexedDB. The application makes no network requests containing photos, has no analytics, and uses no external fonts, APIs or cloud processing. The hosting provider can still log normal requests for app files. Projects are browser-specific and do not sync across devices. Private mode, storage quotas, browser cleanup or uninstalling can remove saved work. Export important photos separately.

Use Privacy & offline to delete saved projects or clear the application cache. Deleting projects removes stored copies, but the currently open image remains in memory until you reload or close the page. Cache cleanup removes app assets, not photos. To deploy updates, change the cache version in `sw.js`; a newly installed worker activates after old app tabs close.

## Limits

- This first version does not include RAW/HEIC decoding, masks, healing, advanced curves, HSL channels, custom crop aspect ratios, preset intensity, or AI tools.
- Import limit: 45 MB / 40 megapixels. Export long edge: 4096 px maximum. Preview long edge: 1200 px. Export does not upscale smaller photos.
- Preview and export share the pixel pipeline, but sharpening and grain operate at their respective pixel resolutions and may appear different at full resolution.
- Export strips camera metadata. Transparency is retained in PNG; use PNG for transparent images. JPEG does not preserve alpha.
- Modern browser features are required: module workers, Canvas, createImageBitmap, IndexedDB and Pointer Events. iOS/Android performance depends on device memory and browser support.
- Manual Save is required; there is no autosave.

## Development and validation

```bash
npm test
node --check app.js
node --check worker.js
node --check sw.js
```

Engine tests cover neutral-pixel preservation, exposure, monochrome conversion and crop bounds. JavaScript syntax checks passed during preparation. End-to-end browser/mobile checks were not run in the preparation environment because no browser executable was available. Before release, test import → adjust → crop → undo/redo → Save → Library reopen → export on your devices, verify exported dimensions and pixels, then reopen offline after the service worker takes control.

## Files

`app.js` owns UI, history, import/export, geometry and IndexedDB. `engine.js` holds pure pixel transforms and crop math. `worker.js` processes pixel buffers away from the UI thread. `sw.js` caches static assets. `styles.css` defines responsive layouts. There are no npm runtime dependencies.

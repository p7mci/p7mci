# P7MCI — Brand Identity Studio

Static portfolio website for P7MCI. Plain HTML/CSS/JavaScript — no framework,
no build step, no dependencies.

## Project structure

```
portfolio/
├── index.html              # markup only — links css/style.css and js/script.js
├── css/
│   └── style.css           # all site styles (extracted from the original inline <style>)
├── js/
│   └── script.js           # all site behavior (extracted from the original inline <script>)
├── assets/
│   ├── images/
│   │   └── p7mci-logo.jpg  # loader logo — the only local image the site uses
│   ├── icons/               # empty — the site currently uses inline SVG for every
│   │                         icon/mark (nav, project marks, cursor), so there are
│   │                         no separate icon files to place here
│   └── fonts/                # empty — Space Grotesk and Inter are loaded from
│                               Google Fonts via <link> in <head>, not self-hosted
├── .gitignore
└── README.md
```

Nothing else is embedded as base64, and there are no video/audio assets.

## What was and wasn't extracted, and why

- **CSS**: everything between the original `<style>...</style>` moved verbatim
  into `css/style.css`. No values changed.
- **JavaScript**: everything between the original `<script>...</script>` (the
  cursor system, scroll-reveal, background canvas, form handler, nav/menu
  logic) moved verbatim into `js/script.js`. No logic changed.
- **One script intentionally stayed inline**: the `<script type="application/ld+json">`
  block in `<head>` is structured data (Schema.org), not application logic —
  it's standard practice to keep JSON-LD inline in the HTML it describes, and
  moving it would add no benefit.
- **Image path updated**: `src="p7mci-logo.jpg"` → `src="assets/images/p7mci-logo.jpg"`.
  This is the only local asset reference in the project.
- **No `package.json`**: not included, deliberately. There's no build step,
  no npm dependency, and no bundler in this project — Vercel serves static
  HTML/CSS/JS directly without one. Adding one would be dead weight.

## Running locally

Because the contact form calls an external API (Web3Forms) rather than a
same-origin endpoint, you can open `index.html` directly in a browser and
everything will work, including the form. If you'd rather serve it like
production will:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploying to Vercel

**Option A — GitHub → Vercel (recommended for ongoing updates):**
1. Create a new GitHub repository and push this entire `portfolio/` folder
   to it (`index.html`, `css/`, `js/`, `assets/`, `README.md` all at the repo root).
2. Go to [vercel.com/new](https://vercel.com/new) and import that repository.
3. Framework preset: choose **"Other"** (Vercel will detect it as static —
   no build command, no output directory override needed).
4. Click **Deploy**. Vercel gives you a `*.vercel.app` URL immediately.
5. To use your own domain: **Project → Settings → Domains** → add it and
   follow Vercel's DNS instructions.

**Option B — Vercel CLI, no GitHub needed:**
```bash
npm i -g vercel      # one-time
cd portfolio
vercel               # deploys a preview
vercel --prod        # promotes to your production URL
```

Either way, no configuration file (`vercel.json`) is required for this project.

## Before you make it public — action items

These aren't bugs in the code, but the site will look and work fine while
being functionally broken in two places until you fix them:

1. **Contact form won't send email yet.** In `index.html`, find:
   `<input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">`
   Replace the value with your real key from [web3forms.com](https://web3forms.com).
2. **Social links are placeholders.** In `index.html`, the LinkedIn and
   Instagram links under the Contact section point to `linkedin.com` and
   `instagram.com` with no profile path — update both to your real profile URLs.
3. **No favicon.** Not an error, just absent. If you want one, provide a
   square image (or ask for one to be generated) and it can be dropped into
   `assets/icons/` and linked from `<head>`.

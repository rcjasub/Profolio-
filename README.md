# Profolio

A personal portfolio site — static HTML/CSS/JS, no build step, no framework. Open `index.html` in a
browser or serve the folder with any static file host (GitHub Pages, Netlify, a plain `python -m
http.server`, etc.).

## Structure

```
index.html            The whole page — hero, projects, experience, stack, awards, contact.
assets/
  css/style.css        All styling: design tokens (colors/fonts) live at the top as CSS variables.
  js/main.js           Progressive enhancement only — mobile nav toggle, hero scroll-expand intro,
                        smooth scroll (Lenis), animated contact-section background (Vanta FOG),
                        scroll-reveal, back-to-top. The page works fully with this disabled.
  img/                 Favicon, the botanical illustrations, and awards/ (real photos, resized/
                        compressed from JocsanR/uploads/ for web use).
  docs/resume.pdf      Downloadable resume, linked from the footer.
JocsanR/               Earlier design explorations + the source resume (kept for reference, not
                        part of the live site).
```

## Editing content

Everything visible — name, email, projects, experience, education, stack, awards — is plain markup
in `index.html`, pulled from the resume in `JocsanR/uploads/`. Each section (`#projects`,
`#experience`, `#education`, `#stack`, `#awards`) repeats a simple block you can copy, edit, or
delete to add/remove entries. A few things worth knowing:

- The phone number from the resume was left off the public page on purpose (avoids scraper spam) —
  add it near the email link in the `.contact` section if you want it visible.
- All 4 award cards now have real photos (`award-card__shot--photo` + `<img>`) — no more "Add a
  photo" placeholders: HackKnight 2025, NYC Hackathon 2026, ColorStack x Datadog meetup, and
  LinkedIn Hack Week. The NYC Hackathon photo pairing was a best guess since it didn't map 1:1 to
  a specific event — double-check it and swap the `src` in `index.html` if a different photo fits
  better. (CS Club, BMCC is still mentioned in the Education section's detail text, just no longer
  has its own award card.)
- Project links currently point at the GitHub profile (no per-project repo links were given) —
  update each `<a class="project-row">`'s `href` once you have individual repo/demo URLs.

To restyle, the color palette and fonts are CSS custom properties at the top of
`assets/css/style.css` (`--bg`, `--ink`, `--accent`, `--font-sans`, `--font-mono`, …).

## Hero scroll-expand intro

The page opens on the hero shrunk to a small rounded card showing **only the name** — the status
flag, intro paragraph, and stats live in `.hero__headline` (`[data-hero-headline]`) and stay hidden
until the card reaches full size, fading/sliding in there. It's symmetric: scroll back up and the
card shrinks back down, the headline fades back out the same way, and it reappears if you scroll
back down again — not a one-time reveal. Scrolling grows the card itself (`transform: scale`,
driven in `main.js` off `[data-scroll-expand]` / `[data-scroll-frame]`) up to its natural full size,
then normal page flow continues into Projects. No image asset needed — it's the hero's own existing
content that expands, so editing the hero (name, intro, stats) automatically carries through.

The name itself animates in character-by-character on load (`[data-split-text]` in `main.js`, ~35ms
stagger per letter) — a plain-CSS take on the pasted SplitText component. The visual split is
`aria-hidden`; the real `<h1>` carries an `aria-label` with the plain name for screen readers.

The botanical background also blurs while shrunk (`MAX_BG_BLUR`, 10px) and sharpens back to normal
as the card reaches full size — draws the eye to the card instead of the pattern around it.

Tuning knobs are the `START_RADIUS` / `EXPAND_VH` / `MAX_BG_BLUR` constants and the `startScale()`
function near the top of `main.js`, plus `.hero-expand__spacer`'s height in `style.css` (how much
scroll distance the whole intro + hold takes). Skipped automatically — hero renders at full size
immediately, background never blurs, no extra scroll distance — with JavaScript disabled, under
`prefers-reduced-motion`, **or** on short viewports (`window.innerHeight <
480`, e.g. landscape phones), since a hero taller than the screen would otherwise get clipped while
pinned mid-animation.

## Third-party scripts (CDN, no build step)

Loaded via pinned `<script>` tags in `index.html` — no npm install needed:

- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scrolling.
- [three.js](https://threejs.org/) r134 + [Vanta](https://www.vantajs.com/) FOG — the animated
  background behind the closing contact section only (`assets/js/main.js`, `[data-vanta-contact]`).
  Colors are set in the `VANTA.FOG({...})` call (currently FOG's own defaults). Skipped
  automatically under `prefers-reduced-motion` or if the CDN scripts fail — the section just falls
  back to its plain dark background.

## Running locally

Any static server works, e.g.:

```
python -m http.server 8000
```

then open `http://localhost:8000/`.

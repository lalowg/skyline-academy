# SKYLINE ACADEMY — Learn Beyond Limits

An online academy presented as a **navigable knowledge universe**. Six subjects float in space as constellations, and each of their 36 courses is a star. Visitors fly between constellations, open courses in a docked panel, mark progress and **light a pathway**, which draws a glowing route through courses from different subjects.

Production URL: `https://skyline-academy-omega.vercel.app`

> Fictional concept brand, built as a portfolio project. All subjects, courses, durations, pathways and progress are sample content. No qualification or outcome is implied.

---

## Concept

A course catalogue is usually a filterable grid. Learning doesn't feel like a grid, though. It feels like finding your bearings in a big sky. SKYLINE ACADEMY makes the structure of the curriculum visible:

- **Subjects → constellations.** Science, Technology, Design, Business, Humanities and Languages each have a figure, a sky coordinate and a colour.
- **Courses → stars.** Brighter, larger stars are more advanced (Foundation, Intermediate, Advanced).
- **Pathways → routes.** A pathway such as *Data Storyteller* crosses four constellations. Selecting it pulls the camera back and draws a coral route with a comet travelling along it.

## Brand & positioning

- **Promise:** "Learn beyond limits". The academy helps you see further than the next course.
- **Tone:** calm, clear and encouraging. It uses the vocabulary of navigation (orbit, launch, navigate, arrive) without leaning on sci-fi clichés.
- **Conversion:** "Request a prospectus" for a constellation or pathway. It is a demo form, and nothing is sent.

## Audience

Working adults (24–50) who are retraining or adding skills part-time, and who want to see how courses connect before they commit. A secondary audience is employers browsing pathways for their teams.

## Art direction

- **Archetype:** spatial navigation with a docked course panel. The universe is the page's first viewport, and the panel is a glass instrument docked to the right (it becomes a bottom section on phones).
- **Palette:** navy `#0A1230`, glow `#7CC4FF`, white `#F4F7FF`, coral `#FF7A59`. Subject tints stay inside the blue/coral family (`#59D6E8`, `#CFE8FF`, `#9DB2FF`, `#FFB59E`). Coral is reserved for routes, progress and calls to action.
- **Imagery:** 100% generated. Three.js starfield and constellations, SVG metro diagrams, an SVG orbital diagram, constellation glyphs, and a designed SVG star chart fallback. No photography.
- **Logo:** an original mark (a horizon arc with a rising route of three stars ending in a coral spark). `logo.svg` pairs it with the wordmark; `favicon.svg` is the mark on a navy tile.

## Typography

- **Saira** (300/500/600/700) for display: uppercase, tracked headlines and HUD labels with a precise, technical character.
- **Atkinson Hyperlegible** (400/700, italic 400) for text: designed by the Braille Institute for low-vision readability, which suits an education brand.
- Both load from Google Fonts with `display=swap`. Headings use `text-wrap: balance` and never break mid-word.

## Motion language

- **Flight:** the camera eases between constellations along the shortest arc, with an exponential ease-out, and flies in from deep space on load.
- **Route lighting:** a pathway's tube draws from first course to last, then a comet loops along it.
- **Telescope focus:** sections resolve from a soft blur into focus, rather than fading up.
- **Scroll-scrubbed orbit (Method):** a craft spirals outward through four rings as you scroll; rings and moons light up and the phase text changes.
- **Metro draw (Pathways):** the route line strokes on, and stations pop in sequence.

## Signature interaction — how to use it

1. **Drag** the sky to look around, **click a star** to open a course, or click a constellation's name.
2. Use the **Constellations rail** (bottom left) or **← / →** while focus is in the hero to fly between subjects. **Esc** steps back.
3. In the **docked panel**, filter by level, open courses, follow "On these pathways" or **Next star**.
4. Pick a **pathway** in the panel, or press **Light this route in the universe** in the Pathways section, to draw its route across the sky.
5. **Mark as completed** on any course to fill the pathway rings and the **Flight log**. Progress is kept in `sessionStorage` for this tab only.
6. **Take the guided flight** tours all six constellations and finishes on a lit pathway (press again to stop).

## Tech

- Static HTML, CSS and ES modules with no build step.
- **Three.js r169** via an import map from jsdelivr (`three@0.169.0`). It is loaded with a dynamic `import()`, so a blocked CDN falls back gracefully.
- `universe.js`: a custom shader starfield with twinkle and additive blending, nebula and star sprites from canvas-generated textures, constellation line segments, `CatmullRomCurve3` + `TubeGeometry` routes revealed with `setDrawRange`, screen-space picking, DOM labels projected each frame, and a spherical camera rig with eased flights. `setViewOffset` keeps the focus centred in the area left of the docked panel.
- `chart2d.js`: the SVG star chart fallback with the same interface (focus, route, filter, progress).
- `data.js`: subjects, courses and pathways. `main.js`: panel state machine, rail, keyboard, tour, metro diagrams, scroll-scrubbed orbit, flight log, form.

## Local development

```bash
npx serve .
```
Open the printed URL. ES modules and the import map need HTTP, so opening `index.html` from disk will not work.

## Accessibility

- One `<h1>`, landmarks, a skip link and labelled regions. The canvas is decorative (`aria-hidden`). Every 3D action has a real button: the rail, panel lists, Recentre, and the pathway buttons.
- Keyboard: ← / → change constellation and Esc goes back. The Pathways tabs follow the ARIA tabs pattern (arrows, Home, End). Focus moves into the panel after selections made from elsewhere on the page.
- Visible `:focus-visible` rings (coral). Body copy uses Atkinson Hyperlegible on navy at high contrast.
- Form: inline errors with `aria-invalid` and focus on the first problem. The success state says plainly that nothing was sent.
- `prefers-reduced-motion: reduce`: flights become instant cuts, there is no idle drift, twinkle or comet loop, and the route appears fully drawn. Reveals and the metro draw are disabled. All interactions still work.

## Performance

- One WebGL context, with no probe context. DPR is capped at 2 on desktop and 1.5 on mobile, there are fewer background stars on small screens, and antialiasing is off on mobile.
- The render loop pauses when the universe is offscreen (IntersectionObserver) or the tab is hidden.
- Sprites, line segments and two tubes keep draw calls low. Textures are generated at runtime, so there are no image downloads.

## Known limitations

- Constellation positions and coordinates are decorative, not astronomical.
- On touch screens, vertical swipes over the sky scroll the page, so looking around uses horizontal drags.
- Progress resets when the tab closes, by design.

## Credit

Designed & built by Saad Bashir — https://www.linkedin.com/in/saadbashirmarketing/

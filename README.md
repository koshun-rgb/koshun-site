# Koshun portfolio

Three files, no build step, no dependencies.

- `index.html` - all the content. Text, sections, links.
- `styles.css` - all the styling. The color and font variables live at the very top under `:root`.
- `script.js` - the page load animation, mobile menu, stat bars, active nav highlight.

## Editing it

Open the folder in VS Code (or any editor). To preview, just double click
`index.html` and it opens in your browser. Refresh after each save.
If you want live reload, install the "Live Server" extension in VS Code and
hit "Go Live".

## Common edits

**Colors** - `styles.css`, the `:root` block at the top:
```
--void   black background
--blood  the red
--bone   the off white
--gold   focus outlines and the star pips
```
Change those four and the whole site re-themes.

**Fonts** - swap the Google Fonts `<link>` in `index.html`, then update
`--display` and `--body` in `styles.css`.

**Your stats** - `index.html`, search for `data-val`. The number is the bar
width as a percentage. The `<em>` next to each label is the rank text.

**Star pips** in the off hours cards - add or remove `<span class="pip on">`
for filled, `<span class="pip">` for empty. Update the `aria-label` to match.

**Adding a section** - copy any `<section>` block, give it a new `id`,
and add a matching link in both navs (`#rail nav` and `#sheet`).
Alternate `class="on-bone cut-both"`, `class="on-blood cut-both"`, or no
class for plain black, so the angled panels keep alternating.

## Publishing

Drag this folder onto https://app.netlify.com/drop, or push it to a GitHub
repo and turn on Pages in the repo settings. `index.html` is already the
entry point, so nothing else is needed.

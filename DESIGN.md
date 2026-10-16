---
name: PIMX PASS DNS
description: A Persian and English DNS laboratory in graphite, cobalt and ice blue.
colors:
  ground: "#0d1119"
  surface: "#161d29"
  surface-raised: "#202b3c"
  surface-hover: "#293850"
  ink: "#eff4fc"
  muted: "#a4b2c8"
  subtle: "#8898b0"
  accent: "#2d63e7"
  accent-hover: "#2154d0"
  accent-ink: "#ffffff"
  positive: "#a6c5ff"
  negative: "#ffaaa2"
  line: "#314059"
  chart-ice: "#aac6ff"
  chart-amber: "#e7c57b"
  chart-blue: "#a5c5e6"
  light-ground: "#f6f8fc"
  light-surface: "#eaf0f8"
  light-surface-raised: "#dde6f2"
  light-surface-hover: "#cedbf0"
  light-ink: "#12203a"
  light-muted: "#52617c"
  light-subtle: "#5d6c86"
  light-positive: "#2453a8"
  light-negative: "#a33331"
  light-line: "#c3d0e5"
  light-focus: "#245de8"
typography:
  display:
    fontFamily: '"Manrope Variable", "Vazirmatn", sans-serif'
    fontSize: "clamp(52px, 5.3vw, 77px)"
    fontWeight: 800
    lineHeight: 1.28
    letterSpacing: "-0.035em"
  display-fa:
    fontFamily: '"Vazirmatn", "Manrope Variable", sans-serif'
    fontSize: "clamp(46px, 4.5vw, 65px)"
    fontWeight: 800
    lineHeight: 1.65
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Manrope Variable", "Vazirmatn", sans-serif'
    fontSize: "clamp(28px, 2.65vw, 38px)"
    fontWeight: 700
    lineHeight: 1.65
  title:
    fontFamily: '"Manrope Variable", "Vazirmatn", sans-serif'
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.75
  body:
    fontFamily: '"Manrope Variable", "Vazirmatn", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: '"Manrope Variable", "Vazirmatn", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.75
  metric:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  purpose: "7px"
  nav-item: "7px"
  control: "10px"
  row: "11px"
  panel: "12px"
  compact-control: "8px"
  field: "9px"
  menu: "13px"
  large-panel: "14px"
  dialog: "16px"
spacing:
  compact: "8px"
  control-gap: "10px"
  field-gap: "18px"
  content: "20px"
  section: "24px"
  panel: "28px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
    height: "48px"
  button-icon:
    textColor: "{colors.muted}"
    rounded: "{rounded.compact-control}"
    height: "40px"
    width: "40px"
  field:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 14px"
    height: "50px"
  workspace-navigation:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "6px"
  purpose-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.purpose}"
    padding: "7px 19px"
  resolver-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.row}"
    padding: "20px"
  source-trigger:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "50px"
  faq-disclosure:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "21px 23px"
  loader-surface:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
---

# Design System: PIMX PASS DNS

## Overview

**Creative North Star: "The Live Network Laboratory"**

A quiet graphite instrument with cobalt actions and ice-blue responses. Broad tonal surfaces support compact resolver rows and readable explanations. The faceted network core makes requests and responses tangible; the surrounding controls stay calm and direct.

Persian and English share a hierarchy with script-aware fonts and direction. Cool white text, restrained corners and visible keyboard focus support real measurements. Light mode retains the same blue material in a pale ground. The network motif connects explanatory, operational and loading surfaces.

**Key Characteristics:**

- Graphite and cool white with cobalt action and ice-blue responses.
- Tonal surfaces, spacious controls and readable explanatory text.
- A tactile network core that responds to pointer position and scan state.
- Script-aware Persian/English layouts with persistent light and dark themes.

## Colors

Cool graphite neutrals support cobalt action and ice-blue response states. The frontmatter records the exact dark and light values.

### Primary

- **Action Cobalt** (`accent`): primary actions, selected purposes and progress bars. **Cobalt Hover** (`accent-hover`) deepens hover; **White Action Ink** (`accent-ink`) supplies text on cobalt in both themes.

### Secondary

- **Response Ice** (`positive`): successful measurements, status dots, favorites and the stepped brand symbol. Light mode uses **Response Blue** (`light-positive`) for legible success text.
- **Chart Ice, Amber and Blue** (`chart-ice`, `chart-amber`, `chart-blue`): comparison series alongside cobalt.
- **Response Coral** (`negative`): failures, validation and destructive actions; light mode uses `light-negative`.

### Neutral

- **Graphite Ground** (`ground`): page background and inset fields.
- **Graphite Surface** (`surface`): navigation rails, resolver rows, explanatory cards and panels.
- **Raised Graphite** (`surface-raised`, `surface-hover`): selected rows, secondary actions and hover states.
- **Cool Ink**, **Muted Slate** and **Subtle Slate** (`ink`, `muted`, `subtle`): primary text, supporting text and placeholders.
- **Slate Line** (`line`): field borders, dividers and chart grids.
- **Pale Ground and Surfaces** (`light-ground`, `light-surface`, `light-surface-raised`, `light-surface-hover`): light-mode counterparts. Light ink, muted, subtle and line tokens replace their corresponding dark roles.
- **Light Focus Cobalt** (`light-focus`): light-mode focus ring and chart line. Dark mode uses action cobalt for focus. Action cobalt and white action ink stay the same in both themes.

**The State Has Text Rule.** Pair measurement colors with response method, status or numbers. The live scene does not replace the HTML results.

## Typography

**Display and Body Fonts:** self-hosted Manrope Variable for Latin; self-hosted Vazirmatn for Persian/Arabic script. The Persian document reverses the body stack so Vazirmatn comes first. Vazirmatn ships weights 400, 500, 700 and 800; Manrope ships its variable range.

**Character:** strong, generous headlines introduce a precise working surface. Provider names, addresses and measurements stay easy to scan. Numeric measurements use tabular figures; technical addresses also use Manrope rather than a separate monospace font.

### Hierarchy

- **Display:** the frontmatter records both scripts. Persian uses a smaller size ramp, 1.65 leading and -0.025em tracking. At tablet width Latin/Persian titles use 48px/39px. On phones Latin stays 48px and Persian uses `clamp(33px, 9.1vw, 46px)`; the narrowest Latin title is 42px. Wide screens use 90px/74px.
- **Headline:** explanatory section headings. Tablet size is 32px; phones use `clamp(25px, 7vw, 31px)`. Laboratory introduction uses `clamp(28px, 3vw, 42px)`, 800 weight and 1.6 leading, reducing to 32px on tablets and a 25?32px clamp on phones.
- **Title:** configuration, collection and recommendation headings. Refreshed configuration uses 21px on phones; process headings use 19px, then 18px.
- **Body:** base interface role. Explanatory paragraphs use 16px with generous leading, reducing to 15px on phones. Home lead uses 17px, then 16px at compact desktop and 15px on tablets, capped at 440px wide.
- **Label:** field captions, navigation and supporting copy. Refreshed source descriptions and resolver method lines use 12px; primary control labels use 13?15px according to context.
- **Metric:** resolver timings; 21px on tablets and 20px on phones. Live scan readout uses 55px, reducing to 34px on phones.

**The Script First Rule.** Preserve the language-specific font order, logical spacing and direction; keep addresses and technical values LTR inside either language.

## Layout

Shared main surfaces cap at 1320px and subtract 104px from the viewport by default. Insets reduce at 1100px (64px total), 780px (40px), 540px (36px), and 350px (28px). The document minimum width is 300px. Established secondary regions, including the footer, retain the base 1360px container.

Broad two-column regions introduce denser working panels. Home hero uses `1fr 1.08fr`, becomes equal columns on tablets, and stacks on phones. Explanatory sections use equal columns with 9% gaps; FAQ uses an asymmetric introduction and wider disclosure column. These regions stack on tablets. Explanatory sections use 60?90px desktop separation, tightening at smaller widths.

The dedicated home explains measurement and leads into a compact laboratory. This route arrangement describes the current surface composition; it is not a template for every future screen. Persian routes are `/` and `/test/`; English routes are `/en/` and `/en/test/`.

Configuration fields use `1fr 1.1fr 0.4fr`, becoming two columns on tablets with connection name spanning both. Panels use 28px padding, then 23px on tablets and 21px 17px on phones. Configuration fields keep 50px minimum height; the scan action keeps 54px minimum height and becomes full width on phones.

Workspace navigation becomes a fully visible two-column grid on phones with wrapped labels and 44px minimum controls. Keep all six destinations discoverable. Resolver rows wrap metadata and actions; sparklines hide on tablets while method labels and measurements remain. Details become one column. Comparisons use two columns at compact desktop and one on phones. Dialogs constrain height to the dynamic viewport and scroll internally. Tables alone may scroll horizontally.

## Elevation & Depth

Depth comes primarily from the ground/surface/raised tonal sequence. Resting panels remain shadow-free. The 3D core adds physical depth through faceted material, wireframe geometry and orbiting nodes; CSS orbit geometry repeats the motif during loading. Cast shadows identify floating UI.

### Shadow Vocabulary

- **Source menu:** `0 16px 45px #0003`.
- **Comparison tray:** `0 12px 36px #0005`.
- **Toast:** `0 10px 30px #0003`.
- **Dialog:** `0 24px 100px #0007`, with dark blue-neutral backdrop `#080c14c9`.

**The Tonal Surface Rule.** Use surface color to separate resting panels; reserve cast shadows for floating layers.

The shared easing is `cubic-bezier(0.22, 1, 0.36, 1)`. Color states use the fast duration (180ms); transforms use normal duration (320ms). An available slow duration is 650ms. Home title reveals use 800ms, 12px vertical movement and 90ms second-line delay. Route transitions use 240ms and a 10px entrance; tool changes use 220ms and 8px. Outgoing route surfaces become inert.

Network rendering uses requestAnimationFrame with delta-time smoothing and a capped 0.05s time step. Rendering suspends outside the viewport or hidden document. Pixel ratio caps at 1.3 below 600px and 1.75 elsewhere. Lite mode and system reduced motion use a static orbit drawing, stop continuous CSS motion and remove route movement while preserving all HTML data.

## Shapes

Corners follow scale and purpose: compact icon controls, slightly softer fields, modest button corners, rounded resolver rows and larger grouping panels. The source menu is softer than its trigger. Dialogs use the largest standard radius, reducing on phones. Status dots, orbit tracks and the recommendation icon remain circular; ordinary controls keep compact rectangular silhouettes.

Borders remain functional: one-pixel field edges, dividers, chart lines and the source-menu edge. The wordmark uses three stepped, skewed bars, echoed by the loader core. Provider identities use compact initial tiles. The network, stepped bars and orbit geometry supply the recurring form language.

## Components

### Buttons

Primary buttons carry white text on cobalt; secondary actions carry full ink on raised surface. Standard buttons use 600 weight, 13px text, a 10px icon gap and 48px minimum height. Home actions use 700 weight, 15px text and 56px minimum height; scan uses 14px text and 54px minimum height. Hover deepens cobalt and moves the arrow diagonally in reading direction; press moves down 1px. Disabled controls use 0.42 opacity. Icon controls retain accessible names.

### Inputs / Fields

Ground-colored fields sit inside tonal panels with one-pixel line borders and readable captions. Configuration fields use 50px minimum height. Focus changes the border; keyboard focus uses a two-pixel outline with five-pixel offset. Search fields outline their enclosing surface at a two-pixel offset. Errors combine negative text with an explicit message.

Saved network names use a themed suggestion list beneath the editable field instead of a browser datalist. Suggestions deduplicate names, filter as the visitor types and show up to twelve matches. Arrow keys move the active suggestion, Enter chooses and Escape dismisses; free text remains available.

### Navigation

The workspace rail uses surface color and panel corners. Active destinations use raised surface, full ink and response-blue icons; inactive items use muted ink. Current destinations expose `aria-current="page"`. Header navigation indicates home, laboratory or setup guide. Hover reveals full ink. Top text navigation hides on tablets while laboratory destinations remain available in the phone grid.

### Purpose Selection

Purpose controls use `aria-pressed`, compact corners and muted default text. Selected purpose uses cobalt and white action ink; unselected hover uses surface fill. Controls wrap and fill available phone width with explanatory copy beneath. Selection is disabled during scanning.

### Resolver Rows / Cards

Rows use surface color, provider initials, readable names, explicit methods, timings and named favorite/comparison/details actions. Hover and comparison selection use raised surface. Successful responses use response blue; unmeasured rows say ?Ready to test.? Details enter over 300ms. Accessible action names retain the resolver name at every width.

Configuration, custom resolvers, collections, history and measurement explanations use tonal grouping. Collection actions wrap on phones. Empty states use specific guidance and constrained copy. Comparison and export cards use ground color inside surface-colored dialogs.

### Shared Source Listbox

A full-width ground-colored trigger presents a method icon, selected label and chevron. Focus and open states use the focus border. The floating menu uses surface color, a line border, menu corners and its designated shadow. It enters over 180ms with 5px movement. Options combine icon tiles, labels, supporting descriptions and counts or selection checks. Active options use raised surface; selected icon tiles use cobalt and white.

The shared control serves public and administration selectors. Lists with more than twelve options show a search field by default; the guide always enables search. Filtering matches labels and descriptions, including resolver names and addresses. Lists reveal eighty rows at a time and report the visible and matched counts; no matches produces localized guidance.

Short lists retain trigger focus and support typeahead. Searchable lists move focus to the search input; the focused control exposes the active option through `aria-activedescendant`. Arrow keys move selection, Enter chooses, Escape closes and restores trigger focus, and Tab dismisses. Home/End navigate short lists while retaining text-editing behavior in search. Choosing an option returns focus to the trigger. The menu aligns to reading direction, fits the viewport and opens upward when needed. A portal targets the enclosing native dialog when present, otherwise the document body, so menus remain visible above clipped surfaces and within modal interaction.

### Device Setup Guide

The independent reading page at `/guide/` and `/en/guide/` pairs a back-to-test link and script-aware heading with a tonal resolver-selection panel above device instructions. The column caps at 1100px and narrows to the established phone insets, including 300px screens. Resolver choices carry protocol and address descriptions; the searchable listbox uses the same colors, focus states and keyboard model as other selectors. Device steps present compatible values, incompatibilities and undo instructions. All guide entrypoints open this page and preserve the current scan when returning to the laboratory.

### FAQ Disclosures

Questions form separate tonal blocks with icon tiles and rotating chevrons. Hover and expansion use raised surface; expanded icons and chevrons use response blue. The entire question row is a button with `aria-expanded` and an associated answer region. One item starts open; at most one stays open. Collapsed answers are inert. Answer height uses a 400ms grid transition; chevrons use normal motion. Phone answers use full-width inner padding and generous question touch heights.

### Loading and Live Network

The bilingual full-screen loader follows the current theme and uses a stepped blue core, orbit tracks and traveling nodes. Theme and language controls remain available. Preparation text carries no invented percentage. Required font readiness dismisses it, with a watchdog fallback and 300ms fade; reduced motion removes the fade. Core drift uses 3s, satellite orbit 3.5s and the three pulses 1.2s with staggered delays.

The lazy network shows localized preparation copy until ready. The core responds to pointer tilt and scanning; up to sixteen nodes reflect successful responses. WebGL failure and reduced motion use the static fallback. The canvas is decorative to assistive technology; live HTML progress and resolver results carry the measurements.

Home priority planes float gently on a separate transform layer, while changing details and emblems crossfade. Explanatory SVG paths terminate on cube faces. Continuous motion pauses outside the visible scene or hidden document, and reduced motion keeps the content and connections static.

## Do's and Don'ts

### Do:

- **Do** use cobalt for action and selection, ice blue for response, and pair status color with explicit text.
- **Do** preserve Persian/English font order, direction and LTR technical values.
- **Do** retain the fully visible two-column workspace navigation on phones.
- **Do** keep method labels, field captions and supporting measurements readable at the final implemented sizes.
- **Do** provide the static network and HTML measurement content when motion is reduced.
- **Do** carry language, theme and reduced-motion choices into loading and floating interfaces.

- **Do** use the shared themed listbox for selectable lists, with name/address search for long catalogs and the setup guide.

### Don't:

- **Don't** reintroduce green or chartreuse visual accents; the approved world uses cobalt and ice blue.
- **Don't** add cast shadows to resting panels; use the tonal surface sequence.
- **Don't** hide measurement methods or accessible control names when the layout narrows.
- **Don't** use the decorative network as the only representation of results.
- **Don't** add invented measurements or use success color to imply provider certification.

- **Don't** return device guides to an embedded tab or resolver dialog; keep their dedicated reading page.

<!-- Extracted from styles.css + refresh.css final cascade, App, HomePage, AppLoader,
SourceSelect, NetworkScene and navigation. The sidecar carries motion, responsive
metadata and previews; DESIGN.md frontmatter owns normative primitive tokens. -->

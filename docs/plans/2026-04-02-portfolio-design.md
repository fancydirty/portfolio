# Portfolio Website Design

## Goal

Build a single-page portfolio site that presents the user's work with agent workflows and long-running automation systems in a quiet, credible way.

This site is not a resume landing page, a founder-brand page, or a marketing site. It should feel like a compact work dossier:

- modest in tone
- specific about real work
- strong on structure
- restrained in presentation

The site should help a hiring manager or technical lead quickly understand three things:

1. what kinds of systems the user works on
2. what level of responsibility and taste the user brings to those systems
3. why the work is more than prompt hacking or demo engineering

## Recommendation

Use a single-page Astro site with custom CSS.

Do not start with Tailwind. The site does not need heavy component abstraction or utility-class speed. A small set of Astro components plus CSS variables will make it easier to keep the presentation restrained and intentional.

Use the Stitch output as visual direction, not as a source of product truth. The useful parts are:

- warm paper-like background
- serif, sans, and monospace typography
- thin borders instead of shadows
- a quiet, editorial layout
- an expandable project list

The actual content, wording, and project framing should come from this repo, not from Stitch placeholders.

## Site Shape

The first version should be a single page with five sections:

1. Hero
2. Selected Work
3. How I Work
4. Now
5. Links

No blog, no multi-page navigation, no case-study pages, and no resume section are needed in the first version.

The site should behave more like a thin portfolio file than a full personal website.

## Section 1: Hero

Purpose:
Establish the site's tone and tell the viewer what kind of builder this is.

This section should be brief. It should not overclaim. It should not sound like a pitch deck.

Recommended content shape:

- one short line that frames the user's work
- one concise paragraph that explains the current focus
- one short status line or present-tense note

The copy should say, in substance:

- the user is exploring practical agent workflows and automation systems
- the user cares about reliability, state, and long-running operation
- the site is a record of real work, not a personal brand exercise

The hero should feel calm and precise.

## Section 2: Selected Work

Purpose:
Show three projects that together explain the user's actual ability.

This is the center of the site.

The section should present three rows as an expandable list:

1. `clawd-media-track`
2. `private enterprise workflow`
3. `private content pipeline`

The first view of each row should stay compact:

- project title
- one-sentence summary
- two or three short tags

Clicking a row should expand an inline detail panel below it.

Each expanded panel should use the same internal structure, but in a more concrete case-study shape:

- Context
- Challenge
- System Shape
- Design Decisions
- Outcome

This is more specific than the earlier "problem / system shape / why it matters" framing. The main risk with these projects is not lack of substance, but lack of visible context. This structure fixes that.

### Project 1: clawd-media-track

This project is public and can be named directly.

Its expanded case study should communicate:

- Context: an OpenClaw-facing skill for media acquisition and tracking
- Challenge: avoid turning resource automation into guesswork or risky side effects
- System Shape: TMDB, PanSou, 115, SQLite, bootstrap, and task routing
- Design Decisions: separate Type 1 / 2 / 3 work, verify after side effects, add guardrails
- Outcome: a public repository with real workflow validation

This project should be the clearest and most concrete entry because it is verifiable.

### Project 2: private enterprise workflow

This project should stay anonymous.

Its expanded case study should communicate:

- Context: a recurring internal business workflow with repeated manual handling
- Challenge: the original process depended on fragile handoffs and too much human repetition
- System Shape: a decoupled automation pipeline with clear stage boundaries
- Design Decisions: shape the system for unattended operation, operational checks, and long-running reliability
- Outcome: a workflow that can be launched and then left to run with low-touch oversight

Do not mention who it serves. Do not mention the exact external services. Do not mention family context.

The point is to show workflow design, reliability, and operational thinking.

### Project 3: private content pipeline

This project should also stay anonymous.

Its expanded case study should communicate:

- Context: a long-running content production and distribution workflow
- Challenge: generation alone is easy; the hard part is consistency, QA, and state across the full pipeline
- System Shape: website surface plus orchestration, ledgers, QA checks, and publishing/distribution steps
- Design Decisions: treat quality gates and state updates as first-class workflow steps
- Outcome: an end-to-end system that can keep producing and distributing with minimal supervision

The focus should be on system shape, not on the brand or subject matter behind the content.

## Self-Introduction

The site currently risks talking only about systems and not about the person behind them. A portfolio still needs a small answer to "Who is this?"

The intro should not be a long biography. It should do three things:

1. say what kind of builder the user is becoming
2. state what kinds of problems the user is drawn to
3. explain why the project mix looks the way it does

Recommended shape:

- one short role line
- one short paragraph about current interests
- one short paragraph that frames the work

Good topics for that framing paragraph:

- these projects are not mass-market products, and that is okay
- the user is interested in how agents lower the cost of shaping software around a real workflow
- the goal is not to claim a grand theory of the future, but to explain why these projects are concrete and worth showing

The intro should make the user feel present and legible without becoming self-promotional.

## Section 3: How I Work

Purpose:
Show the user's working principles without turning them into slogans.

This section should be short.

Recommended items:

- Evidence before action
- Verification after side effects
- State over guesswork
- Bootstrap and guardrails matter

Each line can stay very short. The goal is not to explain a theory of engineering. The goal is to show consistent taste.

## Section 4: Now

Purpose:
Place the user in motion.

This section should make the site feel current, but not noisy.

Good themes for this section:

- current focus on agent workflows
- interest in long-running automation
- improving reliability and discipline in AI systems

This section should read like a present-tense notebook line, not a public announcement.

## Section 5: Links

Purpose:
Provide direct exits.

Keep this section minimal:

- GitHub
- one social link if useful
- email if the user wants it public

Do not add a large footer or a long list of destinations.

## Tone and Writing Rules

The site copy should feel:

- modest
- factual
- composed
- technically literate
- not self-mythologizing

Avoid:

- "founder" tone
- exaggerated confidence
- startup cliches
- claims of being elite, visionary, or cutting-edge
- bloated origin stories

The site should read like someone who is early in their path but already serious about the quality of systems they build.

## Interaction Model

The only meaningful interaction needed in the first version is the project accordion.

Required behavior:

- one project row can expand inline
- expansion reveals structured details
- collapse returns the page to the compact list
- the interaction should feel light and unobtrusive

No carousels, tabs, scroll hijacking, or animated counters are needed.

## Visual Direction

The design should follow the tone of a technical dossier with editorial warmth.

Keep:

- warm light background
- thin outlines
- strong spacing
- serif display text paired with clean sans-serif body text
- monospace for tags, stack details, and technical hints

Avoid:

- glossy startup gradients
- loud cards
- shadow-heavy SaaS styling
- over-animated hero sections
- dashboard-like density

## Technical Recommendation

Use Astro with a small component set:

- `BaseLayout.astro`
- `Hero.astro`
- `WorkAccordion.astro`
- `Principles.astro`
- `NowSection.astro`
- `LinksFooter.astro`

Use CSS variables for:

- colors
- fonts
- spacing
- border styles

Use a tiny amount of client-side JavaScript only for the accordion if needed.

The first implementation should optimize for clarity and editability, not abstraction.

## Content Model

Represent project data in one local content object or simple data file.

Each project needs:

- `title`
- `summary`
- `tags`
- `problem`
- `systemShape`
- `automates`
- `whyItMatters`
- `link` for public items only

This gives the page enough structure to stay clean without turning it into a CMS.

## What Not To Build Yet

Do not add these in the first version:

- separate project pages
- blog or notes section
- fancy theme switcher
- resume download
- timeline
- testimonials
- animated metrics
- contact form

All of those can wait until the single-page version is clearly good.

## Success Criteria

The first version is successful if:

- the page feels calm and credible
- the three projects tell a coherent story
- the private projects feel concrete without exposing specifics
- the writing is modest but not vague
- the site makes the user look serious, thoughtful, and real

## Recommended Next Step

Create the Astro site inside `/root/projects/portfolio/website` and implement only the single-page skeleton first:

- layout
- hero
- project accordion
- principles
- now
- links

Do not refine animation or polish details until the content reads correctly.

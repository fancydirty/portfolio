const en = {
  nav: {
    work: "Work",
    howIWork: "How I work",
    now: "Now",
    links: "Links",
  },
  hero: {
    line: "I build agents you don't have to babysit — they act on evidence, not vibes.",
    sub: "My flagship, Mediary Scout, treats acquisition as a state problem: an agent searches real sources, transfers the best match into your own cloud drive, then re-reads to verify what actually landed — and a scheduler keeps closing the gaps. The discipline lives in software — workflow state, typed boundaries, snapshots, retries, audit logs — not in prompt wishful thinking.",
    status: "Focused on agent product engineering: state machines, verification, and gateways — not just prompts.",
  },
  work: {
    eyebrow: "SELECTED WORK",
    caseStudy: "case study",
    backToWork: "← Back",
    sections: {
      whatItIs: "What it is",
      inputsOutputs: "Inputs & outputs",
      whatMadeItHard: "What made it hard",
      whatIDecided: "What I decided",
      whatChanged: "What changed",
    },
  },
  howIWork: {
    eyebrow: "HOW I WORK",
    items: [
      {
        title: "Express intent, don't supervise.",
        body: "The user shouldn't babysit an agent. They say what they want, connect their account, and get results. The agent stays a strong, task-scoped actor inside a system-owned sandbox — not the product surface, and not a weak judgment API.",
      },
      {
        title: "Acquisition is a state problem.",
        body: "Most automation either searches well but never knows what you're still missing, or moves files but never checks what landed. I model it as state: season-level coverage, the gaps, and a scheduler that only comes back for what's still incomplete.",
      },
      {
        title: "Act on evidence, then verify.",
        body: "The agent reads real search results — picking by quality, subtitles, and dedup — transfers, then re-reads the drive to confirm what actually arrived. A fluent answer isn't enough; the system has to show what happened.",
      },
      {
        title: "Move discipline from prompts into software.",
        body: "Stop-before-side-effects, bind a plan, verify after — the right shape for a prompt-driven skill, but fragile. The product pushes those rules into workflow state, typed I/O, policy checks, retries, and audit logs.",
      },
      {
        title: "The gateway is part of the agent.",
        body: "I don't expose an agent runtime to the internet. A business gateway owns anonymous sessions, abuse controls, streaming recovery, and the boundary between public traffic and private tools.",
      },
    ],
  },
  now: {
    eyebrow: "NOW",
    body: "The flagship right now is Mediary Scout — an agent that fills your own cloud-drive media library by acting on evidence and tracking what's still missing, with the discipline enforced in software rather than prompts. The agent you can talk to on this page is the same engineering on a different surface: a representative that answers recruiters from real project evidence. The interesting part is never just the model — it's the product boundary around it: state, verification, gateways, observability, and the small fixes that make a public agent feel steady instead of experimental.",
  },
  links: {
    eyebrow: "LINKS",
    github: "https://github.com/fancydirty",
    email: "fancydirty@gmail.com",
    items: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/%E4%B9%90-%E5%91%A8-967660354/" },
      { label: "Bilibili", href: "https://space.bilibili.com/5582337?spm_id_from=333.1007.0.0" },
    ],
  },
  agent: {
    eyebrow: "TALK TO MY AGENT",
    title: "Ask my representative agent",
    intro:
      "This panel is the live adk-agent backend, not a canned script. Ask it about the architecture or how I'd fit a role.",
    inputPlaceholder: "Ask about a project, a decision, or a role…",
    sendLabel: "Send",
    headerNote: "my representative",
    tryAsking: "TRY ASKING",
    userRole: "YOU",
    assistantRole: "AGENT",
    presets: [
      "Walk me through the Mediary Scout architecture.",
      "Assess my fit for a senior backend role.",
      "What reliability engineering have you done?",
    ],
    turnstilePrompt: "Quick human check before we start.",
    streamError: "The stream dropped. Try again.",
    retry: "Retry",
    fallbackTitle: "Talk to my representative agent",
    fallbackBody:
      "The in-page panel is offline right now. The agent is still live on its own page.",
    fallbackCta: "Open the agent →",
    homeCta: "Or talk to my representative agent, live →",
  },
  themeToggle: {
    toLight: "Light",
    toDark: "Dark",
  },
} as const;

// Widen literal types so other locales can supply different string values
// while keeping the exact same key structure and array lengths.
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? { [K in keyof T]: Widen<U> }
    : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
export default en;

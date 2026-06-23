const en = {
  nav: {
    work: "Work",
    howIWork: "How I work",
    now: "Now",
    links: "Links",
  },
  hero: {
    line: "I build agent workflows that survive the edge between demo and product.",
    sub: "Frameworks make the first agent cheap. My work starts where the demo stops: gateway boundaries, state, stream recovery, tool isolation, latency, deployment, and feedback from people who actually use it.",
    status: "Focused on agent product engineering, not just agent prompts.",
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
        title: "Frameworks make demos cheap.",
        body: "ADK can give you a stateful, tool-calling agent quickly. That is useful, but it is only the starting line. The harder work begins when the agent has to face unknown users, uploads, bad traffic, slow tools, and broken streams.",
      },
      {
        title: "The gateway is part of the agent.",
        body: "I do not want to expose an agent runtime directly to the internet. The business gateway owns anonymous sessions, file validation, abuse controls, resume delivery, streaming recovery, and the boundary between public traffic and private tools.",
      },
      {
        title: "State should outlive refreshes and crashes.",
        body: "If a user refreshes the page, or a long run stutters, the system should still know who they are and what already happened. This has held across media tracking, internal ops, content pipelines, and now web agents.",
      },
      {
        title: "Latency is product behavior.",
        body: "A slow first token changes whether the agent feels alive. Moving MCP startup out of the hot path and keeping tools warm mattered as much as prompt wording, because the user experiences the whole system, not just the model.",
      },
      {
        title: "Evidence beats fluent answers.",
        body: "The agent should answer from profile data, project records, uploaded context, and tool results. A polished response is not enough if the system cannot show where its judgment came from.",
      },
    ],
  },
  now: {
    eyebrow: "NOW",
    body: "Right now I am using a recruiting representative agent as the test case. It has to speak with strangers, remember sessions, accept context, use my project evidence, and leave useful records for me to review later. The agent itself is no longer the only interesting part. The product boundary around it now matters just as much: gateway design, streaming behavior, abuse control, observability, and the small fixes that make a public agent feel steady instead of experimental.",
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

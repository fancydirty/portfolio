export type Project = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  whatItIs: string;
  inputsOutputs: string;
  whatMadeItHard: string;
  whatIDecided: string;
  whatChanged: string;
  link?: string;
  hasDiagram?: boolean;
};

export const projects: Project[] = [
  {
    id: "clawd-media-track",
    title: "clawd-media-track",
    summary:
      "A public OpenClaw skill that turns media acquisition into a stateful workflow instead of a one-shot search.",
    tags: ["OpenClaw", "Workflow", "State"],
    whatItIs:
      "An OpenClaw agent skill that turns media acquisition into a stateful workflow. It splits work into three explicit task contracts: Type 1 (one-shot acquisition), Type 2 (tracking initialization when coverage is incomplete), and Type 3 (scheduled monitoring for missing episodes). State lives in SQLite, and safety patterns like Protected Collections and Transfer Binding prevent agents from making partial decisions or re-searching between judgment and execution.",
    inputsOutputs:
      "The runtime starts with TMDB metadata, PanSou search results, 115 directory state, and a local SQLite record of tracked seasons. From there it can create a landing directory, transfer the chosen resource into 115, write tracking state, and later run a scheduled pass that only searches for uncovered gaps.",
    whatMadeItHard:
      "The hard part was not finding a magnet link. The hard part was making hidden state visible enough that an agent could tell the difference between a finished movie, a partially covered season, and a season that still needed monitoring, while also making sure high-blast-radius 115 operations could not quietly hit the wrong directory.",
    whatIDecided:
      "The main judgment call was refusing to hide everything behind one clever agent loop. I made bootstrap explicit, split the work into Type 1, Type 2, and Type 3 contracts, let the database carry the season-level state, and added hard guardrails where a wrong move in 115 would have too much blast radius.",
    whatChanged:
      "The result is a public repository with a real bootstrap flow, tested runtime modules, documented scheduled-run behavior, and a workflow that can be demonstrated end to end instead of only working on my own machine.",
    link: "https://github.com/fancydirty/clawd-media-track",
    hasDiagram: true,
  },
  {
    id: "private-enterprise-workflow",
    title: "private enterprise workflow",
    summary:
      "An anonymous internal operations pipeline that replaced a fragile manual chain with a supervised, long-running system.",
    tags: ["Internal Ops", "Automation", "Reliability"],
    whatItIs:
      "This is a private multi-step operations system built for a recurring internal mailbox workflow. It continuously polls for new items, fetches the message details, pulls attachments when needed, runs an AI review stage, and then sends the final notification output without requiring someone to sit there and babysit each hop.",
    inputsOutputs:
      "The system takes in new inbound records, stores their status in SQLite, keeps session files and auth state alive, and moves each item through several explicit steps: UID polling, detail fetch, attachment capture, AI analysis, and notification. The output is not just a report but a queue that can keep advancing itself safely after launch.",
    whatMadeItHard:
      "The difficulty was operational rather than algorithmic. The workflow had brittle auth, browser state, cookies, screenshots, and a real risk that one broken stage would stall everything behind it. A clever demo would not help much if the loop could not survive normal production messiness for weeks at a time.",
    whatIDecided:
      "I decided very early that this could not be one big script. Each step had to have a visible boundary, shared state had to live in SQLite instead of memory, and auth refresh had to stay separate from the main processing loop. Running it under Docker and supervisord was part of the same choice: I wanted each stage to restart, wait, or recover without taking the rest of the chain down with it.",
    whatChanged:
      "After launch it became a low-touch internal system that can stay in motion for long stretches with minimal intervention. What matters to me here is not the absence of a public UI. It is the fact that a messy, failure-prone workflow became stable enough to leave alone.",
    hasDiagram: true,
  },
  {
    id: "private-content-pipeline",
    title: "private content pipeline",
    summary:
      "An anonymous content operation where the site is only one visible layer of a larger generation, QA, and distribution system.",
    tags: ["Content Ops", "QA", "Distribution"],
    whatItIs:
      "This project looks like a content site from the outside, but the interesting part is the workflow behind it. Articles, hero assets, topic coverage, syndication copies, and distribution bundles are all treated as coordinated stages in one pipeline instead of as isolated files scattered around a repo.",
    inputsOutputs:
      "The pipeline begins with topic direction and source material, then carries each article through frontmatter checks, orchestration QA, hero-image generation, ledger updates, topic-map coverage, and channel-specific distribution bundles. Its output is not just a built Astro site, but a reviewable package of validated article files plus derivative assets ready for downstream posting.",
    whatMadeItHard:
      "The hard part was preventing drift. Once content generation, hero assets, article metadata, topical coverage, and channel bundles start moving independently, the system becomes unreliable very quickly. The project needed QA gates strong enough to stop bad state before it quietly spread across the whole content operation.",
    whatIDecided:
      "The key decision was to treat content operations as stateful work, not as a stream of isolated generations. I made the ledger and topic map first-class state, split QA into separate checks for content, orchestration, distribution, and syndication, and kept derivative assets Markdown-first so they stayed reviewable. That is what kept the system from turning into a pile of prompts glued to a static site.",
    whatChanged:
      "The result is a system that can keep generating, checking, packaging, and preparing content with much less manual coordination. What I am proud of is not only the site output, but the amount of hidden workflow state I was able to make explicit, enforceable, and hard to lose.",
    hasDiagram: true,
  },
];

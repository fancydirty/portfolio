export type FiveSection = {
  whatItIs: string;
  inputsOutputs: string;
  whatMadeItHard: string;
  whatIDecided: string;
  whatChanged: string;
};

export type Project = {
  id: string;
  name: string;
  visibility: "public" | "private" | "live";
  flagship?: boolean;
  summary: { en: string; zh: string };
  tags: string[];
  metrics?: { value: string; key: string }[];
  links: { repo?: string; demo?: string; live?: string };
  content: { en: FiveSection; zh: FiveSection };
};

export const projects: Project[] = [
  {
    id: "mediary-scout",
    name: "Mediary Scout",
    visibility: "public",
    flagship: true,
    summary: {
      en: "A self-hosted, agent-driven media library for your own cloud drives: you ask for a title, an LLM agent scouts indexers, transfers the best match into your 115 / Quark drive, re-reads the real drive to verify what landed, and keeps tracking what's still missing.",
      zh: "一个自部署、agent 驱动、面向你自己网盘的媒体库：你说要某部片，LLM agent 跨索引源搜罗资源、把最合适的转存进你的 115 / 夸克网盘、回读真实网盘验证落了什么，并持续追踪还缺什么。",
    },
    tags: ["Next.js 16", "Postgres", "Agent", "Self-hosted"],
    metrics: [
      { value: "Next.js 16", key: "Cache Components" },
      { value: "~755", key: "Vitest · CI" },
      { value: "Postgres", key: "jsonb · resumable" },
      { value: "1 cmd", key: "docker compose up" },
    ],
    links: {
      repo: "https://github.com/fancydirty/mediary-scout",
      demo: "https://mediary.dirtyfancy.sbs",
    },
    content: {
      en: {
        whatItIs:
          "Mediary Scout is open-source, self-hosted software that treats media acquisition as a state problem rather than a one-shot search. You run your own instance and bring your own drive, LLM, and metadata credentials; from the web UI you ask for a movie, show, or anime, and a sandboxed LLM agent acts from evidence: it scouts resources across your indexers, picks the best match, transfers it into your own 115 or Quark cloud drive, and then re-reads the drive to confirm what actually landed.",
        inputsOutputs:
          "Inputs are a requested title plus TMDB metadata, resource search results from PanSou and optionally Prowlarr, the live state of your 115 / Quark drive, and the season-level tracking records in Postgres. The agent transfers shares or magnets straight into the drive (秒传 / save, never a local download), writes verified coverage back to the database, and emits per-acquisition and daily-digest notifications. A scheduled sweep returns only for shows that still have missing episodes, so the output is a self-advancing library rather than a one-time report.",
        whatMadeItHard:
          "The hard part was letting an LLM agent touch real, high-blast-radius drive operations without trusting it blindly. Agents misjudge quality, pick duplicates, or claim a transfer succeeded when it didn't. State is also genuinely hidden: telling a finished movie apart from a half-covered season apart from one that still needs monitoring requires re-reading the actual drive, not believing cached chat history, and runs have to survive worker restarts mid-flight.",
        whatIDecided:
          "I localized the agent's recurring mistakes into the prompts and turned the things that must never be bypassed into deterministic validators the agent cannot talk its way around. The deterministic TypeScript workflow owns every side effect and re-reads real drive state to verify, while the agent gets narrow, audited powers. State lives in Postgres the whole way so a run can rebuild itself from the real drive plus the database after a restart, instead of from chat history. New drive brands plug into a storage-brand registry so adding one stays a contained change.",
        whatChanged:
          "Its predecessor was an OpenClaw agent-skill where the rules lived in prompts; here those rules moved out of prompts and into a deterministic TS workflow with non-bypassable validators. The result is a real product you can stand up with one command (docker compose up), backed by ~755 Vitest cases in CI, a Postgres-backed resumable queue, a season-level tracking state machine, and a public read-only demo built straight from the repo.",
      },
      zh: {
        whatItIs:
          "Mediary Scout 是开源、自部署软件，把媒体获取当成一个状态问题，而不是搜完就走。你自己跑实例，自带网盘、LLM 和元数据凭证；在 web UI 里说要某部电影、剧或番，一个沙盒 LLM agent 就「凭证据行动」：跨索引源搜罗资源、挑出最合适的、转存进你自己的 115 或夸克网盘，然后回读网盘确认到底落了什么。",
        inputsOutputs:
          "输入是一个目标片名，外加 TMDB 元数据、来自 PanSou（可选 Prowlarr）的搜索结果、115 / 夸克网盘的实时状态，以及 Postgres 里的季级追踪记录。agent 直接把分享或磁力转存进网盘（秒传 / save，从不往本地下载），把验证过的覆盖状态写回数据库，并发出单部获取与每日巡检摘要通知。定时巡检只回来处理仍有缺集的剧，所以产出的是一个能自我推进的媒体库，而不是一次性报告。",
        whatMadeItHard:
          "难点在于：要让 LLM agent 触碰真实、高杀伤力的网盘操作，又不能盲目信任它。agent 会看走眼、挑到重复资源，或者明明没转成功却声称成功了。状态也确实是隐藏的：要分清一部已完结的电影、一季只收了一半、还有一季仍需盯更，必须回读真实网盘，而不是相信缓存的对话历史；而且 run 必须能在 worker 中途重启后还活着。",
        whatIDecided:
          "我把 agent 反复犯的错误「本地化」进 prompt，把那些绝不能被绕过的东西做成 agent 无论如何也说服不了的确定性校验器。确定性的 TypeScript workflow 拥有每一处副作用，并回读真实网盘状态做验证，而 agent 只拿到窄而受审计的权限。状态全程落 Postgres，所以 run 可以在重启后从真实网盘加数据库状态重建，而不是从对话历史重建。新网盘品牌接入一个 storage-brand 注册表，让接入新盘始终是个收敛的改动。",
        whatChanged:
          "它的前身是一个 OpenClaw agent-skill，规则住在 prompt 里；到这一版，这些规则从 prompt 里搬了出来，落进确定性的 TS workflow 和不可绕过的校验器。最终是一个一条命令（docker compose up）就能拉起来的真实产品：CI 里有约 755 个 Vitest 用例、一个 Postgres 支撑的可续跑队列、一台季级追踪状态机，以及一个直接由本仓库构建的公开只读 demo。",
      },
    },
  },
  {
    id: "adk-agent",
    name: "adk-agent",
    visibility: "live",
    summary: {
      en: "A private web-based representative agent that speaks for me in recruiting conversations using live project evidence.",
      zh: "一个私有的网页端候选人代表 Agent，用真实项目证据替我回答招聘沟通中的问题。",
    },
    tags: ["Google ADK", "Recruiting Agent", "SSE"],
    links: {
      live: "https://agent.dirtyfancy.sbs",
    },
    content: {
      en: {
        whatItIs:
          "A private candidate representative agent built around Google ADK. It is not a resume chatbot that talks about me from a distance; it is designed to answer recruiters as my representative, using profile data, mirrored repositories, GitNexus code intelligence, document tools, image analysis, and recruiter-specific skills to ground its answers in evidence.",
        inputsOutputs:
          "The system starts with a recruiter message, optional uploads such as job descriptions or screenshots, my structured profile, resume assets, and read-only mirrors of my projects. The backend validates the request, stores session state, runs the ADK root agent with MCP and function tools, streams the answer back through SSE, and can return fit analysis, project explanations, file analysis, or a resume download link.",
        whatMadeItHard:
          "The hard part was turning a personal demo into a real web agent surface. It needed anonymous user isolation, upload validation, quota and abuse controls, resumable streaming, production logging by boundary, and tool guardrails, while still preserving the agent's ability to inspect evidence and answer naturally.",
        whatIDecided:
          "I put a FastAPI business gateway in front of ADK instead of exposing the agent runtime directly. That made session ownership, anonymous restrictions, Turnstile challenges, file handling, stream replay, and resume delivery part of the product boundary, while ADK stayed focused on reasoning, tools, and synthesis.",
        whatChanged:
          "The result is a working private agent product rather than a local ADK experiment: a Next.js assistant-ui frontend, a Railway-hosted FastAPI/ADK backend, read-only repo intelligence, upload-aware chat, persistent session state, and recovery logic for long streaming runs.",
      },
      zh: {
        whatItIs:
          "这是一个围绕 Google ADK 搭建的私有候选人代表 Agent。它不是从第三人称角度介绍我的简历机器人，而是被设计成在招聘沟通里替我发言：读取我的结构化资料、简历资产、镜像项目、GitNexus 代码情报、文档工具、图像分析和招聘场景技能，用证据支撑回答。",
        inputsOutputs:
          "输入可以是一条招聘方消息，也可以包含职位描述、截图或文档上传。系统会结合我的资料、简历资产和只读项目镜像，由后端完成请求校验、会话状态保存、ADK 根 Agent 调用、MCP 与函数工具调用，并通过 SSE 把回答流式返回。输出可以是岗位匹配分析、项目解释、文件分析，或者简历下载链接。",
        whatMadeItHard:
          "难点是把一个个人演示变成真正可用的网页 Agent 产品面。它需要匿名用户隔离、上传校验、配额和滥用控制、可恢复的流式输出、按边界记录的生产日志和工具护栏，同时又不能把 Agent 检索证据、自然回答的能力锁死。",
        whatIDecided:
          "我没有把 ADK 运行时直接暴露给前端，而是在它前面放了一个 FastAPI 业务网关。这样，会话归属、匿名限制、Turnstile、文件处理、流恢复和简历分发都被收进产品边界；ADK 则专注于推理、工具调用和综合回答。",
        whatChanged:
          "最后它不再只是本地 ADK 实验，而是一个能跑的私有 Agent 产品：Next.js assistant-ui 前端、Railway 上的 FastAPI/ADK 后端、只读仓库情报、支持上传的聊天、持久会话状态，以及长流式运行时的恢复逻辑。",
      },
    },
  },
  {
    id: "enterprise-workflow",
    name: "private enterprise workflow",
    visibility: "private",
    summary: {
      en: "An anonymous internal operations pipeline that replaced a fragile manual chain with a supervised, long-running system.",
      zh: "一条匿名内部运营管道，用长期运行的受控系统替代了原本脆弱的人工链路。",
    },
    tags: ["Internal Ops", "Automation", "Reliability"],
    links: {},
    content: {
      en: {
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
      },
      zh: {
        whatItIs:
          "这是一个为周期性内部邮箱工作流搭建的私有多步运营系统。它会持续轮询新邮件、抓取详情、按需下载附件、跑 AI 审查，最后自动发通知——不需要人守在屏幕前一步一步盯着。",
        inputsOutputs:
          "系统接收新入站记录，状态存在 SQLite 里，会话和认证也保持活跃。每个条目会依次走过几个明确步骤：UID 轮询、详情抓取、附件下载、AI 分析、发送通知。最终产出的不只是一份报告，而是一个启动后能自己往前推的队列。",
        whatMadeItHard:
          "难点不在算法，在运营。认证容易掉、浏览器状态会崩、Cookie 会过期、截图会失败，还有一个现实风险：只要中间有一环卡住，后面全跟着堵。一个只能在 Demo 里跑几圈的聪明循环，到了真实环境里撑不过几周就没用了。",
        whatIDecided:
          "我很早就定了：不能写一个大脚本包所有事。每个步骤之间要有清晰的边界，共享状态必须落盘到 SQLite 而不是放内存里，认证刷新也要和主处理循环拆开。用 Docker 和 supervisord 来跑也是同一套思路：任何一环重启、等待或者恢复，都不能把整条链拖下水。",
        whatChanged:
          "上线之后，它成了一个低维护的内部系统，能长时间自运转，偶尔看一眼就行。我自豪的不是它有没有漂亮的公开界面，而是一个原本又乱又容易崩的流程，终于变得足够稳，可以放心让它自己跑了。",
      },
    },
  },
  {
    id: "content-pipeline",
    name: "private content pipeline",
    visibility: "private",
    summary: {
      en: "An anonymous content operation where the site is only one visible layer of a larger generation, QA, and distribution system.",
      zh: "一个匿名内容运营项目，网站只是冰山一角，背后是一套完整的生成、质检和分发系统。",
    },
    tags: ["Content Ops", "QA", "Distribution"],
    links: {},
    content: {
      en: {
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
      },
      zh: {
        whatItIs:
          "从外面看像个内容站，但真正有意思的是背后的工作流。文章、主图、选题覆盖、分发文案、渠道包，这些都被当成同一个管道里的协作阶段，而不是仓库里东一块西一块的孤立文件。",
        inputsOutputs:
          "起点是选题方向和源材料，然后每篇文章会依次过 frontmatter 检查、编排 QA、主图生成、台账更新、选题覆盖图和渠道分发包。最终产出的不只是一个构建好的 Astro 站点，而是一整套可审查、已验证的文章文件包，加上给下游渠道准备好的衍生资产。",
        whatMadeItHard:
          "最头疼的是防止「漂移」。内容生成、主图、文章元数据、选题覆盖、渠道包，这些东西一旦各自为政，系统很快就会变得不可信。必须在前置 QA 上把门槛筑高，在坏状态还没蔓延到整个运营体系之前就把它拦住。",
        whatIDecided:
          "关键决策是：把内容运营当成有状态的工作来做，而不是一串彼此无关的生成结果。我把台账和选题图提到「一等公民」的位置，把 QA 拆成内容、编排、分发、联合发布四个独立检查面，并且让衍生资产优先用 Markdown 保存，保证随时可审查。正是这些设计，让这个系统没有沦为一堆粘在静态站点上的 prompt。",
        whatChanged:
          "最后搭成了一个能持续生成、检查、打包、准备的系统，需要的人工协调比以前少得多。我骄傲的不仅是站点本身，而是我把多少原本藏在流程里的状态，变成了显式、可执行而且不容易丢的东西。",
      },
    },
  },
];

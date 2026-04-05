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
      "一个公开的 OpenClaw 技能，让媒体获取不再是搜完就走，而变成能记住状态、持续跟进的工作流。",
    tags: ["OpenClaw", "Workflow", "State"],
    whatItIs:
      "一个 OpenClaw Agent 技能，让媒体获取变成有状态的工作流。我把任务拆成三类明确契约：Type 1（一次性获取）、Type 2（coverage 不完整时启动追踪）和 Type 3（定期扫描补齐缺失集数）。状态存在 SQLite 里，Protected Collections 和 Transfer Binding 这些安全机制用来防止 Agent 做一半决策，或者在\"看上\"和\"动手\"之间反复横跳。",
    inputsOutputs:
      "输入是 TMDB 元数据、PanSou 搜索结果、115 目录状态和本地 SQLite 的追踪记录。输出动作包括创建落地目录、把选好的资源转进 115、写入追踪状态，之后还会定期扫描，只搜那些还没补齐的缺口。",
    whatMadeItHard:
      "难的不是找磁力链接，难的是怎么让隐藏状态对 Agent 足够透明——让它分得清哪些电影已经完结、哪些季度只收了一半、哪些还得继续盯；同时确保 115 这种高杀伤力的操作不会悄咪咪地进错目录。",
    whatIDecided:
      "核心判断是：拒绝把所有逻辑塞进一个\"聪明\"的 Agent 循环里。我把引导流程做得显式可见，把任务拆成 Type 1/2/3 三类契约，让数据库来扛季度级别的状态，并在 115 操作杀伤力过大的地方加了硬护栏。",
    whatChanged:
      "最后产出的是一个公开仓库，有真实的引导流程、可测试的运行时模块、有文档的定时运行逻辑，以及一个能完整演示、不只是在我自己电脑上才能跑的工作流。",
    link: "https://github.com/fancydirty/clawd-media-track",
    hasDiagram: true,
  },
  {
    id: "private-enterprise-workflow",
    title: "private enterprise workflow",
    summary:
      "一条匿名内部运营管道，用长期运行的受控系统替代了原本脆弱的人工链路。",
    tags: ["Internal Ops", "Automation", "Reliability"],
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
    hasDiagram: true,
  },
  {
    id: "private-content-pipeline",
    title: "private content pipeline",
    summary:
      "一个匿名内容运营项目，网站只是冰山一角，背后是一套完整的生成、质检和分发系统。",
    tags: ["Content Ops", "QA", "Distribution"],
    whatItIs:
      "从外面看像个内容站，但真正有意思的是背后的工作流。文章、主图、选题覆盖、分发文案、渠道包，这些都被当成同一个管道里的协作阶段，而不是仓库里东一块西一块的孤立文件。",
    inputsOutputs:
      "起点是选题方向和源材料，然后每篇文章会依次过 frontmatter 检查、编排 QA、主图生成、台账更新、选题覆盖图和渠道分发包。最终产出的不只是一个构建好的 Astro 站点，而是一整套可审查、已验证的文章文件包，加上给下游渠道准备好的衍生资产。",
    whatMadeItHard:
      "最头疼的是防止\"漂移\"。内容生成、主图、文章元数据、选题覆盖、渠道包，这些东西一旦各自为政，系统很快就会变得不可信。必须在前置 QA 上把门槛筑高，在坏状态还没蔓延到整个运营体系之前就把它拦住。",
    whatIDecided:
      "关键决策是：把内容运营当成有状态的工作来做，而不是一串彼此无关的生成结果。我把台账和选题图提到\"一等公民\"的位置，把 QA 拆成内容、编排、分发、联合发布四个独立检查面，并且让衍生资产优先用 Markdown 保存，保证随时可审查。正是这些设计，让这个系统没有沦为一堆粘在静态站点上的 prompt。",
    whatChanged:
      "最后搭成了一个能持续生成、检查、打包、准备的系统，需要的人工协调比以前少得多。我骄傲的不仅是站点本身，而是我把多少原本藏在流程里的状态，变成了显式、可执行而且不容易丢的东西。",
    hasDiagram: true,
  },
];

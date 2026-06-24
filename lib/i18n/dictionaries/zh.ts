import type { Dictionary } from "./en";

const zh: Dictionary = {
  nav: {
    work: "作品",
    howIWork: "我怎么做",
    now: "近况",
    links: "链接",
  },
  hero: {
    line: "我做不用你盯着的 agent——它凭证据行动，而不是凭感觉。",
    sub: "我的旗舰 Mediary Scout 把「获取」当成状态问题：agent 跨真实源搜索、把最合适的转存进你自己的网盘、转存后回读验证到底落了什么，再由定时巡检持续补缺。纪律落在软件里——工作流状态、类型化边界、快照、重试、审计日志——而不是靠 prompt 的一厢情愿。",
    status: "专注 agent 产品工程：状态机、验证、网关——不只是写 prompt。",
  },
  work: {
    eyebrow: "精选作品",
    caseStudy: "案例研究",
    backToWork: "← 返回",
    sections: {
      whatItIs: "是什么",
      inputsOutputs: "输入与输出",
      whatMadeItHard: "难在哪",
      whatIDecided: "我的决策",
      whatChanged: "带来的改变",
    },
  },
  howIWork: {
    eyebrow: "我怎么做",
    items: [
      {
        title: "让用户表达意图，而不是监督 agent。",
        body: "用户不该盯着 agent。他说出想要什么、接上自己的账号、拿到结果。agent 始终是系统沙箱里一个任务范围明确的强执行者——不是产品本身，也不是一个弱判断 API。",
      },
      {
        title: "获取是个状态问题。",
        body: "多数自动化要么搜得好却不知道你还缺哪集，要么会搬文件却从不验证落了什么。我把它建模成状态：季级覆盖、缺口，以及只回来处理仍不完整剧集的定时巡检。",
      },
      {
        title: "凭证据行动，然后验证。",
        body: "agent 读真实搜索结果——按画质、字幕、去重来挑——转存后回读网盘确认到底落了什么。答得漂亮还不够，系统必须能说清发生了什么。",
      },
      {
        title: "把纪律从 prompt 搬进软件。",
        body: "先停在副作用前、绑定计划、事后验证——这对 prompt 驱动的 skill 是对的形态，但脆弱。产品要把这些规则落进工作流状态、类型化 I/O、策略校验、重试和审计日志。",
      },
      {
        title: "网关是 agent 的一部分。",
        body: "我不把 agent 运行时直接暴露给互联网。业务网关负责匿名会话、滥用控制、流恢复，以及公网流量和私有工具之间的边界。",
      },
    ],
  },
  now: {
    eyebrow: "近况",
    body: "现在的旗舰是 Mediary Scout——一个凭证据行动、持续追踪还缺什么的 agent，把你自己网盘的媒体库填起来，纪律靠软件而非 prompt 兜住。你在本页能对话的 agent 是同一套工程换了个面：一个用真实项目证据回答招聘方的代表。有意思的从来不只是模型，而是它周围的产品边界：状态、验证、网关、可观测性，以及那些让公网 agent 从实验感变成稳定感的小修小补。",
  },
  links: {
    eyebrow: "链接",
    github: "https://github.com/fancydirty",
    email: "fancydirty@gmail.com",
    items: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/%E4%B9%90-%E5%91%A8-967660354/" },
      { label: "Bilibili", href: "https://space.bilibili.com/5582337?spm_id_from=333.1007.0.0" },
    ],
  },
  agent: {
    eyebrow: "和我的 AGENT 对话",
    title: "问我的代表 Agent",
    intro:
      "这个面板就是活的 adk-agent 后端，不是预设脚本。问它架构，或问它我适不适合某个岗位。",
    inputPlaceholder: "问一个项目、一个决策，或一个岗位……",
    sendLabel: "发送",
    headerNote: "我的代表",
    tryAsking: "试着问",
    userRole: "你",
    assistantRole: "AGENT",
    presets: [
      "讲讲 Mediary Scout 的架构。",
      "评估我对某个资深后端岗位的匹配度。",
      "你做过哪些可靠性工程？",
    ],
    turnstilePrompt: "开始前先做个人机验证。",
    streamError: "流式中断了，请重试。",
    retry: "重试",
    fallbackTitle: "和我的代表 Agent 对话",
    fallbackBody: "站内面板暂时离线，Agent 在它自己的页面上仍然在线。",
    fallbackCta: "打开 Agent →",
    homeCta: "或者，和我的代表 Agent 实时对话 →",
  },
  themeToggle: {
    toLight: "浅色",
    toDark: "深色",
  },
};
export default zh;

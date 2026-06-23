import type { Dictionary } from "./en";

const zh: Dictionary = {
  nav: {
    work: "作品",
    howIWork: "我怎么做",
    now: "近况",
    links: "链接",
  },
  hero: {
    line: "我搭建能越过 demo 边界的 Agent 工作流。",
    sub: "现在做出一个会聊天的 Agent 已经不难。真正的难点在它周围：网关边界、状态、流恢复、工具隔离、延迟、部署，以及真实用户聊完之后留下的反馈。",
    status: "当前关注：Agent 产品工程，而不只是 Agent prompt。",
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
        title: "框架让 demo 变便宜。",
        body: "ADK 能很快给你一个有状态、能调用工具的 Agent。这很好，但那只是起点。真正麻烦的是陌生用户、上传文件、恶意流量、慢工具和断掉的流。",
      },
      {
        title: "网关就是 Agent 的产品边界。",
        body: "我不想把整个 ADK runtime 直接暴露给互联网。业务网关要负责匿名会话、文件校验、滥用控制、简历分发、流恢复，以及公网流量和私有工具之间的边界。",
      },
      {
        title: "状态必须活过刷新和崩溃。",
        body: "用户刷新页面，或者长流式输出抖了一下，系统也应该知道他是谁、之前发生了什么。这个原则在媒体追踪、内部运营、内容管道和 Web Agent 里都成立。",
      },
      {
        title: "延迟不是小问题，是体验本身。",
        body: "首 token 慢不慢，会直接改变 Agent 有没有“活着”的感觉。把 MCP 启动移出热路径、让工具保持预热，和 prompt 本身一样影响用户体验。",
      },
      {
        title: "证据比流畅更重要。",
        body: "Agent 应该基于 profile、项目记录、上传上下文和工具结果来回答。答案说得漂亮还不够，系统必须知道自己的判断从哪里来。",
      },
    ],
  },
  now: {
    eyebrow: "近况",
    body: "当前的测试场景是求职代表 Agent。它需要和陌生人对话，记住会话，接收上下文，使用我的项目证据，并把有价值的沟通记录留下来，方便我之后复盘。Agent 本身已经不是唯一有意思的部分。围绕它的产品边界同样重要：网关设计、流式体验、滥用控制、可观测性，以及那些让公网 Agent 从实验感变成稳定感的小修小补。",
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
  themeToggle: {
    toLight: "浅色",
    toDark: "深色",
  },
};
export default zh;

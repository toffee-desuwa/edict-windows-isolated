# Phase 1A — Chancellor + Drafter Minimal Slice

本文件是 Phase 1A 的公开安全版 README 草稿。该阶段是从 Edict fork 基础上长出的 `experiment/chancellor-phase1a` 方向，用于验证最小可行协作机制，不追求一次性覆盖全部能力。它不替代 main，也不改写原 fork 的 Windows isolated-install MVP 资产。
公开示例配置主要展示 Feishu 侧的绑定关系与 agent 结构；本地 UI 验证属于本次 Phase 1A 的实际验证结果，不单独体现在该示例配置中。
Phase 1A 只验证“丞相 + 起草官”的最小协作链：用户 -> 丞相 -> 起草官 -> 丞相 -> 用户。  
在这条链路中，丞相负责接收请求、判断范围、提炼约束、下发 BRIEF、回收 DRAFT 并生成 FINAL；起草官负责按 BRIEF 产出可交付草稿并回传，不承担跨范围决策与制度扩展。验收重点是链路跑通、分工清晰、结果可复盘，而不是功能铺满。

这条最小协作链已在本地 UI 与 Feishu 两侧完成验证。

已验证内容：
- 3 个支持范围样例：
  - 短提纲
  - 短说明
  - 短回复草稿
- 1 个超范围拒绝样例
- 支持范围样例均完整跑通：BRIEF -> DRAFT -> FINAL

Why this matters：这一步证明，可验证协作机制比古风命名壳更重要。到 Phase 1A 为止，已经形成一个可展示、可讲述的最小双 agent slice。

Non-goals：
- 不是完整制度
- 不是六部全开
- 不是 full Windows parity
- 不是官方版本
- 不是 main 分支替代品

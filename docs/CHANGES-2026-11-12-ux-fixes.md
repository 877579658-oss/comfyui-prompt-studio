# 变更：中文输入法、原生弹窗、语义与元信息

日期：2026-11-12（续前一轮验证工作）
文件：`app.js`、`index.html`、`styles.css`（`data/prompts.js`、`server.js` 未改动）
备份：三个文件均有 `*.bak-<时间戳>` 原件

## 1. 中文输入法（P0）

全项目此前 **0 处** `isComposing` 处理，拼音组字期间会误触发：

- `document` 的 `input` 处理器（`setupEvents`）：组字中每个键都触发 `updateVisibility` + `updateOutput` + `saveAutosave` + `renderWizardChecks` → 卡顿、输出框闪过半成品。现加 `event.isComposing || event.keyCode === 229` 守卫。
- 一句话输入框 Enter：选候选词时按 Enter 会被当成「预览识别」并 `preventDefault`，可能打断组字。已加守卫。
- 全局快捷键：`Alt+R/P/C` 无 target 守卫，在任意文本框里也会换风格/换姿势/换镜头。现仅在非输入控件中生效；`Ctrl+Enter` 保持全局可用（与帮助文档一致）。
- 组合框输入、LoRA 触发词输入的回车同样加了守卫。

## 2. 统一确认 / 命名对话框（P1）

移除 3 处原生弹窗，新增 `askDialog()` 与页面内 `<dialog id="confirmDialog">`：

| 原实现 | 位置 | 现实现 |
| --- | --- | --- |
| `window.prompt` 命名收藏 | `savePreset` | 对话框 + 输入框，带 `maxlength=40`，自动聚焦全选 |
| `window.confirm` 删除收藏 | `renderSaved` | 「删除」按钮的确认对话框 |
| `window.confirm` 清空历史 | `clearHistoryButton` | 「清空」按钮的确认对话框 |

保留降级：环境不支持 `dialog` 时仍退回原生弹窗，功能不丢。

## 3. 语义与元信息（P1/P2）

- 品牌标题 `<strong>` → `<h1>`（此前整页 11 个 `h2` 直接开场，无 `h1`），并补 `.brand h1` 样式保持原视觉。
- 补 `<meta name="description">` 与内联 SVG favicon。
- 静态资源版本号 `?v=20261112-ux-1` → `?v=20261112-ux-2`（3 处）。

## 验证

- `node --check`：`app.js` / `server.js` / `data/prompts.js` 全通过。
- 浏览器：无 console error；顶部品牌区视觉与改前一致（截图比对）。
- 对话框自测：保存方案 → 打开（输入框可见、默认名"方案 <时间>"）→ 确定后 `promptStudio.saved.v1` 实际新增 1 条；清空历史 → 打开（无输入框、按钮文案"清空"）→ 取消后关闭。
- 输入法守卫为代码级修复：`isComposing`/`keyCode 229` 分支共 6 处，`Alt` 快捷键新增 `closest("input, textarea, select, [contenteditable]")` 判断。

## 未做（需要单独决策）

- 控件密度：同屏 283 个可见控件、247 个下拉（`section-character` 单区 127 个）。属结构改造，建议单独一轮。
- 断点收敛：现有 12 个不同断点（620/700/720/760/850/900/980/1120/1180/1200/1380/1500），建议收敛到 4 档，但改动面大需回归。
- `data/prompts.js` 词库清理（评审第三轮）。
## 4. 审计追加修复（来自并行代码审计）

- **自动保存丢尾部**：saveAutosave() 只有 250ms 防抖，之前没有 pagehide/isibilitychange 冲刷，改完最后一格立刻刷新会丢。现新增 lushAutosave()，在 pagehide 与页面转入后台时同步落盘。
- **收藏失败仍提示成功**：storageSet() 返回布尔值但调用点不检查，配额满时会提示「方案已收藏」而实际没写入。现 savePreset() 检查返回值，失败时直接返回，由 storageSet 自身的失败提示兜底。

## 5. 审计发现但本轮未实施（需决策）

- **撤销只有一格快照**（P0）：点「换一套风格」后再手改若干项，点 ↺ 会静默丢弃手改并回到「顶部已随机/底部未套用」的中间态。建议改为手改后让快照失效，或把按钮文案改成明示会丢弃后续修改。
- **一句话锁定字段跨重置/恢复残留**：sentenceLockedFields 在 pplyDefaults/pplyState 里不清，重置后再随机会把旧句子值写回。
- **画幅四副本分叉**：atioLock 只有 6 个值而 spectRatio 有 13 个，选 4:3/21:9 等时锁定值不跟随；sizeTouched 是进程级标志，重置/换模型都不复位。
- **控件密度与断点**：同屏 283 个控件、12 个断点，属结构改造。

## 6. 收尾：「收起」失效与游离 BOM

并行审计指出「点收起后连『展开输入』按钮一起消失、且状态持久化，刷新也回不来」。实测复核后结论需要修正：

- 原 CSS 意图是 .cmd-main.is-collapsed { display: none !important; }（整行隐藏），但 styles.css 里存在 **6 个游离 U+FEFF（BOM）字符**，其中一个正好粘在该规则的选择器前，CSSOM 中解析为 \uFEFF .cmd-main.is-collapsed input, ...，导致第一个选择器永不匹配。
- 因此「收起」实际只改了按钮文案，输入框并未隐藏，并不存在不可逆死路；真正的缺陷是**功能半失效**。
- 本轮改为只隐藏 input 与 #sentenceButton，保留「展开输入」按钮，并清除全部 6 个 BOM。

验证（浏览器内自测，CSSOM + computed style）：

| 状态 | is-collapsed | input | 预览按钮 | 收起按钮 | aria-expanded |
| --- | --- | --- | --- | --- | --- |
| 展开 | false | block | block | block（收起） | true |
| 收起 | true | **none** | **none** | block（展开输入） | false |
| 再展开 | false | block | block | block（收起） | true |

## 7. 布局：视图切换器常驻（用户反馈「切换后两个开关位置变化太大」）

实测（浏览器内量 getBoundingClientRect）：

| 模式 | 切换器 top | left | 命令栏高度 |
| --- | --- | --- | --- |
| 快速预设 | 498 | 36 | 456px |
| 详细设置 | 109 | 640 | 64px |

即切换时 **上移 389px、右移 604px**。根因：切换器是命令栏的最后一行，命令栏高度随模式从 456px 塌到 64px，位置被内容推动；且 ody.details-mode .workspace-mode-row{justify-content:space-between} 让它从左对齐翻到右对齐。

改法（Apple HIG 的「导航控件不动、内容动」）：

1. 把 .workspace-tabs 从命令栏底部移到 sticky 区 .top-stack 的**第一行**（.workspace-switcher），上方再无随模式变化的内容。
2. 去掉 ody.details-mode .top-stack{padding-top:5px} 这一 3px 差异。
3. 选中底色由绝对定位的 .workspace-tab-thumb 滑块承担，切换时只做 	ransform 位移（220ms，cubic-bezier(.32,.72,0,1)），不再重排；prefers-reduced-motion 下关闭过渡。
4. 补 :focus-visible 焦点环。

改后实测：快速 94/20、详细 94/20 —— **位移 0**。滑块宽度与位移在 setWorkspaceView() 里按当前选中项计算，并在 esize 时重算。

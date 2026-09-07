# Veyra｜UI Acceptance

> 只记录实际运行结果，不用“代码已写”替代“功能已验收”。

## 环境
- 本地 URL：`http://127.0.0.1:5173`
- 构建：Vite 6.0.7 production build
- 浏览器：Chromium（ego-browser）与 Google Chrome 152 headless 截图复核
- 验收日期：2026-09-07
- 证据：`docs/images/veyra-workbench.png`、`docs/images/veyra-mobile.png`

## 核心任务
| 任务 | 桌面 1440px | 390px | 键盘 | 结果/证据 |
|---|---|---|---|---|
| 输入简报并启动铸造 | 通过 | 通过 | 按钮及 ⌘/Ctrl + Enter | 加载时按钮禁用且出现 active 阶段；结束后六阶段均为 done，流水线显示 VERIFIED，门禁显示 PASS |
| 空输入错误恢复 | 通过 | 通过 | 自动聚焦错误字段 | 明确提示“请先写下游戏创意，再启动铸造流程。” |
| 保存/刷新 | 通过 | 通过 | 不适用 | 修改简报后刷新，localStorage 内容正确恢复 |
| 小鲨鱼试玩 | 通过 | 通过 | 方向键/WASD | 桌面键盘与移动触控均实际收集能源：能量 78%→83%，回收 0→25；暂停/恢复与重置通过 |
| 角色形象一致性 | 通过 | 通过 | 不适用 | 顶部品牌、任务卡、资产舱和 Canvas 试玩均使用用户提供的护目镜小鲨鱼；图片实测 694×900 正常加载 |
| 资产舱/证明链切换 | 通过 | 通过 | 可聚焦 | 两个视图均可打开，390px 无横向溢出 |
| 导出报告 | 通过 | 桌面功能 | 可聚焦 | 实测生成 `veyra-build-report.txt`，Blob 内容包含 VEYRA 标题与护目镜小鲨鱼来源 |
| 帮助弹窗 | 通过 | 通过 | Esc 可关闭 | 弹窗可通过关闭按钮、背景与 Esc 恢复 |

## 硬门禁
- [x] `scrollWidth === innerWidth`（390px 实测 390 === 390）
- [x] 正文与关键控件对比可读
- [x] 焦点可见、顺序合理
- [x] 表单 label、错误原因、恢复路径完整
- [x] 弹窗可关闭且不丢状态
- [x] 空、加载、成功、禁用状态已覆盖
- [x] 无虚构指标、用户评价或已验证结论
- [x] `prefers-reduced-motion: reduce` 实测命中，动效时长降为 `0.00001s`
- [x] 生产构建页面运行期间未捕获 JavaScript exception 或浏览器 error/warning
- [x] 线上 GitHub Pages 返回 HTTP 200，最近一次部署工作流成功

## 遗留问题
- 当前“生成”流程是用于面试演示的前端状态模拟，不连接真实模型；界面和 README 已按概念作品说明，不冒充线上 AI 生成服务。

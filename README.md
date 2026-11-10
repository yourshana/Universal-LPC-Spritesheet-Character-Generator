LPC 精灵表角色生成器
=============================================

> 本仓库是 [LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator](https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator) 的个人 fork，仅供自用修改。

## 本 Fork 的修改说明

在原仓库基础上做了以下改动（均未改动底层数据、URL hash 和文件路径）：

1. **界面全面汉化**：所有面板、按钮、提示、筛选器、加载文案、动画名、体型、许可证标签等界面文字均已翻译为中文。
2. **资产名称汉化（仅显示层）**：新增 `sources/i18n.ts`，通过显示层映射把分类名（108 个）、部件名（649 个）、变体名/颜色材质（187 个）在界面上显示为中文。底层 `sheet_definitions/`、URL hash、文件路径、元数据键**全部保持英文不变**，因此分享链接和内部查找逻辑不受影响。
3. **同步更新测试**：断言英文界面文案的单元测试与 Playwright 视觉辅助代码已同步改为中文。

如需恢复英文界面，删除 `sources/i18n.ts` 并还原 `sources/`、`index.html` 下相关文件即可。

---

#### 翻译

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/blob/master/README.md) [![zh](https://img.shields.io/badge/lang-zh-green.svg)](https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/blob/master/lang/zh/README_ZH.md)

#### 徽章

[![codecov](https://codecov.io/gh/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/graph/badge.svg?branch=master)](https://codecov.io/gh/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator)

本生成器尽可能收录了迄今所有 [LPC](https://lpc.opengameart.org) 风格的角色美术。

在线试用请点击[这里](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/)。

Liberated Pixel Effort 是由多位杰出的艺术家共同协作、为项目产出精灵图的成果。
**如果你希望在自己的项目中使用 LPC 精灵图，你需要为所使用到的 LPC 精灵图致谢所有贡献者。** 具体做法见[下方](#许可与署名-credits)。

虽然本仓库专注于角色精灵图，但 LPC 也包含许多瓦片集和其他美术作品。瓦片集可以在 [OpenGameArt.org](https://opengameart.org) 找到。

### 历史

Liberated Pixel Cup 的概念由 Bart Kelsey 和 Chris Webber 提出，最初是 [OpenGameArt.org](https://opengameart.org) 上由 Creative Commons、Mozilla 和自由软件基金会赞助的一场比赛（注意：这些组织不赞助、也不参与本生成器）。其理念是创作一套统一[风格](https://lpc.opengameart.org/static/LPC-Style-Guide/build/index.html)的美术作品。

本项目最初基于 https://github.com/makrohn/Universal-LPC-spritesheet，其中包含一个由各种 PNG 素材合成的 xcf 文件。该仓库最初作为本仓库的子模块引入，很可能代表了第一个（尽管是离线的）LPC 精灵表生成器。感谢 [@makrohn](https://github.com/makrohn) 的创作。

[@Gaurav0](https://github.com/Gaurav0) 是本仓库的原作者，但由于生活原因未能持续维护。感谢 [@sanderfrenken](https://github.com/sanderfrenken) 多年来维护主 fork。

[@jrconway3](https://github.com/jrconway3) 和 [@bluecarrot16](https://github.com/bluecarrot16) 一直是专注于美术方面的核心维护者。

[@ElizaWy](https://github.com/ElizaWy) 修订并扩展了 LPC 范式，参见 https://github.com/ElizaWy/LPC。

### 许可与署名 (Credits)

本项目分发的每一件美术作品（`spritesheets` 子目录中的所有图片）均受以下一种或多种受支持的开源许可证约束：

- [CC0](https://creativecommons.org/public-domain/cc0/)
  - 可在任何情况下使用，无需署名
- [CC-BY-SA](https://creativecommons.org/licenses/by-sa/4.0/deed.en)[^2]
  - 必须致谢作者，不得加密或 DRM 保护[^1]，且
  - 任何衍生作品或修改必须在 CC-BY-SA 4.0 或更高版本下分发
- [CC-BY](https://creativecommons.org/licenses/by/4.0/)
  - 必须致谢作者，不得加密或 DRM 保护[^1]
- [OGA-BY](https://static.opengameart.org/OGA-BY-3.0.txt)
  - 必须致谢作者，可在 DRM 保护的游戏中加密
- [GPL](https://www.gnu.org/licenses/gpl-3.0.en.html#license-text)
  - 任何衍生作品或修改必须在 GPL 3.0 或更高版本下分发

[^1]: 目前尚不清楚这是否意味着你不能在 Steam、iOS App Store 等使用加密 DRM 保护游戏的平台发布。单独将素材以可下载形式提供，或为购买者提供无 DRM 版本，可能足以满足要求，但 DRM 条款并未明确说明。为规避任何潜在法律风险，如果你打算在此类平台发布，建议只使用 CC0 和/或 OGA-BY 素材。OGA-BY 许可证正是为此原因去除了 DRM 条款。

[^2]: 这是本生成器所提供任何素材中最严格的许可证。只要遵守该许可证的所有条款，你就可以在本生成器中使用所有素材。是的，该许可证允许你在商业游戏中使用这些素材。

**如果你使用本工具生成精灵图，或直接使用本仓库 `spritesheets` 子目录中的单张图片，你必须至少致谢所有作者（CC0 许可的素材除外）。**

使用生成器时，你可以下载一个 CSV 或纯文本文件，其中包含所选素材的所有许可证信息：

![license-sheet](/readme-images/credits-sheet.png)

你也可以使用 [CREDITS.csv](/CREDITS.csv) 文件。

该文件列出了 `spritesheets` 内每张图片的作者、许可证以及原始 URL 链接。

总之，为符合所用素材的**署名**要求，你可以：

- 随项目分发完整的 [CREDITS.csv](/CREDITS.csv) 文件。
- 分发一份包含你所使用素材署名信息的汇总列表。

请确保该署名文件在你的游戏或应用中可被访问，并能被用户合理地找到（例如直接在"致谢"页面显示，或提供可见链接）。

**重要的是，各许可证可能附加额外限制。你有责任遵守所用素材的许可证。**

如果你不想直接展示完整的署名文件，可以在致谢页面包含如下声明：

> - 精灵图作者：Johannes Sjölund (wulax)、Michael Whitlock (bigbeargames)、Matthew Krohn (makrohn)、Nila122、David Conway Jr. (JaidynReiman)、Carlo Enrico Victoria (Nemisys)、Thane Brimhall (pennomi)、laetissima、bluecarrot16、Luke Mehl、Benjamin K. Smith (BenCreating)、MuffinElZangano、Durrani、kheftel、Stephen Challener (Redshrike)、William.Thompsonj、Marcel van de Steeg (MadMarcel)、TheraHedwig、Evert、Pierre Vigier (pvigier)、Eliza Wyatt (ElizaWy)、Sander Frenken (castelonia)、dalonedrau、Lanea Zimmerman (Sharm)、Manuel Riecke (MrBeast)、Barbara Riviera、Joe White、Mandi Paugh、Shaun Williams、Daniel Eddeland (daneeklu)、Emilio J. Sanchez-Sierra、drjamgo、gr3yh47、tskaufma、Fabzy、Yamilian、Skorpio、Tuomo Untinen (reemax)、Tracy、thecilekli、LordNeo、Stafford McIntyre、PlatForge project、DCSS authors、DarkwallLKE、Charles Sanchez (CharlesGabriel)、Radomir Dopieralski、macmanmatty、Cobra Hubbard (BlueVortexGames)、Inboxninja、kcilds/Rocetti/Eredah、Napsio (Vitruvian Studio)、The Foreman、AntumDeluge
> - 精灵图作为 Liberated Pixel Cup 项目的一部分贡献，来自 OpenGameArt.org：http://opengameart.org/content/lpc-collection
> - 许可证：Creative Commons Attribution-ShareAlike 3.0 (CC-BY-SA 3.0) <http://creativecommons.org/licenses/by-sa/3.0/>
> - 详细署名：[CREDITS.CSV 文件链接]

**关于许可与署名的更多信息，请参考 [OpenGameArt.org](https://opengameart.org/content/faq#q-proprietary)。**

### [贡献指南](CONTRIBUTING.md) ⤴

### 测试覆盖率

单元测试行覆盖率报告在 [Codecov](https://codecov.io/gh/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator)（此公开仓库免费）。上方[徽章](https://codecov.io/gh/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator)跟踪默认分支。

覆盖率来自 Node（`node:test`）以及仅在 Chrome 和 Firefox 中运行的 Testem/Mocha。Playwright 视觉测试**不**计入；它们留在 Argos 上。

如果**新增或修改的生产代码行**没有被单元测试执行，或者**既有生产代码失去覆盖**（删除了测试或削弱了测试），Pull Request 会失败。它们**不会**因为整体覆盖率百分比变化而失败。本地报告运行方式及各检查含义见 [CONTRIBUTING.md](CONTRIBUTING.md#unit-test-coverage)。

### 动画帧指南

你可以在 [Eliza 仓库中的动画指南](https://github.com/ElizaWy/LPC/blob/f07f7f5892e67c932c68f70bb04472f2c64e46bc/Characters/_%20Guides%20%26%20Palettes/Animation%20Guides) 查看她推荐的动画展示方式。

此外，每个动画都记录了帧循环，可以在动画预览旁查看。

### 本地开发运行

UI 使用 [Vite](https://vitejs.dev/) 构建。请使用开发服务器而不是以 `file://` URL 直接打开 `index.html`，因为 ES 模块和资源路径需要 HTTP，现代浏览器会限制 file URL。

**推荐工作流**

1. 首次运行 **`npm ci`**。锁文件合并或 rebase 后，使用 **`npm run lockfile:fix`**，而不是 **`npm install`**。
2. 使用 **`npm run dev`**（默认 **http://localhost:5173**）启动应用，或用 **`npm run serve:open`** 在默认浏览器中打开。

本地运行**类生产**构建，先 **`npm run build`** 再 **`npm run preview`**（Vite 默认预览端口 **4173**；开发服务器默认 **5173**）。使用其他端口可传 Vite 的 **`--port`** 参数（例如 `npm run dev -- --port 3000`）。

其他本地服务器（Python `http.server`、`npx serve`、nginx 等）可以用于实验构建产物，但 **`npm run dev`** 是本仓库日常使用的开发方式。

### 游戏引擎插件与开发工具

#### Godot

有一个 [Godot 3.5 插件](https://godotengine.org/asset-library/asset/1673)。

还有另一个 [Godot 4.2 插件](https://godotengine.org/asset-library/asset/2212)。

#### RPG Maker MZ

该组织下有一个正在开发中的[插件与示例游戏项目](https://github.com/LiberatedPixelCup/RPG_Maker_MZ_LPC_Starter_Kit)。

#### 其他游戏引擎

我们非常希望看到其他流行游戏引擎开发类似的工具。如果你知道有已开发的工具，请向本仓库提交 pull request 并添加到本 README。

如果某个引擎未在上面列出，可以尝试 Google。不过很可能你还是需要自己写一些代码。

### FAQ

<dl>
  <dt>我可以在商业游戏中使用这些美术吗？</dt>
  <dd>可以，但你必须遵守所用素材许可证的所有条款。参见 <a href="#许可与署名-credits">许可与署名 (Credits)</a></dd>
  <dt>如何在本游戏引擎中使用这个生成器的输出？</dt>
  <dd>可能已经有现成的资源可用。我们为一些常见游戏引擎添加了<a href="#游戏引擎插件与开发工具">列表</a>。如果找不到你的引擎，试试 Google。大多数情况下你仍需要自己写代码。</dd>
  <dt>我下载了图片，但忘了保存 &lt;url、署名等&gt;，如何找回之前的配置？</dt>
  <dd>建议今后使用"导出 JSON"来避免此问题，并将 JSON 文件与 PNG 一起保存。参见 <a href="https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/issues/143">Issue #143</a></dd>
</dl>

### 术语

<dl>
  <dt>Liberated Pixel Cup (LPC)</dt>
  <dd>最初是一场比赛，旨在创作大量兼容的美术素材。现在也指代这批作品，以及标记为 LPC 所遵循的风格。</dd>
  <dt>Universal LPC (ULPC)</dt>
  <dd>LPC 最初扩展加入了一些新的动画尺寸和基础体型。本生成器帮助确保许多素材覆盖了所有这些体型和动画。LPC 最初只包含成年男性和女性基础的施法、突刺、行走、斩击、射击、受伤动画，并采用标准 64x64 格式。ULPC 最显著的变化是加入了超大动画帧的武器。</dd>
  <dt>LPC Revised (LPCR)</dt>
  <dd>由 <a href="https://github.com/ElizaWy">@ElizaWy</a> 提出的 LPC 变更，在某些情况下改变了动画帧的数量和顺序，采用了新的调色板，以及更小的头部。</dd>
  <dt>LPC Expanded (LPCE)</dt>
  <dd>由 <a href="https://github.com/ElizaWy">@ElizaWy</a> 等人提出的动画与基础体型的进一步扩展。新增动画包括弓、攀爬、奔跑、跳跃。新增基础体型包括儿童和老人。本仓库中的许多素材尚未为这些新动画和体型绘制。欢迎贡献。</dd>
</dl>

### 其他 LPC 角色生成器

- https://pflat.itch.io/lpc-character-generator
- https://vitruvianstudio.github.io/

### 工具

- [lpctools](https://github.com/bluecarrot16/lpctools)
- [如何安装 lpctools](tools/LPCTOOLS.md)
- [使用 lpctools 重新合成完整精灵表](tools/REBUILD.md)
- [将素材转换为 Vitruvian Studios 格式](tools/VITRUVIAN.md)
- [计算超大动画的最小包围盒偏移](https://github.com/matheoheo/LPCFramesAnalyzer)

### 开发

#### 工具链

需要 **Node.js 22.19+**（`package.json` 的 `engines`；CI 使用 Node 24），这样 `node` 可以直接运行第一方 `.ts` 文件。环境搭建见 [CONTRIBUTING.md](CONTRIBUTING.md)，每个 npm 脚本见 [Commands](CONTRIBUTING.md#commands)，应用运行时结构见 [ARCHITECTURE.md](ARCHITECTURE.md)。

- **Lint：** `npm run lint`
- **类型检查：** `npm run type-check`
- **格式化：** `npm run format:check`（校验）或 `npm run format`（应用）
- **测试：** `npm test`（Node 检查 + 浏览器测试）。视觉回归：`npm run test:visual`。详情见 [CONTRIBUTING.md](CONTRIBUTING.md)。

**生成的文件：** [CREDITS.csv](CREDITS.csv) 以及 **`scripts/zPositioning/`** 下的 z 坐标 CSV 由 **`npm run validate-site-sources`** 更新。**Vite** 运行元数据插件；当输入或 **`dist/`** 输出需要时，它会刷新这些 CSV，并且始终写入 **`dist/`** 下的 **五个** 模块（`index-`、`palette-`、`item-`、`credits-`、`layers-metadata.js`）。应用在 **[`sources/install-item-metadata.ts`](sources/install-item-metadata.ts)** 中把它们注册进 **`CatalogReader`**。**`dist/`** 目录被 gitignore——不要手动编辑生成文件。**`npm run dev`** 会美化内嵌 JSON；**`npm run build`** 写入紧凑格式（见 [PR #432](https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/pull/432)）。catalog API 与分阶段加载见 [CONTRIBUTING.md](CONTRIBUTING.md#catalog-and-state)，完整工作流见 [File Generation](CONTRIBUTING.md#file-generation)。

#### 性能分析

生成器内置性能分析工具，用于定位渲染瓶颈并优化性能。详细文档见 [PERFORMANCE_PROFILING.md](PERFORMANCE_PROFILING.md)。

**快速上手：**

- 在 `localhost` 运行时自动启用 profiler
- 可通过 URL 中 `?debug=true` 或 `?debug=false` 覆盖
- 在 Chrome DevTools → Performance 面板查看指标
- 在控制台运行 `profiler.report()` 查看汇总
- 目录加载（生产预览）：`npm run profile:load`
- Lab CLS（Lighthouse，生产预览）：`npm run profile:cls` — 见 [CLS.md](CLS.md)
- 元数据字节数（CI 预算）：`npm run metadata:size` / `npm run metadata:size:check`

**跟踪内容：**

- Canvas 渲染耗时（绘制、合成）
- 图片加载性能
- UI 更新操作
- 帧率（FPS）
- 内存占用

#### 调色板重着色系统

生成器使用 GPU 加速的 WebGL 着色器，对体型颜色进行实时的基于调色板的重着色。相比传统的 CPU 逐像素处理，性能提升显著。

**贡献者：** 关于如何让条目接入调色板系统的完整指南，见 [PALETTE_RECOLOR_GUIDE.md](PALETTE_RECOLOR_GUIDE.md)。

**控制台命令：**

查看当前渲染模式：

```javascript
getPaletteRecolorConfig();
// 返回：{ forceCPU: false, useWebGL: true, activeMode: "webgl" }
```

查看重着色统计：

```javascript
getPaletteRecolorStats();
// 显示 WebGL 与 CPU 操作的分解统计
```

强制 CPU 模式（用于测试/调试）：

```javascript
setPaletteRecolorMode("cpu");
```

切回 WebGL 模式：

```javascript
setPaletteRecolorMode("webgl");
```

**技术细节：**

- **WebGL 模式**（默认）：使用片段着色器进行 GPU 加速的调色板替换
  - 使用单个共享 WebGL 上下文以避免浏览器上下文数量限制
  - 调色板编码为纹理，实现快速 GPU 查找
  - 多颜色变体下比 CPU 模式快得多（每个预览精灵表约 90ms-120ms vs 190ms-230ms）
- **CPU 模式**（回退）：传统的逐像素颜色替换
  - WebGL 不可用时自动使用
  - 可手动强制用于兼容性测试
- **调色板灵活性**：调色板支持每个变体 1-32 种颜色（不限于 8 种）

系统会自动检测 WebGL 可用性，必要时回退到 CPU 模式。

### 示例

![example](/readme-images/example.png)

### 赞助

[![Deploys by Netlify](sources/netlify-badge-dark.svg)](https://www.netlify.com)

[![Covered by Argos](sources/badge-large.svg)](https://argos-ci.com?utm_source=LiberatedPixelCup&utm_campaign=oss)

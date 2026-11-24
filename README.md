# 手写对齐的带词图 CTC 算子与双向审阅

这里的笔迹页与词图修订是用于设备联调的合成资料。使用 Node.js 22。运行 `npm ci --offline` 核对依赖锁，`npm run inspect` 查看资料字段，`npm test` 检查资料格式及相互引用。检视脚本只读取元数据。

## 数据格式

笔迹页每行按 alphabet 给自然对数概率，null 表示不可能。blank 为 0。折叠规则先合并相邻同标记再去 blank。图起点 0，终点为 layers，长样本的结点身份为 (layer, branch)，可读弧由 ctc-pages.mjs 随草稿与小样本的取数契约提供。弧字段 [id,from,to,label,span,logWeight]，其中 span 对应原稿笔划序号区间。给定物理帧标记序列及实际选择的弧序列是一条路径。最高分平局按逐帧的 (label, arcId) 字典序，blank 用 arcId=−1，延续发音沿用首次进入的弧身份。同一标题的图修订仍用不同 graphRevision。确认在指定截止帧且含该帧所提交的完整弧身份等于所给前缀，后续重复帧不重复消费已进入的弧。窗后验逐帧对 arcId 聚合，blank 独立，无有效路径时不返回概率。分支在 open 后共享驻留预算。改页到下一轮局部查询允许 maxChangedPageReads 次物理页交付，无论哪条分支重复取页均计数。可由调用者重新提供的图、未经接收的保留派生数据按驻留记录区分。maxResidentBytes 包括全部对齐工作区和辅助数据，源页和调用端已领结果不计。 每一页的合法层带由 legalLayers 提供，含首尾层。路径在任一页必须遵守该带，跨页的重复发音保持原弧，不重新消耗标签。除了预算内内存，可在设备目录保存最多 archiveBytes 派生快照；读写这些快照不消耗纸带原页交付额度。首次原页数不超过 maxInitialPageReads。长稿中的 60 是引用 confirmation 中前 60 个弧的事件简写。

## 取数

`inputs/ctc-pages.json` 保存标定、规格和调用记录。记录中的范围除明确说明外从零开始，使用半开区间。批量数组按调用记录列出的顺序交付。ctcPage(page,physicalCopy) 提供指定物理页，graphArcs(revision,layer) 提供从某层出发的边。

# 木酢寵物達人三角色平台運作模擬報告

模擬日期：2026-05-02

模擬目標：模擬新人、木酢寵物達人操作者藝嘉、Jacky 三個角色進入平台後的動作、行為與產出，檢查是否符合真實双云 AI 行銷部的運作邏輯。

模擬品牌：木酢寵物達人 `brand-muzopet`

模擬角色：

- 新人：`user-newcomer-01`
- 藝嘉：木酢寵物達人操作者 / reviewer
- Jacky：老闆 / 決策者 / 高風險確認者

---

## 1. 新人進入平台後

新人登入後先看到 newcomer cockpit。

目前狀態：

- 已完成部分訓練任務，已有 reviewed 任務
- 目前有一個 `needs_revision` 任務：內容工廠最小交付
- 已被分派到木酢品牌低風險任務：
  - `整理 20 萬家庭會員的回購喚醒分群`
  - `建立官網類別到商品的主推對照表`
  - `整理客服轉單與健康紅線`

新人第一步不是直接寫文案，而是先進入木酢 Brand App 閱讀：

1. BrandBrain
2. SeniorMemberActivity handoff
3. RevenueSignal
4. BrandTask expectedOutcome
5. 木酢紅線與通路規則

### 新人產出：品牌速查卡摘要

```text
品牌核心印象：
木酢寵物達人是以木酢液為核心，服務養狗養貓家庭的天然低敏清潔品牌，同時保留森林循環與不砍樹的永續故事。

語氣禁忌：
1. 不可使用治療、預防疾病、消滅跳蚤、100% 有效等醫療或絕對功效字眼。
2. 不可寫成硬銷、限時搶購式促銷，也不可過度煽情。
3. 不可以陳偉誠第一人稱代發品牌訊息。

頻道規則：
LINE 可直接親切但每月不超過 2 次；FB 偏知識與生活感；IG 偏真實寵物生活情境；蝦皮私訊需正式、短、含 1 個 CTA。

升級標準：
毛孩健康、過敏、退貨退款、法律威脅、療效宣稱、價格策略與品牌定位變更都不能自行處理，需升級藝嘉 / Sophia / Jacky。
```

### 新人承接任務

任務：`整理 20 萬家庭會員的回購喚醒分群`

新人產出初稿：

```text
分群方向：
1. 沉睡會員：曾購買寵物清潔或除臭商品，90 天以上未回購。
2. 高頻會員：近 90 天購買 2 次以上，可推環境清潔 + 防蚊加購。
3. 流失會員：180 天以上未購買，先用品牌故事與家庭情境喚醒，不直接硬促銷。

第一波 LINE 草稿：
家裡最近也開始有悶味了嗎？
木酢大家庭幫你一起把毛孩生活空間整理得更舒服。
這週整理了除臭、布料清潔與外出防蚊組合，適合春夏換季一起補齊。
點這裡看看適合你家的組合。
```

新人自我檢查：

- Structure：有分群、有通路、有 CTA
- Brand：有用「木酢大家庭」「一起」，語氣不算硬銷
- Compliance：未出現治療、預防疾病、保證有效
- 不確定點：是否可把「防蚊」與「毛孩外出」放同一波訊息，需要藝嘉確認狗用、人用防蚊不可混用

新人平台動作：

```text
task_started
decision_panel_opened
brand_brain_read
handoff_read
task_submitted
```

---

## 2. 藝嘉進入平台後

藝嘉進入 `/brands/brand-muzopet`，先看三個區塊：

1. BrandTask 狀態
2. RevenueSignal
3. 待 review 任務

藝嘉看到新人送出的任務連到兩個高價值訊號：

- `20 萬家庭資料庫回購入口`，confidence high
- `狗貓＋環境清潔＋肌膚養護多線並進`，confidence high

藝嘉判斷：這雖然是新人低風險任務，但因為連到 high-confidence retention / lead signal，實際處理要升一級，不能只當普通練習文案。

### 藝嘉 review 結果

Review decision：`needs_revision`

Reviewer note：

```text
[Brand] 分群方向正確，但 LINE 草稿把「除臭、布料清潔、防蚊」放在同一個 CTA，容易讓狗用、貓用、人用防蚊情境混在一起。建議拆成「毛孩生活空間除臭」與「外出防蚊加購」兩個版本，並在文案中避免暗示所有產品都可混用。

[Compliance] 防蚊相關文案不可出現「預防」「完全有效」等字眼。請補上一句「依商品適用對象選擇」的安全提醒，並標註需要藝嘉上線前覆審。
```

藝嘉平台動作：

```text
review_started
revision_requested
reviewer_note_created
trace_log_created
```

藝嘉同時建立內部操作提醒：

```text
SeniorMemberActivity:
木酢會員喚醒任務需要拆成兩條訊息線：
1. 毛孩生活空間除臭 / 清潔
2. 外出防蚊加購
新人可繼續整理初稿，但發布前需藝嘉全審；若涉及商品適用對象或功效邊界，升級 Jacky。
```

---

## 3. Jacky 進入平台後

Jacky 不逐字改新人文案，而是看：

1. RevenueSignal 是否合理
2. BrandTask 是否真的對營收有幫助
3. 新人是否在對的地方升級
4. 藝嘉的 reviewer note 是否能訓練新人
5. 是否有高風險策略問題需要老闆決策

Jacky 看到目前木酢的核心營運邏輯：

```text
20 萬家庭資料庫
→ 會員喚醒分群
→ LINE / EDM / 蝦皮三通路
→ 回購與加購
→ 週報歸因
→ 下一波任務調整
```

### Jacky 判斷

- 新人做對的地方：沒有直接承諾療效，知道防蚊適用對象要升級
- 新人不足：把不同商品線放進同一個 CTA，品牌與合規風險混在一起
- 藝嘉做對的地方：退修 note 有面向、有具體問題、有修改方向
- 平台目前能支援：訓練任務、品牌腦、任務、review、trace、RevenueSignal 基本串起來
- 平台目前不足：還沒有真正的 Jacky 決策確認工作流，也沒有把高風險任務鎖住不讓新人送出

### Jacky 決策

```text
決策 1：
木酢會員喚醒第一波不做大促銷，先做「家庭場景回購」。
原因：陳總不喜歡促銷感太重，木酢要保留故事與信任。

決策 2：
新人可以負責初稿與分群整理，但不能決定最終發送名單。
原因：退訂戶、毛孩過世戶是客訴紅線，必須由藝嘉或資深成員確認。

決策 3：
防蚊相關訊息一律拆開，不和除臭 / 清潔主訊息混用。
原因：商品適用對象不同，混寫會增加誤用與合規風險。

決策 4：
下一個平台切片要補 reviewer dashboard + Jacky approval gate。
原因：目前規則存在，但 UI 還沒有把「高風險需 Jacky 確認」變成硬流程。
```

Jacky 平台動作：

```text
decision_reviewed
high_risk_gate_flagged
brand_task_priority_confirmed
follow_up_slice_created
```

---

## 4. 最終模擬結果

任務狀態：

```text
新人任務：整理 20 萬家庭會員的回購喚醒分群
原狀態：in_progress
新人送出後：submitted
藝嘉審核後：needs_revision
Jacky 判斷後：維持 needs_revision，補高風險決策規則
```

產出物：

1. 新人品牌速查卡
2. 會員喚醒分群初稿
3. LINE 第一波草稿
4. 新人自我品管 checklist
5. 藝嘉 reviewer note
6. SeniorMemberActivity 操作提醒
7. Jacky 決策紀錄
8. Trace log

### 真實双云運作邏輯檢查

結論：成立。

成立原因：

- 新人不是直接交付客戶，而是在品牌腦與任務框架下做低風險初稿
- 藝嘉不是只改字，而是用 structure / brand / compliance 做品管與訓練
- Jacky 不介入所有小事，只處理策略、紅線、權限與系統規則
- RevenueSignal 讓任務不是「寫文案」，而是連到 20 萬會員喚醒與回購現金流
- Trace log 讓每一步可回放、可訓練、可追責

---

## 5. 平台下一步建議

優先補三個功能：

1. `/reviews` reviewer dashboard：讓藝嘉集中處理 submitted / reviewing 任務
2. Jacky approval gate：涉及醫療、價格、策略、發送名單紅線時強制升級
3. BrandTask trace timeline：把新人、藝嘉、Jacky 的操作串成一條品牌任務紀錄，而不是散在不同頁面


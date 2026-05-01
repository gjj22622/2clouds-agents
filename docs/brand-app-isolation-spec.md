# Brand App Isolation Specification

本文件定義 2clouds 多品牌架構中，每個 Brand App 的資料邊界、權限邊界、最小可用資料包，以及 Command Center 與 Brand App 的可見性分界。

---

## 1. 隔離原則

**原則一：每個品牌是獨立的操作單元**

一個品牌的內容策略、客群數據、廣告成效、視覺規格、客戶溝通脈絡，不得因為平台成員有權限存取另一個品牌而外洩。

**原則二：Command Center 看摘要，Brand App 看細節**

Command Center 可以看到跨品牌的營運狀態摘要（有幾個品牌在進行、有幾個待審內容、哪些品牌有風險訊號），但不得在摘要中暴露任何品牌私有內容的明細。

**原則三：成員只看自己被指派的品牌**

沒有被指派到某個品牌的成員，不應能存取該品牌的 brain、任務、審查記錄或客戶訊號。唯一例外是 admin 角色（Jacky）。

---

## 2. 資料邊界規則

### 2.1 brandId 強制規則

所有品牌層級的實體（entity）**必須**攜帶 `brandId`。這是隔離的技術基礎。

```typescript
// 每個品牌實體都必須有 brandId
ClientBrand.id          // 是 brandId 本身
BrandBrain.brandId      // 必填
BrandTask.brandId       // 必填
RevenueSignal.brandId   // 必填
SeniorMemberActivity.brandId // 必填
// Phase 2 新增時同樣必填：
// ProductBrain.brandId
// CustomerBrain.brandId
// VisualBrain.brandId
```

**不應帶 brandId 的實體：**
- 訓練任務（TrainingTask、TrainingTaskAssignment）— 屬於平台通用訓練
- 知識節點（KnowledgeNode）— 屬於 Jacky 全域知識圖譜
- 通用腦袋（Brain）— 屬於双云全域方法論

### 2.2 跨品牌可見 vs. 不可見

| 資料類型 | Command Center | 品牌成員 | 其他品牌成員 |
|---|---|---|---|
| 品牌名稱與服務狀態 | ✓（摘要） | ✓ | ✗ |
| 品牌腦（BrandBrain） | ✗ | ✓ | ✗ |
| 商品腦 / 客群腦 | ✗ | ✓ | ✗ |
| 品牌任務清單 | 數量（不含細節） | ✓ | ✗ |
| 審查記錄 | 待審數量 | ✓ | ✗ |
| 營收訊號 | 風險等級 | ✓ | ✗ |
| 資深成員活動 | ✗ | ✓（同品牌） | ✗ |
| 新人訓練進度 | ✓（跨品牌彙總） | ✓（自己） | ✗ |

### 2.3 API 端點的 brandId 驗證要求

所有返回品牌資料的 API 端點**必須**驗證：
1. 請求者的 userId 在 `brand_member_assignments` 表中有該 `brandId` 的存取權
2. 或請求者為 admin 角色

違反此規則的 API 行為應回傳 403，而不是靜默回傳空資料。

---

## 3. 權限邊界

### 3.1 成員 × 品牌資料的存取矩陣

| 操作 | newcomer | reviewer | admin（Jacky） |
|---|---|---|---|
| 查看品牌腦（BrandBrain） | ✓（僅指派品牌） | ✓（僅指派品牌） | ✓（全部） |
| 查看商品腦 / 客群腦 | ✓（僅指派品牌） | ✓（僅指派品牌） | ✓（全部） |
| 建立 / 修改品牌腦 | ✗ | ✗ | ✓ |
| 查看品牌任務 | ✓（僅己任務） | ✓（全品牌） | ✓（全部） |
| 建立品牌任務 | ✗ | ✗（建議由 Sophia / Jacky 建立） | ✓ |
| 查看營收訊號 | ✗（Phase 2 開放） | ✓ | ✓ |
| 查看資深成員活動 | ✓（已指派品牌） | ✓（已指派品牌） | ✓ |
| 建立審查記錄 | ✗ | ✓（已指派品牌） | ✓ |
| 查看跨品牌彙總 | ✗ | ✗ | ✓ |

### 3.2 指派品牌（Assigned Brand）概念

成員必須被明確指派到一個品牌，才能存取該品牌的任何資料。

指派關係包含：
- `brandId`：被指派的品牌
- `memberId`：成員 userId
- `role`：在該品牌的角色（newcomer_trainee / reviewer / lead）
- `assignedAt`：指派時間
- `assignedBy`：由誰指派（通常是 Sophia 或 Jacky）
- `validUntil`：可選，有效期限

新人被指派到品牌 ≠ 可以直接執行任務。仍需完成品牌速查卡並獲得 reviewer 確認（見 brand-onboarding-workflow.md）。

### 3.3 成員工作台邊界（Member Workspace Boundary）

每位成員的工作台是個人獨立的操作環境，邊界規則如下：

**成員工作台包含（只看自己的部分）：**

| 資料項目 | newcomer 可見範圍 | reviewer 可見範圍 |
|---|---|---|
| 品牌任務 | 僅自己被指派的任務 | 該品牌全部任務 |
| 審查記錄 | 僅與自己任務相關的 | 該品牌全部審查記錄 |
| Trace log | 僅自己的操作記錄 | 全品牌操作記錄 |
| 訓練進度 | 僅自己的訓練進度 | — |
| 資深成員活動 | 僅被指派品牌的 handoff/strategy | 同左 |
| 營收訊號 | Phase 2 開放 | 該品牌全部 |

**跨品牌成員隔離規則：**

1. 成員在品牌 A 看到的所有任務、審查記錄、資深成員活動，在品牌 B 的工作台中完全不可見。
2. 兩個品牌共用同一位 reviewer，該 reviewer 在各品牌的 reviewer queue 是獨立清單，互不干擾。
3. 成員可以同時被指派多個品牌，但每次進入 Brand App 時，工作台只顯示**當前品牌**的資料。
4. 成員間的協作只能透過：明確共享的品牌任務、審查記錄、留言、或資深成員活動記錄。不能因為「同一個人負責兩個品牌」就看到跨品牌的任何內容。

**Reviewer Queue 邊界：**

- Reviewer 的待審清單按品牌分組，預設顯示當前品牌的待審項目。
- 跨品牌 reviewer 切換品牌 App 時，待審清單重置為新品牌。
- 不得在同一個 reviewer queue 視圖中混合顯示不同品牌的待審項目。

**個人 Trace Log 邊界：**

- 每筆 trace log 必須攜帶 `brandId`（訓練任務的 trace log 除外，訓練 trace 不帶 brandId）。
- 成員只能查詢自己指派品牌內的 trace log。
- Admin 可查詢所有品牌的 trace log。

---

## 4. Brand App 最小可用資料包

一個品牌 App 在允許新人進場操作前，必須完成以下 7 個資料包的基礎填寫。

### Component 1：品牌腦（BrandBrain）— Phase 1 必要

| 欄位 | 說明 | Phase |
|---|---|---|
| `voice` | 品牌語氣定義 | 1 |
| `audience` | 目標受眾描述 | 1 |
| `offer` | 品牌提供的核心價值 | 1 |
| `taboos` | 禁用語、禁忌話題、不當承諾清單 | 1 |
| `channelRules` | 各頻道的發文規格與 CTA 規範 | 1 |
| `escalationRules` | 什麼情況需升級 reviewer 或 Jacky | 1 |

完整度門檻：全部欄位填寫，`taboos` 至少 3 條。

### Component 2：商品腦（ProductBrain）— Phase 2

| 欄位 | 說明 | Phase |
|---|---|---|
| `productLines` | 主要產品線名稱與定位 | 2 |
| `keyDifferentiators` | 與競品的差異點 | 2 |
| `sellingPoints` | 前三大銷售主張 | 2 |
| `prohibitedClaims` | 禁止的產品聲稱（含法規考量） | 2 |
| `pricingContext` | 定價區間（高 / 中 / 低），勿填具體數字 | 2 |

完整度門檻：`productLines` 與 `prohibitedClaims` 為 Phase 2 必填。

### Component 3：客群腦（CustomerBrain）— Phase 2

| 欄位 | 說明 | Phase |
|---|---|---|
| `primarySegments` | 主要客群分類（2-3 個） | 2 |
| `painPoints` | 每個客群的核心痛點 | 2 |
| `buyingTriggers` | 驅動購買決策的情境 | 2 |
| `commonObjections` | 常見購買疑慮與回應方向 | 2 |
| `toneSensitivities` | 對哪些語氣或主題特別敏感 | 2 |

完整度門檻：`primarySegments` + `painPoints` 為 Phase 2 必填。

### Component 4：視覺腦（VisualBrain）— Phase 2

| 欄位 | 說明 | Phase |
|---|---|---|
| `colorTokens` | 主要色碼（品牌色 / 輔助色） | 2 |
| `typographyRules` | 字體規格與使用規範 | 2 |
| `imageStyle` | 圖片風格（真實攝影 / 插畫 / 純文字） | 2 |
| `visualTaboos` | 禁用視覺元素（顏色、字體、構圖） | 2 |
| `platformVariants` | 各平台的視覺規格差異 | 2 |

完整度門檻：`imageStyle` + `visualTaboos` 為 Phase 2 必填。

### Component 5：通路資料（ChannelData）— Phase 1 部分，Phase 2 完整

Phase 1 中通路規則存在 `BrandBrain.channelRules`（純文字）。Phase 2 應結構化為獨立 entity。

| 欄位 | 說明 | Phase |
|---|---|---|
| `channel` | FB / IG / LINE / YouTube / EDM | 1（文字） / 2（結構化） |
| `postingFrequency` | 每週發文數 | 2 |
| `contentFormats` | 適合的格式（圖文 / Reels / 限動） | 2 |
| `ctaStyle` | 該頻道的 CTA 風格 | 2 |
| `algorithmNotes` | 最佳發文時段、Hashtag 策略 | 2 |
| `prohibitedFormats` | 不適合此頻道的格式 | 2 |

### Component 6：營收訊號（RevenueSignal）— Phase 1 必要

| 欄位 | 說明 | Phase |
|---|---|---|
| `type` | lead / conversion / retention / upsell | 1 |
| `label` | 訊號說明 | 1 |
| `value` | 觀察到的數值或情況描述 | 1 |
| `confidence` | low / medium / high | 1 |
| `observedAt` | 觀察時間 | 1 |

完整度門檻：品牌活躍期（active）至少有 1 筆近期訊號。

### Component 7：資深成員活動（SeniorMemberActivity）— Phase 1 必要

| 欄位 | 說明 | Phase |
|---|---|---|
| `activityType` | strategy / review / client_contact / handoff | 1 |
| `summary` | 活動摘要（新人可讀的版本） | 1 |
| `relatedBrandTaskIds` | 連結到的品牌任務 | 1 |
| `createdAt` | 活動時間 | 1 |

完整度門檻：每次 Sophia 與客戶接觸後需有記錄；新人進場前至少 1 筆 handoff 記錄。

---

## 5. 品牌資料包完整度評分

品牌 App 在允許新人進場前，必須通過以下完整度閘門：

### Phase 1 入場資格（必須全部 ✓）

- [ ] `BrandBrain` 全部欄位已填（taboos ≥ 3 條）
- [ ] `channelRules` 包含至少 1 個主力頻道規格
- [ ] `escalationRules` 包含至少 2 條升級條件
- [ ] 至少 1 筆 `RevenueSignal`（近 30 天內）
- [ ] 至少 1 筆 `SeniorMemberActivity`（type: handoff）
- [ ] 品牌狀態（`operatingStage`）為 `active`

### Phase 1 入場建議（缺少不擋入場，但需說明）

- [ ] 每個主力頻道都有獨立的 `channelRules` 描述
- [ ] 至少有 1 則 `BrandTask` 為 `queued` 或 `in_progress`
- [ ] `positioning` 與 `primaryGoal` 已填

### Phase 2 入場條件（待 Phase 2 實作）

- [ ] `ProductBrain` 完整
- [ ] `CustomerBrain` 完整
- [ ] `VisualBrain` 完整

---

## 6. Command Center vs. Brand App 可見性

### Command Center 可看到（不包含私有細節）

```text
品牌列表（名稱、服務狀態、產業）
→ 每個品牌：
   - 任務完成率（N/M 完成）
   - 待審項目數量
   - 最近一筆 revenue signal 的 confidence 等級
   - 是否有 7 天內未處理的 high-confidence 風險訊號
   - 目前指派成員數
```

### Brand App 可看到（僅限已指派成員）

```text
品牌腦全文（BrandBrain）
所有品牌任務（含 expectedOutcome）
所有審查記錄（含 reviewerNote）
所有 RevenueSignal 明細
所有 SeniorMemberActivity 明細
品牌專屬知識節點（Phase 2）
```

### 絕對隔離項目

以下資料**永遠不得**出現在 Command Center 的跨品牌彙總或任何其他品牌的 Brand App 中：
- 任何品牌的 BrandBrain 內容（voice、taboos、escalationRules）
- 任何品牌的 RevenueSignal 明細（客戶商業數據）
- 任何品牌的 SeniorMemberActivity 文字（含客戶溝通脈絡）
- 品牌任務的 expectedOutcome 明細

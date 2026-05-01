# Brand / Member Lifecycle Control 規格

本文件定義 2clouds 平台中品牌（ClientBrand）與成員（BrandMemberAssignment）的生命週期狀態、狀態轉換規則、以及每個狀態對系統各層（Command Center、Brand App、Sheet Connector、任務生成、review、trace）的具體影響。

---

## 1. 品牌生命週期

### 1.1 五個狀態定義

| 狀態 | 說明 | 新人可進場 | 任務生成 | Connector |
|---|---|---|---|---|
| `onboarding` | 品牌資料包正在填寫，尚未通過 Phase 1 入場閘門 | ✗ | ✗ | `needs_setup` |
| `active` | 正常營運，全功能可用 | ✓（通過三關驗證後） | ✓ | `active` |
| `paused` | 暫停：任務凍結，Connector 停用 | ✗ | ✗ | `paused` |
| `archived` | 封存：合約結束，資料唯讀，不可回復 | ✗ | ✗ | 停用（永久） |
| `resumed` | 恢復中：從 `paused` 回到 `active` 的過渡驗證期 | ✗ | ✗ | `needs_setup`（待重連） |

`archived` 是終止狀態。若客戶日後重新合作，建立新的品牌 entity（新的 `brandId`），舊封存記錄不可逆轉。

### 1.2 合法轉換路徑

```text
                        ┌──────────┐
                        │ (建立新品牌) │
                        └────┬─────┘
                             ▼
                        onboarding
                             │
            資料包通過 Phase 1 閘門（Sophia + Jacky 確認）
                             │
                             ▼
                ┌──────── active ──────────┐
                │            ▲             │
     客戶暫停 / 容量調整       │ 恢復確認通過   合約結束
                │            │             │
                ▼            │             ▼
              paused ──► resumed ──►   archived
                 │
          客戶流失 / 無意回來
                 │
                 ▼
             archived
```

**非法轉換（平台應拒絕）：**
- `archived → 任何狀態`（終止不可逆）
- `onboarding → paused`（尚未 active 不能暫停）
- `onboarding → archived`（應先 active 再 archived，除非 Jacky 手動強制）
- `active → resumed`（resumed 只從 paused 進入）

### 1.3 轉換觸發者與條件

| 轉換 | 可觸發者 | 條件 |
|---|---|---|
| `→ onboarding` | Admin（Jacky） | 建立新 ClientBrand |
| `onboarding → active` | Admin / Sophia | Phase 1 六項入場資格全部通過 |
| `active → paused` | Admin / Sophia | 填入暫停原因（reason 必填） |
| `paused → resumed` | Admin / Sophia | 填入恢復說明；觸發 Connector 重連流程 |
| `resumed → active` | Admin（Jacky）| 完成恢復驗收清單（見第 5 節） |
| `* → archived` | Admin（Jacky）| 合約終止確認；需填入封存原因 |

所有狀態轉換都必須建立一筆 `BrandLifecycleEvent` 記錄，包含 `fromStage`、`toStage`、`triggeredBy`、`reason`、`createdAt`。

---

## 2. 人員生命週期

### 2.1 兩個層次的人員狀態

平台有兩個層次的人員狀態，需分開理解：

**平台層次（Platform Level）**：成員是否還在雙云工作，影響所有品牌。目前以 `User.role` 管理；正式的 `status` 欄位在 Phase 2 補入。

**品牌指派層次（Brand Assignment Level）**：成員在特定品牌的工作狀態，以 `BrandMemberAssignment.status` 追蹤。**這是本規格的核心定義層次。**

### 2.2 六個品牌指派狀態

| 狀態 | 說明 | 品牌 App 存取 | 任務可見 | 可提交 |
|---|---|---|---|---|
| `invited` | 已指派品牌，尚未完成品牌速查卡 | ✗（可看 onboarding checklist） | ✗ | ✗ |
| `active` | 正常工作中 | ✓ | 依角色（see 3.1） | ✓ |
| `paused` | 暫時離開（請假、調整），任務已轉派 | ✗ | ✗ | ✗ |
| `offboarded` | 已離開平台，指派記錄保留供審計 | ✗ | ✗ | ✗ |
| `reassigned` | 此指派已結束，任務移轉他人（成員仍在平台） | ✗（此品牌） | ✗（此品牌） | ✗（此品牌） |
| `reactivated` | 從 `paused` 恢復，重新開始工作 | ✓ | ✓ | ✓ |

`reactivated` 在確認後應立即轉回 `active`（不作為長期穩定狀態）。

### 2.3 品牌指派合法轉換路徑

```text
Sophia 指派成員
       │
       ▼
   invited ──► active ──────────────────► paused ──► reactivated ──► active
                  │                           │
                  │ 任務移轉                   │ 成員離職
                  ▼                           ▼
             reassigned                  offboarded
```

**不可逆轉換：**
- `offboarded → 任何狀態`（人員離職後不回復此指派；若重新加入，建立新指派記錄）
- `archived → 任何狀態`（品牌封存後，指派記錄唯讀）

### 2.4 轉換觸發者

| 轉換 | 可觸發者 | 條件 |
|---|---|---|
| `→ invited` | Sophia / Jacky | 建立 BrandMemberAssignment |
| `invited → active` | 系統（自動） | 成員 TrainingTaskAssignment（task-brand-context-card）狀態達到 `reviewed` |
| `active → paused` | Sophia / Jacky | 填入暫停原因；觸發任務轉派流程 |
| `paused → reactivated → active` | Sophia / Jacky | 確認成員回歸；還原工作台存取 |
| `active / paused → reassigned` | Sophia / Jacky | 指定接手人（`reassignedTo` userId）；建立新指派 |
| `* → offboarded` | Jacky | 填入離職原因；觸發所有品牌任務轉派 |

所有轉換都建立一筆 `MemberLifecycleEvent` 記錄，包含 `fromStatus`、`toStatus`、`triggeredBy`、`reason`、`taskReassignments`（如有任務移轉）、`createdAt`。

---

## 3. 系統影響矩陣

### 3.1 品牌狀態 × 系統各層

| 品牌狀態 | Command Center | Brand App | Sheet Connector | 任務生成 | Review | Trace |
|---|---|---|---|---|---|---|
| `onboarding` | 顯示「導入中」；列入品牌目錄但標示未完成 | admin/reviewer 可存取以完成資料包 | `needs_setup`；不讀不寫 | 不產生；可手動建立 | 限 admin/reviewer | 記錄資料包填寫活動 |
| `active` | 正常顯示；任務數、訊號數、待審數 | 全功能（依角色） | `active`；讀寫正常 | 正常產生 | 正常 | 正常 |
| `paused` | 顯示「暫停」；dim 樣式；任務數凍結 | reviewer/admin 唯讀；newcomer 無法進入 | 自動切換為 `paused`；停止讀寫 | 停止；不產生新任務 | 進行中 review 可完成；新 review 不開始 | 繼續記錄 reviewer 操作 |
| `archived` | 不在活躍清單；在「封存品牌」分類可查 | 唯讀（僅 admin）；所有互動按鈕隱藏 | 停用（永久） | 停止（永久） | 停止（永久） | 唯讀；永久保留 |
| `resumed` | 顯示「恢復中」；黃色警示 | reviewer/admin 唯讀；驗收清單可操作 | `needs_setup`；待 Sophia 手動重連 | 停止；等待 `active` 才產生 | 可完成暫停期間 pending 的 review | 正常記錄 |

### 3.2 人員指派狀態 × 系統各層

| 成員狀態 | Command Center | Brand App | Sheet Connector | 任務生成 | Review | Trace |
|---|---|---|---|---|---|---|
| `invited` | 顯示「等待進場」 | 僅顯示品牌速查卡任務 | 無存取 | 不分配任務 | 無 | 記錄 checklist 完成 |
| `active` | 顯示於品牌指派成員列表 | 依角色全功能 | 無直接存取 | 正常分配 | 正常 | 正常 |
| `paused` | 顯示「暫停中」 | 無存取（所有品牌）| 無存取 | 不分配；已有任務轉派 | 不分配 | 唯讀（保留歷史） |
| `offboarded` | 不在活躍列表；歷史可查 | 無存取（永久） | 無存取 | 無 | 無 | 唯讀；永久保留 |
| `reassigned` | 原品牌下不顯示 | 原品牌無存取 | 無（原品牌） | 無（原品牌） | 無（原品牌） | 原品牌記錄唯讀 |
| `reactivated` | 顯示為正常成員（確認後即 active） | 恢復前一次 active 的權限 | 恢復前一次 active 的存取 | 恢復 | 恢復 | 繼續正常記錄 |

---

## 4. 品牌暫停詳細規格

### 4.1 觸發暫停

觸發條件：
- 客戶主動要求暫停服務
- 双云內部容量調整
- 品牌資料重大變更，需暫停等待新資料包確認
- Jacky 判斷品牌需要審查

觸發步驟（Sophia / Jacky 操作）：
1. 在 Brand App 觸發「暫停品牌」操作
2. 填入暫停原因（`reason` 必填，最長 200 字）
3. 確認目前 `in_progress` 任務清單
4. 系統建立 `BrandLifecycleEvent`（`active → paused`）
5. 系統自動將 `BrandSheetConnector.status` 改為 `paused`

### 4.2 暫停期間資料保留規則

| 資料項目 | 暫停後的狀態 |
|---|---|
| `BrandBrain` 全部欄位 | 完整保留，唯讀 |
| `BrandTask`（所有狀態） | 保留，狀態不變，不凍結成新狀態 |
| `RevenueSignal` | 完整保留，不新增 |
| `SeniorMemberActivity` | 完整保留；reviewer 審查活動可繼續新增 |
| `BrandRawImport` 歷史 | 完整保留，不新增 |
| `BrandNormalizedMetric` 歷史 | 完整保留，不新增 |
| `BrandSheetConnector` | 設定保留；`status` 改為 `paused`；不讀不寫 |
| `BrandLifecycleEvent` | 保留；繼續記錄暫停期間的管理操作 |

**任務凍結語意**：暫停不新增任務狀態字段。「任務凍結」的語意是：
- 不產生新任務
- newcomer 無法存取，所以不會推進任何任務
- `reviewing` 狀態的任務：reviewer 可繼續完成（不中斷 review 流程）
- `in_progress` 狀態的任務：保留原狀，待品牌恢復後由 Sophia 確認是否繼續

### 4.3 前台可見性

| 介面 | 暫停後的顯示 |
|---|---|
| Command Center 品牌目錄 | 顯示品牌，標示「暫停」，dim 樣式 |
| Brand App 主頁 | 顯示暫停 banner：「此品牌目前暫停，任何修改需聯繫 Sophia 或 Jacky」 |
| newcomer 端 | 完全無法進入 Brand App，且進入嘗試時回傳業務錯誤說明（非 403） |
| Sheet Connector 狀態 | 顯示「已暫停」；不顯示上次讀取資料 |

---

## 5. 品牌恢復詳細規格

### 5.1 恢復觸發

觸發：Sophia / Jacky 主動操作，品牌進入 `resumed` 中間狀態。

`resumed` 的設計目的：讓平台在品牌回到 `active` 前，有一個明確的驗收視窗，避免「直接從 paused 跳到 active，舊任務亂跳」。

### 5.2 恢復驗收清單（必須全部完成才能轉 `active`）

```text
□ 1. 確認暫停原因已解除（Sophia 填入確認說明）
□ 2. 審查 in_progress 任務清單（每個任務逐一確認：繼續 / 作廢 / 移轉）
□ 3. 作廢的任務建立 SeniorMemberActivity（type: "handoff"，說明原因）
□ 4. 確認成員指派仍然有效（paused 成員需先 reactivated 或重新指派）
□ 5. 連接 Sheet Connector（BrandSheetConnector.status 改回 "active"）
□ 6. 確認 BrandBrain 是否需要更新（暫停期間若有品牌策略變動）
□ 7. 建立一筆 RevenueSignal 作為恢復基準點
□ 8. Jacky 最終確認 → 建立 BrandLifecycleEvent（resumed → active）
```

### 5.3 避免舊任務亂跳的規則

| 任務狀態 | 暫停時長 < 14 天 | 暫停時長 14–30 天 | 暫停時長 > 30 天 |
|---|---|---|---|
| `queued` | 自動恢復可執行 | 自動恢復可執行 | Sophia 需逐一確認是否仍適用 |
| `in_progress` | Sophia 確認後繼續 | Sophia 確認後繼續 | 預設標記「需重新評估」；Sophia 明確決定才繼續 |
| `reviewing` | 照常推進 | 照常推進 | 照常推進 |
| `done` | 不受影響 | 不受影響 | 不受影響 |

「需重新評估」不是新的任務狀態，而是 Sophia 在恢復驗收清單中的操作確認記錄（以 `SeniorMemberActivity.summary` 記錄判斷脈絡）。

---

## 6. 人員暫停 / 離開詳細規格

### 6.1 人員暫停（`active → paused`）

觸發條件：
- 成員申請暫時離開（請假、輪調）
- Sophia 認定成員目前無法繼續負責任務

觸發步驟：
1. Sophia 操作：選擇成員、填入暫停原因與預計回歸時間（選填）
2. 系統列出該成員在所有品牌的 `in_progress` 任務清單
3. Sophia 指定每個任務的接手人（或暫存，等成員回歸）
4. 系統對每個有接手人的任務建立 `MemberLifecycleEvent`（包含 `taskReassignments`）
5. 系統建立一筆 `SeniorMemberActivity`（type: `"handoff"`，記錄任務轉派說明）
6. 成員的 `BrandMemberAssignment.status` 改為 `paused`

**SLA：所有 `in_progress` 任務在觸發後 48 小時內完成轉派決定。**

### 6.2 任務轉派協議

| 場景 | 處理方式 |
|---|---|
| 有明確接手人 | `BrandTask.ownerUserId` 改為接手人；建立 `MemberLifecycleEvent.taskReassignments` 記錄 |
| 無合適接手人 | 任務狀態保留原樣；Sophia 在 `SeniorMemberActivity` 留下說明，待成員回歸 |
| `reviewing` 任務 | 不受影響（review 是 reviewer 的工作，不依賴原 owner）|
| `done` 任務 | 不受影響 |
| `queued` 任務 | 優先轉派給接手人；若品牌任務不緊迫，可暫不轉派 |

### 6.3 人員離職（`* → offboarded`）

觸發條件：Jacky 確認成員離職。

觸發步驟（比暫停更嚴格）：
1. Jacky 操作：確認離職，填入離職原因
2. 系統列出成員在**所有品牌**的所有 `in_progress` + `queued` 任務
3. Sophia / Jacky 必須為所有任務指定接手人（或決定作廢）
4. 系統對所有品牌建立 `MemberLifecycleEvent`（`offboarded`）
5. 系統對每個有異動的任務建立 `SeniorMemberActivity`（type: `"handoff"`）
6. 成員所有品牌的 `BrandMemberAssignment.status` 改為 `offboarded`
7. 成員的平台存取（`User.role`）由 Jacky 另行停用（超出本規格範圍）

### 6.4 任務轉派記錄格式

每次任務轉派（無論是暫停還是離職觸發），都建立以下記錄：

```typescript
// MemberLifecycleEvent（由轉派操作觸發）
{
  fromStatus: "active",
  toStatus: "paused" | "offboarded" | "reassigned",
  triggeredBy: "user-sophia" | "user-jacky",
  reason: "...",
  taskReassignments: [
    { taskId: "brand-task-xxx", newOwnerId: "user-yyy" },
    // ...
  ]
}

// SeniorMemberActivity（同時建立，讓新人可讀到脈絡）
{
  activityType: "handoff",
  summary: "原負責人 XXX 因 [原因] 暫停，任務已轉派給 YYY。請接手人先閱讀任務背景再繼續。",
  relatedBrandTaskIds: ["brand-task-xxx"]
}
```

### 6.5 Trace 保留規則

| 情境 | Trace Log 保留方式 |
|---|---|
| 成員暫停 | 暫停前的所有 trace log 完整保留；暫停期間無新增 |
| 成員離職 | 所有品牌的 trace log 永久唯讀保留；actorId 保持原值不匿名 |
| 任務轉派後 | 新 owner 的操作記錄從轉派時間點起算；舊 owner 記錄保留 |
| 品牌封存後 | 所有相關 trace log 永久唯讀保留 |

---

## 7. Domain Model 對照

### 7.1 新增或修改的型別（`src/lib/domain.ts`）

| 型別 | 新增 / 修改 | 說明 |
|---|---|---|
| `BrandOperatingStage` | 新增（named export） | `onboarding \| active \| paused \| archived \| resumed` |
| `ClientBrand.operatingStage` | 修改 | 從 3 個值擴展為 5 個值；使用 `BrandOperatingStage` |
| `BrandMemberAssignmentStatus` | 新增 | 6 個品牌指派狀態 |
| `BrandMemberAssignmentRole` | 新增 | `newcomer_trainee \| reviewer \| lead` |
| `BrandMemberAssignment` | 新增 | 正式型別，含完整生命週期欄位 |
| `BrandLifecycleEvent` | 新增 | 品牌狀態轉換稽核記錄 |
| `MemberLifecycleEvent` | 新增 | 人員狀態轉換稽核記錄（含任務轉派清單） |

### 7.2 Phase 2 預計補入的欄位

以下欄位在概念上已定義，但 Phase 2 才正式加入 domain.ts：

| 欄位 | 所屬型別 | 說明 |
|---|---|---|
| `User.status` | `User` | `"active" \| "paused" \| "offboarded"`（平台層次） |
| `BrandTask.frozenAt` | `BrandTask` | 品牌暫停時的記錄時間點（輔助 resumed 驗收） |
| `BrandTask.pausedContext` | `BrandTask` | 品牌暫停時的任務脈絡快照 |

---

## 8. 與其他規格文件的關係

| 文件 | 關聯說明 |
|---|---|
| `brand-app-isolation-spec.md` | 本規格中的品牌狀態影響 Brand App 的存取控制邏輯（第 3.3 節三關驗證需加入狀態檢查） |
| `brand-sheet-connector-spec.md` | 品牌暫停時 Connector 狀態自動切為 `paused`；恢復時進入 `needs_setup` 重連 |
| `brand-onboarding-workflow.md` | 新人進場三關驗證需確認品牌 `operatingStage === "active"`（非 resumed / paused） |
| `muzopet-data-architecture.md` | 本規格的任務凍結語意對應數據流的「暫停期間不進入 RawImport」規則 |

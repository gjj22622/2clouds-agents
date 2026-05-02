# Platform Simulation Records

本資料夾集中保存双云平台的角色模擬紀錄。

這些文件用來記錄「真實双云運作邏輯」如何被轉譯成平台功能、資料模型、任務流程、review 規則與決策 gate。未來每次模擬新人、Sophia、藝嘉、政澔、Jacky、品牌窗口或客戶端角色時，都應在這裡建立一份可回溯的紀錄。

## 使用目的

- 回溯平台功能為什麼這樣設計
- 驗證平台是否符合真實双云工作方式
- 累積新人訓練、品牌營運、品管、決策升級的案例
- 分享平台是如何從工作模擬逐步建立出來
- 將模擬結果轉成後續 engineering slice、acceptance criteria 或 reviewer rule

## 命名規則

```text
{brand-or-scope}-{role-scope}-simulation-{YYYY-MM-DD}.md
```

範例：

- `muzopet-three-role-platform-simulation-2026-05-02.md`
- `newcomer-review-loop-simulation-2026-05-03.md`
- `brand-sheet-connector-operator-simulation-2026-05-04.md`

## 建議文件結構

每份模擬紀錄建議包含：

1. 模擬日期
2. 模擬目標
3. 模擬品牌或平台範圍
4. 模擬角色
5. 各角色登入後看到的狀態
6. 各角色執行的動作
7. 各角色產出的內容
8. 平台應留下的 trace log
9. review / decision / approval 結果
10. 這次模擬驗證出的平台能力
11. 這次模擬暴露出的平台缺口
12. 後續工程切片建議

## 目前紀錄

| 日期 | 文件 | 範圍 | 重點 |
|---|---|---|---|
| 2026-05-02 | [木酢寵物達人三角色平台運作模擬](./muzopet-three-role-platform-simulation-2026-05-02.md) | 新人 / 藝嘉 / Jacky | 會員喚醒任務、藝嘉退修、Jacky 高風險決策 gate |
| 2026-05-02 | [木酢自主 Agent Team 執行模擬](./muzopet-autonomous-agent-team-simulation-2026-05-02.md) | Agent Team / Jacky / 藝嘉 / Sophia | 月度目標拆解、會員喚醒提案、防蚊紅線攔截、ResourceRequest、Jacky approval gate、DailyOperatingReport |


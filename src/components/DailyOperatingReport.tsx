"use client";

export function DailyOperatingReport() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Operating Report</div>
          <h2>今日營運日報 (2026-05-02)</h2>
          <p>由 Revenue Commander Agent 彙整產出。</p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="report-section">
          <h4>今日做了什麼 (Actions Taken)</h4>
          <ul className="report-list">
            <li>月度營收目標已設定：+300,000 TWD，進度計算中</li>
            <li>完成 3 個 ActionProposal 產出，目前 2 個進入合規掃描</li>
            <li>自動計算沉睡戶分群（約 8,000 人），完成 LINE 文案草稿 A</li>
          </ul>
        </div>

        <div className="report-section">
          <h4>哪些被擋住 (Blockers)</h4>
          <ul className="report-list">
            <li>ap-muz-002 防蚊場景適用對象不明，Compliance Agent 已攔截</li>
            <li>會員喚醒計畫因「名單黑名單」尚未核對，暫緩執行發送</li>
          </ul>
        </div>

        <div className="report-section">
          <h4>需要人類資源 (Resource Needs)</h4>
          <ul className="report-list">
            <li>Sophia：陳總會員名單存取授權 (截止 5/4)</li>
            <li>藝嘉：防蚊文案適用對象標注確認 (截止 5/3)</li>
          </ul>
        </div>

        <div className="report-section">
          <h4>明天下一步 (Next Actions)</h4>
          <ul className="report-list">
            <li>完成 ap-muz-001 的 LINE 細部排版指引</li>
            <li>等 Sophia 資源到位後解鎖發送計畫</li>
            <li>更新昨日 GMV 累計進度儀表板</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

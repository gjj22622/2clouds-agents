"use client";

export function RevenueGoalPanel() {
  const goal = 300000;
  const current = 120000;
  const gap = goal - current;
  const percent = Math.round((current / goal) * 100);

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Revenue Goal</div>
          <h2 style={{ fontSize: "24px", marginBottom: 4 }}>木酢 5 月營收目標</h2>
          <p>期間：2026-05-01 至 2026-05-31</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="metric-label">目前進度</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--sy-ink)" }}>{percent}%</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="revenue-progress-bar">
          <div className="revenue-progress-fill" style={{ width: `${percent}%` }} />
          <span className="revenue-progress-text">{current.toLocaleString()} / {goal.toLocaleString()} TWD</span>
        </div>
      </div>

      <div className="metric-grid" style={{ marginTop: 24 }}>
        <div className="metric">
          <span className="metric-label">目標金額</span>
          <span className="metric-value">{goal.toLocaleString()}</span>
        </div>
        <div className="metric" style={{ borderLeftColor: "var(--sy-blue)" }}>
          <span className="metric-label">累計 GMV</span>
          <span className="metric-value">{current.toLocaleString()}</span>
        </div>
        <div className="metric" style={{ borderLeftColor: "var(--sy-ember)" }}>
          <span className="metric-label">營收缺口</span>
          <span className="metric-value" style={{ color: "var(--sy-ember)" }}>{gap.toLocaleString()}</span>
        </div>
      </div>
    </section>
  );
}

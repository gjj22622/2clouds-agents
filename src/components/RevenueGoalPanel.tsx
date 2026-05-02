"use client";

import type { RevenueGoal, RevenueGoalProgress } from "@/lib/domain";

export function RevenueGoalPanel({
  goal,
  progress,
}: {
  goal: RevenueGoal;
  progress: RevenueGoalProgress;
}) {
  const periodStart = new Date(goal.periodStart).toISOString().slice(0, 10);
  const periodEnd = new Date(goal.periodEnd).toISOString().slice(0, 10);

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Revenue Goal</div>
          <h2 style={{ fontSize: "24px", marginBottom: 4 }}>{goal.title}</h2>
          <p>期間：{periodStart} 至 {periodEnd}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="metric-label">目前進度</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--sy-ink)" }}>{progress.percent}%</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="revenue-progress-bar">
          <div className="revenue-progress-fill" style={{ width: `${progress.percent}%` }} />
          <span className="revenue-progress-text">{progress.currentAmount.toLocaleString()} / {progress.targetAmount.toLocaleString()} TWD</span>
        </div>
      </div>

      <div className="metric-grid" style={{ marginTop: 24 }}>
        <div className="metric">
          <span className="metric-label">目標金額</span>
          <span className="metric-value">{progress.targetAmount.toLocaleString()}</span>
        </div>
        <div className="metric" style={{ borderLeftColor: "var(--sy-blue)" }}>
          <span className="metric-label">累計 GMV</span>
          <span className="metric-value">{progress.currentAmount.toLocaleString()}</span>
        </div>
        <div className="metric" style={{ borderLeftColor: "var(--sy-ember)" }}>
          <span className="metric-label">營收缺口</span>
          <span className="metric-value" style={{ color: "var(--sy-ember)" }}>{progress.gapAmount.toLocaleString()}</span>
        </div>
      </div>
    </section>
  );
}

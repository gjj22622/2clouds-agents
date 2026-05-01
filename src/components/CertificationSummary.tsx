import type { CertificationProgress } from "@/lib/domain";

export function CertificationSummary({
  progress,
}: {
  progress: CertificationProgress;
}) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Certification</div>
          <h2>60 分認證進度</h2>
          <p>達成 60 分即具備數位行銷服務交付能力。進度以已品管點數計算。</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="badge reviewed" style={{ fontSize: "16px", padding: "6px 12px" }}>
            {progress.percent}%
          </span>
        </div>
      </div>
      
      <div className="progress-track" aria-label="Certification progress">
        <div className="progress-bar" style={{ width: `${progress.percent}%` }} />
      </div>

      <div className="metric-grid" style={{ marginTop: 24 }}>
        <div className="metric">
          <span className="metric-label">已品管點數</span>
          <span className="metric-value">{progress.reviewedPoints}</span>
        </div>
        <div className="metric" style={{ borderLeftColor: "var(--sy-blue)" }}>
          <span className="metric-label">已送出點數</span>
          <span className="metric-value">{progress.submittedPoints}</span>
        </div>
        <div className="metric" style={{ borderLeftColor: "var(--sy-line)" }}>
          <span className="metric-label">認證門檻</span>
          <span className="metric-value">{progress.targetPoints}</span>
        </div>
      </div>
    </section>
  );
}

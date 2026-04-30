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
          <div className="eyebrow">60 point certification</div>
          <h2>60 分認證進度</h2>
          <p>以 reviewer 完成品管的任務點數計算正式進度。</p>
        </div>
        <span className="badge reviewed">{progress.percent}%</span>
      </div>
      <div className="progress-track" aria-label="Certification progress">
        <div className="progress-bar" style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="metric-grid" style={{ marginTop: 16 }}>
        <div className="metric">
          <span className="metric-value">{progress.reviewedPoints}</span>
          <span className="metric-label">已品管點數</span>
        </div>
        <div className="metric">
          <span className="metric-value">{progress.submittedPoints}</span>
          <span className="metric-label">已送出點數</span>
        </div>
        <div className="metric">
          <span className="metric-value">{progress.targetPoints}</span>
          <span className="metric-label">認證門檻</span>
        </div>
      </div>
    </section>
  );
}

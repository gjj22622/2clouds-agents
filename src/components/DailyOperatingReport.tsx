"use client";

import type { DailyOperatingReport as DailyOperatingReportData } from "@/lib/domain";

export function DailyOperatingReport({
  report,
}: {
  report: DailyOperatingReportData;
}) {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Operating Report</div>
          <h2>今日營運日報 ({report.date})</h2>
          <p>由 Revenue Commander Agent 彙整產出。</p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="report-section">
          <h4>今日做了什麼 (Actions Taken)</h4>
          <ul className="report-list">
            {report.actionsTaken.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="report-section">
          <h4>哪些被擋住 (Blockers)</h4>
          <ul className="report-list">
            {report.blockers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="report-section">
          <h4>需要人類資源 (Resource Needs)</h4>
          <ul className="report-list">
            {report.resourceNeeds.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="report-section">
          <h4>明天下一步 (Next Actions)</h4>
          <ul className="report-list">
            {report.nextActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

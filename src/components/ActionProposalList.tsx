"use client";

type RiskLevel = "low" | "medium" | "high";

interface ActionProposal {
  id: string;
  title: string;
  impact: string;
  risk: RiskLevel;
  requiredApproval: string;
  status: string;
}

const proposals: ActionProposal[] = [
  {
    id: "ap-muz-001",
    title: "沉睡戶 LINE OA 家庭場景喚醒波次",
    impact: "+72,000",
    risk: "medium",
    requiredApproval: "藝嘉, Jacky",
    status: "Pending Compliance",
  },
  {
    id: "ap-muz-002",
    title: "高頻戶 LINE 春夏外出加購組合",
    impact: "+32,000",
    risk: "high",
    requiredApproval: "藝嘉, Jacky",
    status: "Flagged",
  },
  {
    id: "ap-muz-003",
    title: "流失戶 EDM 品牌故事喚醒",
    impact: "+16,000",
    risk: "low",
    requiredApproval: "藝嘉",
    status: "Pending List Conf",
  },
];

export function ActionProposalList() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Action Proposals</div>
          <h2>行動提案清單</h2>
          <p>根據策略優先序產出的具體執行方案。</p>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="proposal-row" style={{ borderBottom: "2px solid var(--line)", paddingBottom: 8 }}>
          <div className="form-label">Proposal Title</div>
          <div className="form-label">Impact</div>
          <div className="form-label">Risk</div>
          <div className="form-label">Approval</div>
          <div className="form-label">Status</div>
        </div>
        {proposals.map((proposal) => (
          <div className="proposal-row" key={proposal.id}>
            <div style={{ fontWeight: 600, fontSize: "14px" }}>{proposal.title}</div>
            <div style={{ color: "var(--success)", fontWeight: 700 }}>{proposal.impact}</div>
            <div>
              <span className={`risk-badge ${proposal.risk}`}>{proposal.risk}</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--sy-gray)" }}>{proposal.requiredApproval}</div>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>{proposal.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

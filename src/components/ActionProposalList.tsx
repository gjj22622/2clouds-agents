"use client";

import type { ActionProposal, ApprovalRole, ActionProposalStatus } from "@/lib/domain";

const approvalRoleLabels: Record<ApprovalRole, string> = {
  yijia: "藝嘉",
  jacky: "Jacky",
  sophia: "Sophia",
  zhenghao: "政澔",
};

const statusLabels: Record<ActionProposalStatus, string> = {
  draft: "Draft",
  pending_compliance_review: "Pending Compliance",
  flagged: "Flagged",
  blocked: "Blocked",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

export function ActionProposalList({
  proposals,
}: {
  proposals: ActionProposal[];
}) {
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
            <div style={{ color: "var(--success)", fontWeight: 700 }}>+{proposal.expectedRevenueImpact.toLocaleString()}</div>
            <div>
              <span className={`risk-badge ${proposal.riskLevel}`}>{proposal.riskLevel}</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--sy-gray)" }}>
              {proposal.requiredApprovalRoles.map((role) => approvalRoleLabels[role]).join(", ")}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>{statusLabels[proposal.status]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

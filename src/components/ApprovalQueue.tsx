"use client";

import type {
  ActionProposal,
  ApprovalRole,
  ResourceRequest,
} from "@/lib/domain";

const approvalRoleLabels: Record<ApprovalRole, string> = {
  yijia: "藝嘉 (Reviewer)",
  jacky: "Jacky (Approval)",
  sophia: "Sophia (Resource)",
  zhenghao: "政澔 (Connector)",
};

const roles: ApprovalRole[] = ["yijia", "jacky", "sophia", "zhenghao"];

export function ApprovalQueue({
  proposals,
  resourceRequests,
}: {
  proposals: ActionProposal[];
  resourceRequests: ResourceRequest[];
}) {
  const sections = roles.map((role) => ({
    role,
    proposals: proposals.filter((proposal) =>
      proposal.requiredApprovalRoles.includes(role),
    ),
    resourceRequests: resourceRequests.filter(
      (request) => request.ownerRole === role,
    ),
  }));

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Approval Queue</div>
          <h2>待辦審核佇列</h2>
          <p>分配給人類夥伴的判斷點與資源請求。</p>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {sections.map((section) => (
          <div key={section.role} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: "14px", color: "var(--sy-gray)", borderBottom: "1px solid var(--line)", paddingBottom: 8, marginBottom: 12 }}>
              {approvalRoleLabels[section.role]}
            </h3>
            {[...section.proposals, ...section.resourceRequests].map((item) => (
              <div className="approval-item" key={item.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span className="brand-badge" style={{ marginBottom: 4, display: "inline-block" }}>
                      {"expectedRevenueImpact" in item ? "proposal" : "resource"}
                    </span>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>
                      {"expectedRevenueImpact" in item ? item.id : item.title}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                      {"expectedRevenueImpact" in item ? item.title : item.reason}
                    </p>
                  </div>
                  <button className="button secondary-button" style={{ minHeight: "32px", fontSize: "12px", padding: "0 12px" }}>
                    處理
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

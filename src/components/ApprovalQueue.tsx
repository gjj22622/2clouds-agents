"use client";

interface ApprovalItem {
  id: string;
  type: "proposal" | "resource";
  title: string;
  desc: string;
}

interface ApprovalSection {
  role: string;
  items: ApprovalItem[];
}

const approvalSections: ApprovalSection[] = [
  {
    role: "藝嘉 (Reviewer)",
    items: [
      { id: "1", type: "proposal", title: "ap-muz-002 防蚊文案", desc: "需確認防蚊商品適用對象分類" },
      { id: "2", type: "resource", title: "黑名單核對", desc: "沉睡戶名單退訂狀態核實" },
    ],
  },
  {
    role: "Jacky (Approval)",
    items: [
      { id: "3", type: "proposal", title: "策略方向 A：會員喚醒", desc: "確認本月主力方向優先序" },
      { id: "4", type: "proposal", title: "ap-muz-001 高風險策略", desc: "沉睡戶 LINE 喚醒方案最終授權" },
    ],
  },
  {
    role: "Sophia (Resource)",
    items: [
      { id: "5", type: "resource", title: "名單授權確認", desc: "陳總是否已授權 20 萬會員分群名單" },
    ],
  },
  {
    role: "政澔 (Connector)",
    items: [
      { id: "6", type: "resource", title: "GA4 事件標籤確認", desc: "官網加購與購買事件觸發驗證" },
    ],
  },
];

export function ApprovalQueue() {
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
        {approvalSections.map((section) => (
          <div key={section.role} style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: "14px", color: "var(--sy-gray)", borderBottom: "1px solid var(--line)", paddingBottom: 8, marginBottom: 12 }}>
              {section.role}
            </h3>
            {section.items.map((item) => (
              <div className="approval-item" key={item.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span className="brand-badge" style={{ marginBottom: 4, display: "inline-block" }}>{item.type}</span>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>{item.title}</div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>{item.desc}</p>
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

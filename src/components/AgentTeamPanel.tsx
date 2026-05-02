"use client";

type AgentStatus = "running" | "ready" | "blocked" | "needs-approval";

interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  todayTask: string;
}

const agents: Agent[] = [
  {
    id: "revenue-commander",
    name: "Revenue Commander",
    status: "running",
    todayTask: "監控營收缺口並動態調整策略優先序",
  },
  {
    id: "member-reactivation",
    name: "Member Reactivation",
    status: "needs-approval",
    todayTask: "沉睡戶 LINE 喚醒方案待藝嘉審核文案",
  },
  {
    id: "content-offer",
    name: "Content & Offer",
    status: "ready",
    todayTask: "準備春夏外出防蚊組合加購草稿",
  },
  {
    id: "compliance-reviewer",
    name: "Compliance & Brand",
    status: "blocked",
    todayTask: "防蚊適用對象場景混用，等待人工分類建議",
  },
  {
    id: "data-attribution",
    name: "Data Attribution",
    status: "running",
    todayTask: "昨日 GMV 歸因計算中，不可歸因率 12%",
  },
  {
    id: "resource-request",
    name: "Resource Request",
    status: "ready",
    todayTask: "彙整並發送名單授權與 GA4 標籤請求",
  },
];

const statusLabels: Record<AgentStatus, string> = {
  running: "執行中",
  ready: "就緒",
  blocked: "被擋住",
  "needs-approval": "待審核",
};

export function AgentTeamPanel() {
  return (
    <section className="section">
      <div className="section-header">
        <div>
          <div className="eyebrow">Agent Team</div>
          <h2>自主營運小組</h2>
          <p>6 個專屬 Agent 24 小時協作拆解營收目標。</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 12 }}>
        {agents.map((agent) => (
          <div className="agent-card" key={agent.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 style={{ fontSize: "14px", margin: 0 }}>{agent.name}</h3>
              <div className={`agent-status ${agent.status}`}>
                {statusLabels[agent.status]}
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
              {agent.todayTask}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

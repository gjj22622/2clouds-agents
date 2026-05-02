"use client";

import type { AgentTeam, AgentStatus } from "@/lib/domain";

const statusLabels: Record<AgentStatus, string> = {
  running: "執行中",
  ready: "就緒",
  blocked: "被擋住",
  needs_approval: "待審核",
};

function statusClassName(status: AgentStatus) {
  return status.replace("_", "-");
}

export function AgentTeamPanel({ agentTeam }: { agentTeam: AgentTeam }) {
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
        {agentTeam.agents.map((agent) => (
          <div className="agent-card" key={agent.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 style={{ fontSize: "14px", margin: 0 }}>{agent.name}</h3>
              <div className={`agent-status ${statusClassName(agent.status)}`}>
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

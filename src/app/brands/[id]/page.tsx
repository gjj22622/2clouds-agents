import { brains, trainingTasks, taskAssignments, reviewerUser } from "@/lib/seed";
import { TaskCard } from "@/components/TaskCard";
import Link from "next/link";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brandName = id === "demo-brand" ? "双云行銷 (Demo)" : id;

  // Use the existing brand brain from seed
  const brandBrain = brains.find((b) => b.type === "brand")!;

  // Mock revenue signals
  const revenueSignals = [
    { label: "本月營收貢獻", value: "$12,400", trend: "+12%", type: "positive" },
    { label: "ROAS (平均)", value: "4.2", trend: "-2%", type: "neutral" },
    { label: "新客成本 (CAC)", value: "$15.5", trend: "-5%", type: "positive" },
  ];

  // Mock member assignments
  const assignedMembers = [
    { name: "Sophia", role: "Account Lead" },
    { name: reviewerUser.name, role: "Quality Control" },
    { name: "新人夥伴 A", role: "Content Creator" },
  ];

  const recentActions = [
    {
      id: "a1",
      user: reviewerUser.name,
      action: "更新了品牌語氣規範",
      time: "2 小時前",
      target: "Brand Brain",
    },
    {
      id: "a2",
      user: "Sophia",
      action: "導入了 Q3 促銷素材包",
      time: "5 小時前",
      target: "Asset Library",
    },
    {
      id: "a3",
      user: "Jacky",
      action: "修正了高風險升級判斷邏輯",
      time: "昨天",
      target: "Decision Model",
    },
  ];

  const brandTasks = trainingTasks.slice(1, 4);

  return (
    <div className="brand-app-shell">
      <aside className="brand-app-sidebar">
        <div style={{ marginBottom: "32px" }}>
          <Link href="/brands" className="badge" style={{ background: "var(--sy-mist)", color: "var(--primary-strong)", fontWeight: 800, cursor: "pointer", display: "inline-block", marginBottom: "16px" }}>
            ← COMMAND CENTER
          </Link>
          <div className="brand-badge" style={{ marginBottom: "8px" }}>Active Brand App</div>
          <h1 style={{ margin: 0, fontSize: "24px", lineHeight: 1.2 }}>{brandName}</h1>
        </div>

        <nav className="brand-sub-nav">
          <span className="active">Dashboard Overview</span>
          <span>Brand Brain Wiki</span>
          <span>Product Intelligence</span>
          <span>Customer Persona</span>
          <span>Daily Tasks</span>
          <span>Performance Logs</span>
          <span style={{ marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>Brand Settings</span>
        </nav>
      </aside>

      <main className="brand-app-main">
        <div className="page-grid">
          <div className="stack" style={{ gap: "32px" }}>
            {/* Main Content Area */}
            <div className="section isolated-section" style={{ background: "white" }}>
              <div className="section-header">
                <div>
                  <div className="eyebrow">Operational Focus</div>
                  <h2 style={{ fontSize: "22px" }}>今日任務</h2>
                  <p>當前正在進行的品牌交付與品管工作。</p>
                </div>
                <button className="button">建立新任務</button>
              </div>
              <div className="card-list" style={{ marginTop: "24px" }}>
                {brandTasks.map((task) => {
                  const assignment = taskAssignments.find(a => a.taskId === task.id) || {
                    id: `temp-${task.id}`,
                    taskId: task.id,
                    userId: "user-newcomer-01",
                    status: "not_started" as const
                  };
                  return (
                    <TaskCard
                      assignment={assignment}
                      key={task.id}
                      task={task}
                    />
                  );
                })}
              </div>
            </div>

            <div className="metric-grid">
              <section className="section" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
                <div className="eyebrow">Intelligence</div>
                <h3 style={{ marginTop: "8px" }}>核心腦模組</h3>
                <div className="stack" style={{ gap: "16px", marginTop: "20px" }}>
                  <div style={{ padding: "12px", borderLeft: "3px solid var(--sy-blue)", background: "var(--sy-cloud)", borderRadius: "0 4px 4px 0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--sy-deep)", textTransform: "uppercase" }}>BRAND BRAIN</div>
                    <p style={{ fontSize: "13px", color: "var(--sy-ink)", margin: "4px 0", fontWeight: 500 }}>
                      {brandBrain.summary}
                    </p>
                  </div>
                  <div style={{ padding: "12px", borderLeft: "3px solid var(--line)", background: "var(--sy-paper)", borderRadius: "0 4px 4px 0", opacity: 0.6 }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--sy-gray)", textTransform: "uppercase" }}>PRODUCT BRAIN</div>
                    <p style={{ fontSize: "13px", color: "var(--sy-gray)", fontStyle: "italic", margin: "4px 0" }}>
                      尚未導入產品規格。
                    </p>
                  </div>
                  <div style={{ padding: "12px", borderLeft: "3px solid var(--line)", background: "var(--sy-paper)", borderRadius: "0 4px 4px 0", opacity: 0.6 }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--sy-gray)", textTransform: "uppercase" }}>CUSTOMER BRAIN</div>
                    <p style={{ fontSize: "13px", color: "var(--sy-gray)", fontStyle: "italic", margin: "4px 0" }}>
                      尚未導入受眾畫像。
                    </p>
                  </div>
                </div>
              </section>
              
              <section className="section" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
                <div className="eyebrow">Team</div>
                <h3 style={{ marginTop: "8px" }}>成員指派</h3>
                <div className="stack" style={{ gap: "12px", marginTop: "20px" }}>
                  {assignedMembers.map(m => (
                    <div key={m.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", paddingBottom: "8px", borderBottom: "1px solid var(--sy-line)" }}>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span className="badge" style={{ fontSize: "11px", fontWeight: 700 }}>{m.role}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside className="stack" style={{ gap: "32px" }}>
            <section className="section" style={{ background: "var(--sy-paper)", border: "none", boxShadow: "none", padding: "28px" }}>
              <div className="eyebrow" style={{ color: "var(--sy-deep)" }}>Performance</div>
              <h2 style={{ fontSize: "22px", marginTop: "8px" }}>營收訊號</h2>
              <div className="stack" style={{ gap: "16px", marginTop: "24px" }}>
                {revenueSignals.map((signal) => (
                  <div key={signal.label} className="signal-card">
                    <div className="signal-label">{signal.label}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "8px" }}>
                      <span className="signal-value">{signal.value}</span>
                      <span className={`signal-trend ${signal.type === "positive" ? "positive" : "neutral"}`}>
                        {signal.type === "positive" ? "↑" : "→"} {signal.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="section" style={{ border: "none", boxShadow: "none", padding: "0 8px" }}>
              <div className="eyebrow">Audit Trail</div>
              <h2 style={{ fontSize: "18px", marginTop: "8px" }}>資深成員活動</h2>
              <div className="trace-list" style={{ marginTop: "20px" }}>
                {recentActions.map((action, index) => (
                  <div className="trace-row" key={action.id} style={{ paddingBottom: index === recentActions.length - 1 ? "0" : "24px" }}>
                    <div className="trace-content">
                      <div className="trace-meta">
                        <span className="trace-label" style={{ fontSize: "14px" }}>{action.user}</span>
                        <time className="trace-time">{action.time}</time>
                      </div>
                      <p style={{ fontSize: "14px", color: "var(--sy-ink)", marginBottom: 6, fontWeight: 500 }}>{action.action}</p>
                      <span className="badge" style={{ fontSize: "11px" }}>{action.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

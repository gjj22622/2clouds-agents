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
    <div className="brand-app-shell" style={{ margin: "-32px", padding: "32px", background: "var(--surface)", minHeight: "calc(100vh - 64px)" }}>
      {/* Brand App Sub-header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", borderBottom: "2px solid var(--sy-mist)", paddingBottom: "20px" }}>
        <div>
          <div className="meta-row" style={{ gap: "8px", marginBottom: "8px" }}>
            <Link href="/brands" className="badge" style={{ background: "var(--sy-paper)", cursor: "pointer" }}>← Back to Command Center</Link>
            <span className="badge reviewed">Active Brand App</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "36px" }}>{brandName}</h1>
        </div>
        
        <nav className="nav" style={{ marginBottom: "-21px" }}>
          <span className="active" style={{ padding: "12px 20px", borderBottom: "3px solid var(--primary)", borderRadius: 0 }}>Dashboard</span>
          <span style={{ padding: "12px 20px", color: "var(--text-muted)" }}>Brand Brain</span>
          <span style={{ padding: "12px 20px", color: "var(--text-muted)" }}>Tasks</span>
          <span style={{ padding: "12px 20px", color: "var(--text-muted)" }}>Performance</span>
          <span style={{ padding: "12px 20px", color: "var(--text-muted)" }}>Settings</span>
        </nav>
      </div>

      <div className="page-grid">
        <div className="stack" style={{ gap: "32px" }}>
          {/* Main Content Area */}
          <div className="section" style={{ border: "2px solid var(--sy-mist)", boxShadow: "none" }}>
            <div className="section-header">
              <div>
                <div className="eyebrow">Operational Focus</div>
                <h2>今日任務</h2>
                <p>當前正在進行的品牌交付工作。</p>
              </div>
              <button className="button">建立新任務</button>
            </div>
            <div className="card-list" style={{ marginTop: "20px" }}>
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
              <div className="eyebrow">Knowledge</div>
              <h3 style={{ marginTop: "8px" }}>品牌腦模組</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
                {brandBrain.summary}
              </p>
              <div className="meta-row" style={{ gap: "6px" }}>
                {brandBrain.coverage.map((c) => (
                  <span className="badge" key={c} style={{ fontSize: "10px" }}>{c}</span>
                ))}
              </div>
              <Link href="#" style={{ display: "block", marginTop: "16px", fontSize: "13px", color: "var(--primary)", fontWeight: 700 }}>
                Open full Brand Brain →
              </Link>
            </section>
            
            <section className="section" style={{ boxShadow: "none", border: "1px solid var(--line)" }}>
              <div className="eyebrow">Team</div>
              <h3 style={{ marginTop: "8px" }}>成員指派</h3>
              <div className="stack" style={{ gap: "10px", marginTop: "16px" }}>
                {assignedMembers.map(m => (
                  <div key={m.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                    <span style={{ fontWeight: 600 }}>{m.name}</span>
                    <span className="badge" style={{ fontSize: "11px" }}>{m.role}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="stack" style={{ gap: "24px" }}>
          <section className="section" style={{ background: "var(--sy-paper)", border: "none", boxShadow: "none" }}>
            <div className="eyebrow" style={{ color: "var(--sy-deep)" }}>Revenue Signals</div>
            <h2 style={{ fontSize: "20px", marginTop: "8px" }}>營收訊號</h2>
            <div className="stack" style={{ gap: "12px", marginTop: "20px" }}>
              {revenueSignals.map((signal) => (
                <div key={signal.label} style={{ padding: "16px", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--sy-line)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{signal.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "8px" }}>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--sy-ink)" }}>{signal.value}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: signal.type === "positive" ? "var(--success)" : "var(--sy-gray)" }}>
                      {signal.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section" style={{ border: "none", boxShadow: "none", padding: 0 }}>
            <div className="eyebrow" style={{ padding: "0 4px" }}>Activity Feed</div>
            <h2 style={{ fontSize: "18px", marginTop: "8px", padding: "0 4px" }}>資深成員活動</h2>
            <div className="trace-list" style={{ marginTop: "16px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "20px 20px 0 20px" }}>
              {recentActions.map((action, index) => (
                <div className="trace-row" key={action.id} style={{ paddingBottom: index === recentActions.length - 1 ? "12px" : "24px" }}>
                  <div className="trace-content">
                    <div className="trace-meta">
                      <span className="trace-label" style={{ fontSize: "14px" }}>{action.user}</span>
                      <time className="trace-time">{action.time}</time>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--sy-ink)", marginBottom: 4, fontWeight: 500 }}>{action.action}</p>
                    <span className="badge" style={{ fontSize: "11px", padding: "2px 8px" }}>{action.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

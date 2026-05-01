import { brains, trainingTasks, taskAssignments, reviewerUser } from "@/lib/seed";
import { TaskCard } from "@/components/TaskCard";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Use the existing brand brain from seed
  const brandBrain = brains.find((b) => b.type === "brand")!;

  // Mock signals and recent actions
  const revenueSignals = [
    { label: "本月營收貢獻", value: "$12,400", trend: "+12%", type: "positive" },
    { label: "ROAS (平均)", value: "4.2", trend: "-2%", type: "neutral" },
    { label: "新客成本 (CAC)", value: "$15.5", trend: "-5%", type: "positive" },
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

  // Get some tasks to show as "Today's Tasks"
  const brandTasks = trainingTasks.slice(1, 4);

  return (
    <div className="page-grid">
      <div className="stack">
        <header className="section" style={{ background: "var(--sy-cloud)", border: "none" }}>
          <div className="eyebrow">Brand Workspace</div>
          <h1>{id === "demo-brand" ? "双云行銷 (Demo)" : id}</h1>
          <p style={{ maxWidth: "600px" }}>
            這是該品牌的營運中心。在這裡你可以查閱品牌腦、執行任務，並觀察資深成員的決策痕跡。
          </p>
        </header>

        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Brand Brain</div>
              <h2>品牌腦摘要</h2>
            </div>
          </div>
          <p style={{ marginBottom: "16px", color: "var(--sy-ink)", fontWeight: 500 }}>
            {brandBrain.summary}
          </p>
          <div className="stack" style={{ gap: "12px" }}>
            <div className="decision-block">
              <h3 style={{ fontSize: "14px", color: "var(--sy-gray)", textTransform: "uppercase" }}>覆蓋範圍</h3>
              <div className="meta-row">
                {brandBrain.coverage.map((c) => (
                  <span className="badge" key={c}>{c}</span>
                ))}
              </div>
            </div>
            <div className="decision-block">
              <h3 style={{ fontSize: "14px", color: "var(--sy-gray)", textTransform: "uppercase" }}>維護者</h3>
              <p style={{ fontSize: "14px" }}>{brandBrain.owner}</p>
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section-header">
            <div>
              <div className="eyebrow">Operations</div>
              <h2>今日任務</h2>
              <p>當前需要完成的品牌相關任務。</p>
            </div>
          </header>
          <div className="card-list">
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
        </section>
      </div>

      <aside className="stack">
        <section className="section">
          <div className="eyebrow">Signals</div>
          <h2 style={{ fontSize: "18px" }}>營收貢獻訊號</h2>
          <div className="stack" style={{ gap: "12px", marginTop: "16px" }}>
            {revenueSignals.map((signal) => (
              <div key={signal.label} style={{ padding: "12px", background: "var(--sy-paper)", borderRadius: "var(--radius)" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{signal.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800 }}>{signal.value}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: signal.type === "positive" ? "var(--success)" : "var(--sy-gray)" }}>
                    {signal.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">Recent Activity</div>
          <h2 style={{ fontSize: "18px" }}>資深成員操作</h2>
          <div className="trace-list" style={{ marginTop: "16px" }}>
            {recentActions.map((action, index) => (
              <div className="trace-row" key={action.id} style={{ paddingBottom: index === recentActions.length - 1 ? 0 : "20px" }}>
                <div className="trace-content">
                  <div className="trace-meta">
                    <span className="trace-label" style={{ fontSize: "13px" }}>{action.user}</span>
                    <time className="trace-time">{action.time}</time>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--sy-ink)", marginBottom: 4 }}>{action.action}</p>
                  <span className="badge" style={{ fontSize: "10px", padding: "2px 6px", width: "fit-content" }}>{action.target}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

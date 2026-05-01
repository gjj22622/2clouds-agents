import { notFound } from "next/navigation";
import {
  buildBrandOperatingContext,
  getRevenueSignalsForBrandTask,
} from "@/lib/brands";
import {
  brandBrains,
  brandTasks,
  clientBrands,
  currentUser,
  revenueSignals,
  reviewerUser,
  seniorMemberActivities,
} from "@/lib/seed";

const users = [currentUser, reviewerUser];

const stageLabels = {
  onboarding: "導入中",
  active: "營運中",
  paused: "暫停",
};

const taskStatusLabels = {
  queued: "排程中",
  in_progress: "進行中",
  reviewing: "待審",
  done: "完成",
};

function userName(userId: string) {
  return users.find((user) => user.id === userId)?.name ?? userId;
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let context;
  try {
    context = buildBrandOperatingContext({
      brandId: id,
      brands: clientBrands,
      brandBrains,
      brandTasks,
      revenueSignals,
      seniorMemberActivities,
      users,
    });
  } catch {
    notFound();
  }

  return (
    <div className="page-grid">
      <div className="stack">
        <header className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Brand App · {context.brand.id}</div>
              <h1>{context.brand.name}</h1>
              <p>{context.brand.positioning}</p>
            </div>
            <span className="badge reviewed">
              {stageLabels[context.brand.operatingStage]}
            </span>
          </div>

          <div className="metric-grid">
            <div className="metric">
              <span className="metric-value">{context.assignedMembers.length}</span>
              <span className="metric-label">指派成員</span>
            </div>
            <div className="metric">
              <span className="metric-value">{context.tasks.length}</span>
              <span className="metric-label">日常任務</span>
            </div>
            <div className="metric">
              <span className="metric-value">{context.revenueSignals.length}</span>
              <span className="metric-label">營收訊號</span>
            </div>
          </div>
        </header>

        <section className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">Brand Brain</div>
              <h2>品牌腦模組</h2>
              <p>此區只載入 {context.brand.name} 的品牌腦，不與其他品牌共用。</p>
            </div>
          </div>

          <div className="stack">
            <div className="decision-block">
              <h3>定位與受眾</h3>
              <p>{context.brain.audience}</p>
              <p>{context.brain.offer}</p>
            </div>
            <div className="decision-block">
              <h3>語氣規範</h3>
              <p>{context.brain.voice}</p>
            </div>
            <div className="decision-block">
              <h3>禁忌與升級</h3>
              <div className="meta-row">
                {[...context.brain.taboos, ...context.brain.escalationRules].map(
                  (rule) => (
                    <span className="badge" key={rule}>
                      {rule}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="decision-block">
              <h3>頻道規則</h3>
              <div className="meta-row">
                {context.brain.channelRules.map((rule) => (
                  <span className="badge" key={rule}>
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section-header">
            <div>
              <div className="eyebrow">Daily Tasks</div>
              <h2>日常任務</h2>
              <p>任務、營收訊號與資深成員活動都以 brandId 綁定。</p>
            </div>
          </header>
          <div className="card-list">
            {context.tasks.map((task) => {
              const linkedSignals = getRevenueSignalsForBrandTask({
                task,
                revenueSignals: context.revenueSignals,
              });
              const linkedActivities = context.seniorMemberActivities.filter(
                (activity) => task.seniorMemberActivityIds.includes(activity.id),
              );

              return (
                <article className="task-card" key={task.id}>
                  <div className="section-header" style={{ marginBottom: 0 }}>
                    <div>
                      <div className="eyebrow">Owner · {userName(task.ownerUserId)}</div>
                      <h3>{task.title}</h3>
                    </div>
                    <span className="badge">{taskStatusLabels[task.status]}</span>
                  </div>
                  <p>{task.expectedOutcome}</p>
                  <div className="meta-row">
                    {linkedSignals.map((signal) => (
                      <span className="badge submitted" key={signal.id}>
                        {signal.label}
                      </span>
                    ))}
                    {linkedActivities.map((activity) => (
                      <span className="badge" key={activity.id}>
                        {activity.activityType}: {userName(activity.userId)}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="stack">
        <section className="section">
          <div className="eyebrow">Member Assignment</div>
          <h2>成員指派</h2>
          <div className="card-list">
            {context.assignedMembers.map((member) => (
              <div className="brain-card" key={member.id}>
                <div className="section-header" style={{ marginBottom: 0 }}>
                  <div>
                    <h3>{member.name}</h3>
                    <p>{member.title}</p>
                  </div>
                  <span className="badge">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">Revenue Signals</div>
          <h2>營收訊號</h2>
          <div className="card-list">
            {context.revenueSignals.map((signal) => (
              <div className="brain-card" key={signal.id}>
                <div className="meta-row">
                  <span className="badge submitted">{signal.type}</span>
                  <span className="badge">{signal.confidence}</span>
                </div>
                <h3>{signal.label}</h3>
                <p>{signal.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="eyebrow">Senior Activity</div>
          <h2>資深成員活動</h2>
          <div className="trace-list">
            {context.seniorMemberActivities.map((activity) => (
              <div className="trace-row active" key={activity.id}>
                <div className="trace-content">
                  <div className="trace-meta">
                    <span className="trace-label">{userName(activity.userId)}</span>
                    <time className="trace-time">
                      {new Date(activity.createdAt).toLocaleString("zh-TW", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p>{activity.summary}</p>
                  <span className="badge" style={{ width: "fit-content" }}>
                    {activity.activityType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

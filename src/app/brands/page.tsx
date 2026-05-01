import Link from "next/link";
import { buildBrandOperatingContext } from "@/lib/brands";
import {
  brandBrains,
  brandDataSources,
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

export default function BrandsPage() {
  const contexts = clientBrands.map((brand) =>
    buildBrandOperatingContext({
      brandId: brand.id,
      brands: clientBrands,
      brandBrains,
      brandTasks,
      revenueSignals,
      seniorMemberActivities,
      dataSources: brandDataSources,
      users,
    }),
  );

  return (
    <div className="stack">
      <header className="section">
        <div className="eyebrow">2clouds Command Center</div>
        <h1>品牌目錄</h1>
        <p>
          這裡只呈現跨品牌營運摘要。進入品牌後才載入該品牌自己的品牌腦、任務、資深成員活動與營收訊號。
        </p>
      </header>

      <section className="section">
        <div className="metric-grid">
          <div className="metric">
            <span className="metric-value">{contexts.length}</span>
            <span className="metric-label">品牌工作區</span>
          </div>
          <div className="metric">
            <span className="metric-value">
              {contexts.reduce((sum, context) => sum + context.tasks.length, 0)}
            </span>
            <span className="metric-label">品牌任務</span>
          </div>
          <div className="metric">
            <span className="metric-value">
              {contexts.reduce(
                (sum, context) => sum + context.revenueSignals.length,
                0,
              )}
            </span>
            <span className="metric-label">營收訊號</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <div className="eyebrow">Brand Apps</div>
            <h2>獨立品牌工作區</h2>
            <p>每張品牌卡只顯示該 brandId 的 operating context 摘要。</p>
          </div>
        </div>

        <div
          className="card-list"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
        >
          {contexts.map((context) => (
            <Link
              className="task-card"
              href={`/brands/${context.brand.id}`}
              key={context.brand.id}
            >
              <div className="section-header" style={{ marginBottom: 0 }}>
                <div>
                  <div className="eyebrow">{context.brand.industry}</div>
                  <h3>{context.brand.name}</h3>
                </div>
                <span
                  className={`badge ${
                    context.brand.operatingStage === "active"
                      ? "reviewed"
                      : "in_progress"
                  }`}
                >
                  {stageLabels[context.brand.operatingStage]}
                </span>
              </div>

              <p>{context.brand.primaryGoal}</p>

              <div className="meta-row">
                <span className="badge">{context.assignedMembers.length} 位成員</span>
                <span className="badge">{context.tasks.length} 個任務</span>
                <span className="badge">
                  {context.revenueSignals.length} 個營收訊號
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

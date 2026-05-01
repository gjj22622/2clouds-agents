import Link from "next/link";
import { brains } from "@/lib/seed";

// Mock brands since they are not in the domain yet
const mockBrands = [
  {
    id: "demo-brand",
    name: "双云行銷 (Demo)",
    industry: "Digital Marketing",
    status: "active",
    taskCount: 3,
  },
  {
    id: "brand-client-a",
    name: "客戶 A - 零售電商",
    industry: "E-commerce",
    status: "onboarding",
    taskCount: 5,
  },
];

export default function BrandsPage() {
  return (
    <div className="stack">
      <header className="section">
        <div className="eyebrow">Workspace</div>
        <h1>品牌工作台</h1>
        <p>選擇一個品牌進入專屬工作空間，查看品牌腦、任務與營運狀態。</p>
      </header>

      <div className="card-list" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", display: "grid" }}>
        {mockBrands.map((brand) => (
          <Link className="task-card" href={`/brands/${brand.id}`} key={brand.id}>
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="eyebrow">{brand.industry}</div>
                <h3 style={{ marginBottom: 4 }}>{brand.name}</h3>
              </div>
              <span className={`badge ${brand.status === "active" ? "reviewed" : "in_progress"}`}>
                {brand.status}
              </span>
            </div>
            <div className="meta-row" style={{ marginTop: "auto" }}>
              <span className="badge">
                {brand.taskCount} 進行中任務
              </span>
              <span className="button secondary-button" style={{ minHeight: "32px", padding: "4px 10px", fontSize: "12px", marginLeft: "auto" }}>
                進入空間
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

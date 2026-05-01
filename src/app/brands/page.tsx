import Link from "next/link";
import { brains } from "@/lib/seed";

// Mock brands for Command Center view
const mockBrands = [
  {
    id: "demo-brand",
    name: "双云行銷 (Demo)",
    industry: "Digital Marketing",
    status: "active",
    taskCount: 3,
    members: ["Jacky", "藝嘉"],
    health: "good",
  },
  {
    id: "brand-client-a",
    name: "客戶 A - 零售電商",
    industry: "E-commerce",
    status: "onboarding",
    taskCount: 5,
    members: ["Sophia", "政澔"],
    health: "stable",
  },
];

export default function BrandsPage() {
  const totalTasks = mockBrands.reduce((acc, b) => acc + b.taskCount, 0);

  return (
    <div className="stack" style={{ gap: "40px" }}>
      <header className="section command-center-header">
        <div className="eyebrow">Portfolio Overview</div>
        <h1>2clouds Command Center</h1>
        <p>
          集中管理所有客戶品牌的獨立營運空間。在此監控各品牌交付進度、成員分配與營收訊號。
        </p>
        
        <div className="metric-grid" style={{ marginTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "32px" }}>
          <div className="metric" style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white" }}>
            <span className="metric-label" style={{ color: "var(--sy-mist)" }}>總管理品牌</span>
            <span className="metric-value" style={{ color: "white" }}>{mockBrands.length}</span>
          </div>
          <div className="metric" style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white" }}>
            <span className="metric-label" style={{ color: "var(--sy-mist)" }}>進行中任務</span>
            <span className="metric-value" style={{ color: "white" }}>{totalTasks}</span>
          </div>
          <div className="metric" style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white" }}>
            <span className="metric-label" style={{ color: "var(--sy-mist)" }}>系統健康度</span>
            <span className="metric-value" style={{ color: "var(--sy-teal)" }}>Optimal</span>
          </div>
        </div>
      </header>

      <div className="card-list" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", display: "grid", gap: "32px" }}>
        {mockBrands.map((brand) => (
          <div className="task-card" key={brand.id} style={{ padding: 0, overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--line)" }}>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <div className="brand-badge">{brand.industry}</div>
                  <h2 style={{ fontSize: "20px", margin: "8px 0 0 0", color: "var(--sy-ink)" }}>{brand.name}</h2>
                </div>
                <span className={`badge ${brand.status === "active" ? "reviewed" : "in_progress"}`}>
                  {brand.status}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700 }}>核心成員:</span>
                <div className="meta-row" style={{ gap: "6px" }}>
                  {brand.members.map(m => (
                    <span key={m} className="badge" style={{ fontSize: "11px" }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ padding: "16px 24px", background: "var(--sy-paper)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Tasks</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--sy-deep)" }}>{brand.taskCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Health</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--success)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "currentColor" }}></span>
                    {brand.health}
                  </div>
                </div>
              </div>
              <Link className="button" href={`/brands/${brand.id}`} style={{ minHeight: "38px", padding: "0 16px" }}>
                進入品牌 App
              </Link>
            </div>
          </div>
        ))}
        
        <div className="empty" style={{ borderStyle: "dashed", background: "transparent", minHeight: "200px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "24px" }}>+</div>
          <div style={{ fontWeight: 600 }}>導入新客戶品牌</div>
        </div>
      </div>
    </div>
  );
}

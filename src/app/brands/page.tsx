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
  return (
    <div className="stack" style={{ gap: "32px" }}>
      <header className="section command-center-header">
        <div className="eyebrow">2clouds Command Center</div>
        <h1>品牌目錄管理</h1>
        <p>
          管理所有客戶品牌的獨立營運空間。監控各品牌進度、成員指派與系統健康狀態。
        </p>
      </header>

      <div className="card-list" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", display: "grid", gap: "24px" }}>
        {mockBrands.map((brand) => (
          <div className="task-card" key={brand.id} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--line)" }}>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <div>
                  <div className="eyebrow">{brand.industry}</div>
                  <h2 style={{ fontSize: "18px", margin: 0 }}>{brand.name}</h2>
                </div>
                <span className={`badge ${brand.status === "active" ? "reviewed" : "in_progress"}`}>
                  {brand.status}
                </span>
              </div>
              <div className="meta-row" style={{ gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>核心成員:</span>
                  <div className="meta-row" style={{ gap: "4px" }}>
                    {brand.members.map(m => (
                      <span key={m} className="badge" style={{ fontSize: "10px", padding: "2px 6px" }}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: "16px 20px", background: "var(--sy-paper)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>任務</div>
                  <div style={{ fontSize: "16px", fontWeight: 800 }}>{brand.taskCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>健康度</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--success)" }}>{brand.health}</div>
                </div>
              </div>
              <Link className="button" href={`/brands/${brand.id}`} style={{ minHeight: "36px", fontSize: "13px" }}>
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

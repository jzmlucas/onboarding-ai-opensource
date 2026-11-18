"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, Building2, CircleHelp, LayoutDashboard, MessageCircle, Sparkles } from "lucide-react";

const links = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/onboardings", label: "Onboardings", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <div className="brand-mark">O</div>
        <div className="brand-copy">
          <div className="brand-name">OnboardIA</div>
          <div className="brand-sub">Customer operations</div>
        </div>
      </Link>
      <div className="nav-label">Workspace</div>
      <nav>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} aria-label={label} aria-current={active ? "page" : undefined} className={`nav-link ${active ? "active" : ""}`}>
              <Icon size={17} strokeWidth={1.8} /> <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="nav-label" style={{ marginTop: 24 }}>Inteligência</div>
      <Link href="/copiloto" aria-label="Copiloto IA" aria-current={pathname === "/copiloto" ? "page" : undefined} className={`nav-link ${pathname === "/copiloto" ? "active" : ""}`}><Sparkles size={17} strokeWidth={1.8} /><span>Copiloto IA</span></Link>
      <Link href="/base-de-conhecimento" aria-label="Base de conhecimento" aria-current={pathname === "/base-de-conhecimento" ? "page" : undefined} className={`nav-link ${pathname === "/base-de-conhecimento" ? "active" : ""}`}><BookOpenCheck size={17} strokeWidth={1.8} /><span>Base de conhecimento</span></Link>
      <Link href="/whatsapp" aria-label="Conectar WhatsApp" aria-current={pathname.startsWith("/whatsapp") ? "page" : undefined} className={`nav-link ${pathname.startsWith("/whatsapp") ? "active" : ""}`}><MessageCircle size={17} strokeWidth={1.8} /><span>Conectar WhatsApp</span></Link>
      <div className="sidebar-bottom">
        <button type="button" className="tutorial-launch" onClick={() => window.dispatchEvent(new Event("onboardia:start-tutorial"))}><CircleHelp size={15} /> <span>Ver tutorial</span></button>
        <div className="status-pill"><span className="status-dot" /> Ambiente de demonstração</div>
      </div>
    </aside>
  );
}

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-label">Workspace <span style={{ color: "#c1cdce", padding: "0 6px" }}>/</span> Operações</div>
      <div className="topbar-user"><div className="avatar">OP</div><span>Analista de operações</span></div>
    </header>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

type Step = { route: string; selector: string; title: string; body: string };
const steps: Step[] = [
  { route: "/", selector: '[data-tour="dashboard-create"]', title: "Comece pelo cliente", body: "Cada implantação começa com um onboarding. Use este atalho para cadastrar uma empresa e abrir o processo dela." },
  { route: "/onboardings", selector: '[data-tour="onboardings-create"]', title: "Encontre seus clientes", body: "Aqui ficam os processos cadastrados. Você pode buscar uma empresa ou iniciar um novo onboarding por este botão." },
  { route: "/onboardings/new", selector: '[data-tour="onboarding-form"]', title: "Registre os dados iniciais", body: "Informe ao menos o nome da empresa e salve. Os campos de contato e contexto ajudam a equipe a acompanhar a implantação." },
  { route: "/base-de-conhecimento", selector: '[data-tour="knowledge-destination"]', title: "Adicione documentos", body: "Selecione o onboarding do cliente e envie políticas, planilhas ou outros arquivos. Depois do processamento, o conteúdo é dividido em trechos e indexado para consulta pelo copiloto. Se ainda não cadastrou um cliente, crie um primeiro." },
  { route: "/copiloto", selector: '[data-tour="copilot-destination"]', title: "Converse com o copiloto", body: "Escolha o onboarding para manter a consulta no contexto daquele cliente e pergunte sobre os documentos ou pendências. Confira as fontes e revise as sugestões antes de agir." },
];

type Box = { top: number; left: number; width: number; height: number };

export function TutorialGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  const start = useCallback(() => { setIndex(0); setActive(true); }, []);
  useEffect(() => {
    const onStart = () => start();
    window.addEventListener("onboardia:start-tutorial", onStart);
    return () => window.removeEventListener("onboardia:start-tutorial", onStart);
  }, [start]);

  const step = steps[index];
  useEffect(() => {
    if (!active || !step || pathname !== step.route) { setBox(null); return; }
    let alive = true;
    let hasScrolled = false;
    const locate = () => {
      const element = document.querySelector<HTMLElement>(step.selector);
      if (!element) { if (alive) setBox(null); return; }
      if (!hasScrolled) {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        hasScrolled = true;
      }
      const rect = element.getBoundingClientRect();
      if (alive) setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    };
    locate();
    const timer = window.setInterval(locate, 250);
    window.addEventListener("resize", locate);
    window.addEventListener("scroll", locate, true);
    return () => { alive = false; window.clearInterval(timer); window.removeEventListener("resize", locate); window.removeEventListener("scroll", locate, true); };
  }, [active, index, pathname, step]);

  if (!active || !step) return null;
  const previous = () => {
    if (index === 0) return;
    const nextIndex = index - 1;
    setIndex(nextIndex);
    if (pathname !== steps[nextIndex].route) router.push(steps[nextIndex].route);
  };
  const next = () => {
    if (index === steps.length - 1) { setActive(false); return; }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (pathname !== steps[nextIndex].route) router.push(steps[nextIndex].route);
  };
  const popoverTop = box ? (box.top + box.height / 2 > window.innerHeight - 240 ? Math.max(16, box.top - 190) : Math.min(window.innerHeight - 220, box.top + box.height + 18)) : undefined;
  const popoverLeft = box ? Math.max(16, Math.min(box.left, window.innerWidth - 376)) : undefined;

  return <div className="tutorial-layer" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-description">
    {box && <div className="tutorial-spotlight" aria-hidden="true" style={{ top: box.top - 5, left: box.left - 5, width: box.width + 10, height: box.height + 10 }} />}
    <section className="tutorial-card" style={box ? { top: popoverTop, left: popoverLeft, transform: "none" } : undefined}>
      <div className="tutorial-card-top"><span>Guia do OnboardIA · {index + 1} de {steps.length}</span><button type="button" aria-label="Fechar tutorial" onClick={() => setActive(false)}><X size={17} /></button></div>
      <div className="tutorial-progress" aria-hidden="true"><span style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></div>
      <h2 id="tutorial-title">{step.title}</h2><p id="tutorial-description">{step.body}</p>
      {!box && <p className="tutorial-waiting" role="status">Carregando esta parte do sistema…</p>}
      <div className="tutorial-actions"><button type="button" className="tutorial-skip" onClick={() => setActive(false)}>Sair do guia</button><div>{index > 0 && <button type="button" className="btn btn-secondary" onClick={previous}><ArrowLeft size={14} /> Voltar</button>}<button type="button" className="btn btn-primary" onClick={next}>{index === steps.length - 1 ? "Concluir" : "Próximo"}<ArrowRight size={14} /></button></div></div>
    </section>
  </div>;
}

// ============================================================
// CloakForge — edge function (server-side, nunca chega ao browser)
// ============================================================
const CLOAK_SLUG = "roi-9999-a2c83d";
const CLOAK_KEY  = "edmQm6FSXgToi6XnEAFqrKX_C8ScMIqv"; // SEGREDO — nunca vai ao client

// White page embutida — parece um site real de informações
const WHITE_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portal de Educação Digital — Recursos Gratuitos</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f8f9fa;color:#333}
header{background:#0d47a1;color:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
header h1{font-size:17px;font-weight:600}
nav a{color:#fff;text-decoration:none;margin-left:18px;font-size:14px;opacity:.9}
.hero{background:linear-gradient(135deg,#1565c0,#0d47a1);color:#fff;padding:52px 24px;text-align:center}
.hero h2{font-size:26px;font-weight:700;margin-bottom:10px}
.hero p{font-size:15px;max-width:540px;margin:0 auto;opacity:.9}
.container{max-width:820px;margin:0 auto;padding:32px 16px 48px}
.card{background:#fff;border-radius:10px;padding:24px;margin-bottom:18px;box-shadow:0 1px 6px rgba(0,0,0,.08)}
.card h3{font-size:16px;color:#0d47a1;margin-bottom:8px}
.card p{font-size:14px;line-height:1.7;color:#555}
.tag{display:inline-block;background:#e3f2fd;color:#1565c0;border-radius:20px;padding:3px 12px;font-size:12px;font-weight:600;margin-bottom:10px}
footer{background:#1a1a2e;color:#aaa;text-align:center;padding:18px;font-size:12px}
</style>
</head>
<body>
<header>
  <h1>Portal de Educação Digital</h1>
  <nav><a href="#">Início</a><a href="#">Artigos</a><a href="#">Contato</a></nav>
</header>
<div class="hero">
  <h2>Aprenda e Cresça com Recursos Digitais Gratuitos</h2>
  <p>Conteúdo educacional, ferramentas e guias práticos para o seu desenvolvimento pessoal e profissional.</p>
</div>
<div class="container">
  <div class="card">
    <span class="tag">Produtividade</span>
    <h3>Como Organizar Sua Rotina de Estudos em 2026</h3>
    <p>Técnicas modernas de gestão do tempo ajudam estudantes e profissionais a alcançarem mais resultados em menos horas. Saiba como o método Pomodoro e a revisão espaçada podem transformar seu aprendizado.</p>
  </div>
  <div class="card">
    <span class="tag">Tecnologia</span>
    <h3>Ferramentas Gratuitas para Criar Conteúdo Online</h3>
    <p>Existem dezenas de plataformas gratuitas que permitem criar vídeos, apresentações, infográficos e muito mais. Neste guia, reunimos as melhores opções disponíveis para criadores de conteúdo iniciantes e avançados.</p>
  </div>
  <div class="card">
    <span class="tag">Carreira</span>
    <h3>Habilidades Mais Valorizadas no Mercado Atual</h3>
    <p>Com a digitalização acelerada, habilidades como análise de dados, comunicação digital e pensamento crítico se tornaram essenciais. Entenda quais competências investir para se destacar profissionalmente.</p>
  </div>
  <div class="card">
    <span class="tag">Finanças</span>
    <h3>Educação Financeira: Primeiros Passos para Sair das Dívidas</h3>
    <p>Controlar gastos, criar uma reserva de emergência e entender investimentos básicos são passos fundamentais para a saúde financeira. Este artigo apresenta um plano prático para começar ainda hoje.</p>
  </div>
  <div class="card">
    <span class="tag">Saúde</span>
    <h3>Bem-Estar Digital: Como Cuidar da Saúde Mental no Trabalho Remoto</h3>
    <p>O trabalho em casa trouxe flexibilidade, mas também novos desafios para a saúde mental. Especialistas recomendam pausas regulares, limites de horário e atividades físicas para manter o equilíbrio.</p>
  </div>
</div>
<footer>
  <p>© 2026 Portal de Educação Digital — Todos os direitos reservados</p>
  <p style="margin-top:6px">Política de Privacidade · Termos de Uso · Contato</p>
</footer>
</body>
</html>`;

export default async function handler(request, context) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Deixa passar assets, API routes e arquivos estáticos
  if (
    path.startsWith("/.netlify/") ||
    path.startsWith("/api/") ||
    path.startsWith("/assets/") ||
    path.startsWith("/fonts/") ||
    path.startsWith("/img/") ||
    path.startsWith("/cdn.") ||
    path.endsWith(".js") ||
    path.endsWith(".css") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".ico") ||
    path.endsWith(".woff2") ||
    path.endsWith(".svg") ||
    path.endsWith(".webp") ||
    path.endsWith(".html") && path !== "/"
  ) {
    return context.next();
  }

  // IP real do visitante — nunca mandar o IP do servidor
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("true-client-ip") ||
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("fly-client-ip") ||
    context.ip ||
    "0.0.0.0";

  const ua   = request.headers.get("user-agent")       || "";
  const ref  = request.headers.get("referer")           || "";
  const lang = request.headers.get("accept-language")   || "";

  let action = "block"; // fail-safe: qualquer problema → white

  try {
    const params = new URLSearchParams({
      slug: CLOAK_SLUG,
      key:  CLOAK_KEY,
      ip,
      ua,
      url:  request.url,
      ref,
      lang,
    });

    const resp = await fetch(
      `https://app.cloakforge.app.br/api/cloak/decide?${params}`,
      { signal: AbortSignal.timeout(3000) }
    );

    if (resp.ok) {
      const data = await resp.json();
      action = data.action || "block";
    }
  } catch (_) {
    // timeout ou erro → fail-safe white
    action = "block";
  }

  if (action === "allow") {
    // Visitante legítimo — renderiza a oferta normalmente
    return context.next();
  }

  // Qualquer outro caso → white embutida (mesma URL, sem redirect)
  return new Response(WHITE_HTML, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export const config = { path: "/*" };

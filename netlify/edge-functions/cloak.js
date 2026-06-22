export default async function handler(request, context) {
  const CLOAK_SLUG = "gov2-servidor-a6283a";
  const CLOAK_KEY  = "7C6JNmtyC2G3rrcRmuADhjF1Nhw54XNq";

  // Pega IP real do visitante
  const ip  = request.headers.get("cf-connecting-ip")
            || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || context.ip
            || "0.0.0.0";

  const ua   = request.headers.get("user-agent")  || "";
  const ref  = request.headers.get("referer")      || "";
  const lang = request.headers.get("accept-language") || "";
  const url  = request.url;

  let action = "block";
  let whiteUrl = null;

  try {
    const params = new URLSearchParams({ slug: CLOAK_SLUG, key: CLOAK_KEY, ip, ua, url, ref, lang });
    const resp = await fetch(`https://cloakforge.app.br/api/cloak/decide?${params}`, {
      signal: AbortSignal.timeout(3000),
    });

    if (resp.ok) {
      const data = await resp.json();
      action   = data.action  || "block";
      whiteUrl = data.url     || null;
    }
  } catch (_) {
    // Fail-safe: trata como block
    action = "block";
  }

  if (action === "allow") {
    // Visitante legítimo — continua para a página da oferta
    return context.next();
  }

  // Visitante bloqueado — mostra white page
  if (whiteUrl) {
    try {
      const whiteResp = await fetch(whiteUrl, { signal: AbortSignal.timeout(5000) });
      if (whiteResp.ok) {
        const html = await whiteResp.text();
        return new Response(html, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    } catch (_) {}
  }

  // Fallback: retorna a white page local
  return Response.redirect(new URL("/white", request.url), 302);
}

export const config = {
  path: "/",
};

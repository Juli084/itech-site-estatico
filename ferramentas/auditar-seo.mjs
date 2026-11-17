/**
 * Auditoria de SEO on-page lida do HTML gerado, não do código-fonte:
 * título, descrição, canonical, h1 e metadados de compartilhamento só
 * podem ser conferidos depois da interpolação dos templates.
 *
 * Uso: node ferramentas/auditar-seo.mjs [dist]
 * Sai com código 1 se houver problema que impeça a publicação.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const raiz = process.argv[2] ?? "dist";

const publicas = [
  ["/", "index.html"],
  ["/servicos/desenvolvimento-web/", "servicos/desenvolvimento-web/index.html"],
  ["/servicos/ciberseguranca/", "servicos/ciberseguranca/index.html"],
  ["/servicos/trafego-pago/", "servicos/trafego-pago/index.html"],
  ["/contato/", "contato/index.html"],
  ["/privacidade/", "privacidade/index.html"],
];

const pegar = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};
const todos = (html, re) => [...html.matchAll(re)].map((m) => m[1].trim());

const problemas = [];
const avisos = [];
const vistos = { titulo: new Map(), descricao: new Map() };

console.log("AUDITORIA DE SEO, lida do HTML gerado\n");

for (const [rota, arq] of publicas) {
  const caminho = join(raiz, arq);
  if (!existsSync(caminho)) {
    problemas.push(`${rota}: arquivo ausente`);
    continue;
  }
  const html = readFileSync(caminho, "utf8");

  const titulo = pegar(html, /<title>([^<]*)<\/title>/);
  const descricao = pegar(html, /name="description"\s+content="([^"]*)"/);
  const canonical = pegar(html, /rel="canonical"\s+href="([^"]*)"/);
  const noindex = /name="robots"[^>]*noindex/.test(html);
  const h1s = todos(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g).map((t) =>
    t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  );
  const og = {
    title: pegar(html, /property="og:title"\s+content="([^"]*)"/),
    desc: pegar(html, /property="og:description"\s+content="([^"]*)"/),
    url: pegar(html, /property="og:url"\s+content="([^"]*)"/),
  };

  const niveis = [...html.matchAll(/<h([1-6])[^>]*>/g)].map((m) => +m[1]);
  let saltos = [];
  for (let i = 1; i < niveis.length; i++) {
    if (niveis[i] > niveis[i - 1] + 1) saltos.push(`h${niveis[i - 1]}->h${niveis[i]}`);
  }

  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const semAlt = imgs.filter((t) => !/\balt(=|[\s>])/.test(t));

  console.log(`${rota}${noindex ? "  [noindex]" : ""}`);
  console.log(`   titulo  (${titulo ? titulo.length : 0}) ${titulo ?? "AUSENTE"}`);
  console.log(`   descr.  (${descricao ? descricao.length : 0}) ${descricao ?? "AUSENTE"}`);
  console.log(`   h1      ${h1s.length === 1 ? h1s[0] : h1s.length + " encontrados"}`);
  console.log(`   og      ${og.title && og.desc && og.url ? "completo" : "INCOMPLETO"}`);
  console.log(`   imagens ${imgs.length}, sem atributo alt: ${semAlt.length}`);
  if (saltos.length) console.log(`   SALTO DE NIVEL: ${saltos.join(", ")}`);
  console.log("");

  if (!titulo) problemas.push(`${rota}: sem <title>`);
  if (!descricao) problemas.push(`${rota}: sem description`);
  if (!canonical) problemas.push(`${rota}: sem canonical`);
  if (h1s.length !== 1) problemas.push(`${rota}: ${h1s.length} elementos h1 (esperado 1)`);
  if (semAlt.length) problemas.push(`${rota}: ${semAlt.length} imagem sem atributo alt`);
  if (saltos.length) problemas.push(`${rota}: hierarquia de titulos com salto (${saltos.join(", ")})`);
  if (!og.title || !og.desc || !og.url) problemas.push(`${rota}: Open Graph incompleto`);

  if (titulo) {
    if (vistos.titulo.has(titulo)) problemas.push(`titulo duplicado: ${rota} e ${vistos.titulo.get(titulo)}`);
    else vistos.titulo.set(titulo, rota);
  }
  if (descricao) {
    if (vistos.descricao.has(descricao)) problemas.push(`descricao duplicada: ${rota} e ${vistos.descricao.get(descricao)}`);
    else vistos.descricao.set(descricao, rota);
  }

  if (titulo && titulo.length > 62) avisos.push(`${rota}: titulo com ${titulo.length} caracteres, pode ser cortado`);
  if (descricao && (descricao.length < 70 || descricao.length > 165)) {
    avisos.push(`${rota}: descricao com ${descricao.length} caracteres, fora da faixa usual de 70 a 165`);
  }
}

for (const [rota, arq] of publicas) {
  const caminho = join(raiz, arq);
  if (!existsSync(caminho)) continue;
  const html = readFileSync(caminho, "utf8");
  if (/localhost|127\.0\.0\.1/.test(html)) problemas.push(`${rota}: referencia a ambiente local`);
  if (/C:\\\\Users|C:\/Users/.test(html)) problemas.push(`${rota}: caminho local absoluto`);
}

console.log("".padEnd(60, "-"));
console.log(`PROBLEMAS: ${problemas.length}`);
for (const p of problemas) console.log(`  ${p}`);
console.log(`avisos de comprimento: ${avisos.length}`);
for (const a of avisos) console.log(`  ${a}`);

process.exit(problemas.length > 0 ? 1 : 0);

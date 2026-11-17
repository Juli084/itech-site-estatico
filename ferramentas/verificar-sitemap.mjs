/**
 * Cruza o sitemap com as marcas noindex do HTML gerado. Acusa página
 * pública fora do sitemap e página noindex dentro dele: o filtro em
 * astro.config.mjs e o noindex de cada página são duas fontes da mesma
 * informação e podem divergir.
 *
 * Uso: node ferramentas/verificar-sitemap.mjs [dist]
 * Sai com código 1 se houver divergência.
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const raiz = process.argv[2] ?? "dist";

function rotas(dir, base = "") {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      saida.push(...rotas(caminho, `${base}/${nome}`));
    } else if (nome === "index.html") {
      saida.push({ rota: `${base}/` || "/", arquivo: caminho });
    }
  }
  return saida;
}

function pedeNoindex(arquivo) {
  const html = readFileSync(arquivo, "utf8");
  const m = html.match(
    /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i
  );
  return m ? /noindex/i.test(m[1]) : false;
}

const indices = readdirSync(raiz).filter(
  (n) => /^sitemap.*\.xml$/.test(n) && n !== "sitemap-index.xml"
);
if (indices.length === 0) {
  console.error("ERRO: nenhum sitemap-*.xml em " + raiz);
  process.exit(1);
}

const noSitemap = new Set();
for (const nome of indices) {
  const xml = readFileSync(join(raiz, nome), "utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    noSitemap.add(new URL(m[1]).pathname);
  }
}

const todas = rotas(raiz);
const contradicoes = [];
const ausentes = [];

for (const { rota, arquivo } of todas) {
  const noindex = pedeNoindex(arquivo);
  const listada = noSitemap.has(rota);

  if (listada && noindex) {
    contradicoes.push(rota);
  }
  if (!listada && !noindex) {
    ausentes.push(rota);
  }
}

const rotasExistentes = new Set(todas.map((t) => t.rota));
const fantasmas = [...noSitemap].filter((r) => !rotasExistentes.has(r));

console.log(`paginas no build .......... ${todas.length}`);
console.log(`rotas no sitemap .......... ${noSitemap.size}`);
console.log("");
console.log(`NOINDEX DENTRO DO SITEMAP . ${contradicoes.length}`);
for (const r of contradicoes) console.log(`  ${r}`);
console.log(`INDEXAVEL FORA DO SITEMAP . ${ausentes.length}`);
for (const r of ausentes) console.log(`  ${r}`);
console.log(`NO SITEMAP MAS SEM ARQUIVO  ${fantasmas.length}`);
for (const r of fantasmas) console.log(`  ${r}`);

const total = contradicoes.length + ausentes.length + fantasmas.length;
console.log("");
console.log(total === 0 ? "SITEMAP COERENTE" : `PROBLEMAS: ${total}`);
process.exit(total > 0 ? 1 : 0);

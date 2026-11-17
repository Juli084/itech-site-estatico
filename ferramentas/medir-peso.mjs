/**
 * Peso por página calculado a partir de dist/, não do navegador (cache e
 * srcset tornam a medição no navegador instável). Assume a maior variante
 * de cada srcset, então o resultado é um teto: o navegador quase sempre
 * baixa menos. O orçamento do projeto é de 600 KB por página.
 *
 * Uso: node ferramentas/medir-peso.mjs [dist]
 */
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const raiz = process.argv[2] ?? "dist";

const paginas = [
  ["/", "index.html"],
  ["/servicos/desenvolvimento-web/", "servicos/desenvolvimento-web/index.html"],
  ["/servicos/ciberseguranca/", "servicos/ciberseguranca/index.html"],
  ["/servicos/trafego-pago/", "servicos/trafego-pago/index.html"],
  ["/contato/", "contato/index.html"],
  ["/privacidade/", "privacidade/index.html"],
];

const tam = (rel) => {
  const p = join(raiz, rel.replace(/^\//, ""));
  return existsSync(p) ? statSync(p).size : 0;
};
const kb = (n) => Math.round((n / 1024) * 10) / 10;

console.log("Limite superior por pagina. Imagem: maior variante do srcset.");
console.log("HTML e CSS contam GZIP, que e como o Apache entrega.");
console.log("Fonte e imagem ja sao comprimidas; gzip nao as reduz.\n");

let pior = 0;
for (const [rota, arq] of paginas) {
  const caminho = join(raiz, arq);
  if (!existsSync(caminho)) {
    console.log(`${rota} -> NAO EXISTE`);
    continue;
  }
  const html = readFileSync(caminho);
  const htmlGz = gzipSync(html).length;

  let css = 0;
  const cssVistos = new Set();
  for (const m of html.toString().matchAll(/href="(\/_astro\/[^"]+\.css)"/g)) {
    if (cssVistos.has(m[1])) continue;
    cssVistos.add(m[1]);
    const p = join(raiz, m[1].replace(/^\//, ""));
    if (existsSync(p)) css += gzipSync(readFileSync(p)).length;
  }

  let fonte = 0;
  const fontesVistas = new Set();
  for (const m of html.toString().matchAll(/\/fonts\/([a-z-]+\.woff2)/g)) {
    if (fontesVistas.has(m[1])) continue;
    fontesVistas.add(m[1]);
    fonte += tam(`fonts/${m[1]}`);
  }
  if (!fontesVistas.has("instrument-sans.woff2")) {
    fonte += tam("fonts/instrument-sans.woff2");
    fontesVistas.add("instrument-sans.woff2");
  }

  let imagem = 0;
  const srcsets = [...html.toString().matchAll(/srcset="([^"]+)"/g)];
  const avulsas = [...html.toString().matchAll(/url\((\/_astro\/[^)]+)\)/g)];
  const candidatasPorGrupo = new Map();
  for (const s of srcsets) {
    const urls = s[1].split(",").map((x) => x.trim().split(/\s+/)[0]).filter(Boolean);
    const base = urls[0]?.split("/").pop()?.split(".")[0] ?? String(candidatasPorGrupo.size);
    const maior = Math.max(...urls.map((u) => tam(u)), 0);
    candidatasPorGrupo.set(base, Math.max(candidatasPorGrupo.get(base) ?? 0, maior));
  }
  for (const [, v] of candidatasPorGrupo) imagem += v;
  for (const a of avulsas) imagem += tam(a[1]);

  const total = htmlGz + css + fonte + imagem;
  pior = Math.max(pior, total);
  console.log(
    `${rota.padEnd(34)} html ${String(kb(htmlGz)).padStart(5)}  css ${String(kb(css)).padStart(5)}` +
      `  fonte ${String(kb(fonte)).padStart(6)}  imagem ${String(kb(imagem)).padStart(6)}` +
      `  TOTAL ${String(kb(total)).padStart(6)} KB`
  );
}

console.log("");
console.log(`pior pagina: ${kb(pior)} KB  |  orcamento: 600 KB  |  ${kb(pior) <= 600 ? "DENTRO" : "ESTOUROU"}`);
process.exit(kb(pior) <= 600 ? 0 : 1);

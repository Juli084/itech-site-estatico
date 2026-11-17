/**
 * Monta o pacote de publicação a partir de uma lista de permissão das
 * páginas públicas. noindex e robots.txt são pedidos a robôs, não
 * controle de acesso: a única garantia de que um arquivo não está no ar
 * é não enviá-lo. Os ativos de /_astro/ e /fonts/ entram apenas se forem
 * referenciados pelas páginas permitidas.
 *
 * Uso: node ferramentas/preparar-publicacao.mjs [dist] [saida]
 */
import {
  readdirSync, statSync, readFileSync, existsSync,
  mkdirSync, copyFileSync, rmSync,
} from "node:fs";
import { join, dirname } from "node:path";

const origem = process.argv[2] ?? "dist";
const saida = process.argv[3] ?? "publicacao";

const PAGINAS = [
  "index.html",
  "servicos/desenvolvimento-web/index.html",
  "servicos/ciberseguranca/index.html",
  "servicos/trafego-pago/index.html",
  "contato/index.html",
  "contato/obrigado/index.html",
  "contato/revisar/index.html",
  "contato/aguarde/index.html",
  "contato/indisponivel/index.html",
  "privacidade/index.html",
  "404.html",
];

const RAIZ = [
  "robots.txt",
  "sitemap-index.xml",
  "sitemap-0.xml",
  "favicon.ico",
  "favicon-32.png",
  "favicon-48.png",
  "favicon-192.png",
  ".htaccess",
  "compartilhar.jpg",
];

const DIRETORIOS = ["api"];

// Páginas de revisão que existem só no repositório de trabalho. Se aparecerem
// no pacote, a publicação é interrompida.
const PROIBIDOS = ["etapa-2/", "etapa-3/"];

const copiar = (rel) => {
  const de = join(origem, rel);
  const para = join(saida, rel);
  if (!existsSync(de)) return false;
  mkdirSync(dirname(para), { recursive: true });
  copyFileSync(de, para);
  return true;
};

const copiarDir = (rel) => {
  const de = join(origem, rel);
  if (!existsSync(de)) return 0;
  let n = 0;
  for (const nome of readdirSync(de)) {
    const filho = join(rel, nome);
    if (statSync(join(origem, filho)).isDirectory()) n += copiarDir(filho);
    else if (copiar(filho)) n++;
  }
  return n;
};

if (existsSync(saida)) rmSync(saida, { recursive: true, force: true });
mkdirSync(saida, { recursive: true });

const ausentes = [];
let nPaginas = 0;
for (const p of PAGINAS) {
  if (copiar(p)) nPaginas++;
  else ausentes.push(p);
}

const ativos = new Set();
for (const p of PAGINAS) {
  const caminho = join(origem, p);
  if (!existsSync(caminho)) continue;
  const html = readFileSync(caminho, "utf8");
  for (const m of html.matchAll(/(?:href|src|srcset|content)="([^"]+)"/g)) {
    for (const parte of m[1].split(",")) {
      const url = parte.trim().split(/\s+/)[0];
      if (/^\/(_astro|fonts)\//.test(url)) ativos.add(url.slice(1));
    }
  }
  for (const m of html.matchAll(/url\((\/(?:_astro|fonts)\/[^)"']+)\)/g)) {
    ativos.add(m[1].slice(1));
  }
}
for (const a of [...ativos]) {
  if (!a.endsWith(".css")) continue;
  const css = readFileSync(join(origem, a), "utf8");
  for (const m of css.matchAll(/url\(["']?(\/(?:_astro|fonts)\/[^)"']+)["']?\)/g)) {
    ativos.add(m[1].slice(1));
  }
}

let nAtivos = 0;
const ativosAusentes = [];
for (const a of ativos) {
  if (copiar(a)) nAtivos++;
  else ativosAusentes.push(a);
}

let nRaiz = 0;
for (const r of RAIZ) if (copiar(r)) nRaiz++;
let nDir = 0;
for (const d of DIRETORIOS) nDir += copiarDir(d);

const todos = [];
const varrer = (dir, base = "") => {
  for (const nome of readdirSync(dir)) {
    const f = join(dir, nome);
    const rel = base ? `${base}/${nome}` : nome;
    if (statSync(f).isDirectory()) varrer(f, rel);
    else todos.push(rel);
  }
};
varrer(saida);

const vazados = todos.filter((f) => PROIBIDOS.some((p) => f.replace(/\\/g, "/").includes(p)));
const bytes = todos.reduce((s, f) => s + statSync(join(saida, f)).size, 0);

console.log(`origem ............ ${origem}`);
console.log(`pacote ............ ${saida}`);
console.log("");
console.log(`paginas ........... ${nPaginas} de ${PAGINAS.length}`);
console.log(`ativos ............ ${nAtivos} (so os referenciados)`);
console.log(`raiz .............. ${nRaiz} de ${RAIZ.length}`);
console.log(`api ............... ${nDir}`);
console.log(`TOTAL ............. ${todos.length} arquivos, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
console.log("");

const contarDist = (dir) => {
  let n = 0;
  for (const nome of readdirSync(dir)) {
    const f = join(dir, nome);
    if (statSync(f).isDirectory()) n += contarDist(f);
    else n++;
  }
  return n;
};
const totalDist = contarDist(origem);
console.log(`no dist ........... ${totalDist} arquivos`);
console.log(`deixados de fora .. ${totalDist - todos.length}`);
console.log("");

let problemas = 0;
if (ausentes.length) {
  problemas += ausentes.length;
  console.log(`PAGINA DA LISTA SEM ARQUIVO: ${ausentes.length}`);
  for (const a of ausentes) console.log(`  ${a}`);
}
if (ativosAusentes.length) {
  problemas += ativosAusentes.length;
  console.log(`ATIVO REFERENCIADO E AUSENTE: ${ativosAusentes.length}`);
  for (const a of ativosAusentes) console.log(`  ${a}`);
}
if (vazados.length) {
  problemas += vazados.length;
  console.log(`MATERIAL DE TRABALHO VAZOU PARA O PACOTE: ${vazados.length}`);
  for (const v of vazados) console.log(`  ${v}`);
}

console.log(problemas === 0 ? "PACOTE COERENTE" : `PROBLEMAS: ${problemas}`);
console.log("");
console.log("Este comando NAO publica nada. Ele so monta a pasta.");
process.exit(problemas > 0 ? 1 : 0);

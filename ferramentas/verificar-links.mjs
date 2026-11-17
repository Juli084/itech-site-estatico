/**
 * Confere se todo link interno do HTML gerado aponta para um arquivo que
 * existe em dist/. Build e TypeScript não pegam link quebrado: um texto
 * plausível apontando para lugar nenhum não é erro de sintaxe nem de tipo.
 *
 * Uso: node ferramentas/verificar-links.mjs [dist]
 * Sai com código 1 se encontrar link quebrado.
 */
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join, posix } from "node:path";

const raiz = process.argv[2] ?? "dist";

function paginas(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...paginas(caminho));
    else if (nome.endsWith(".html")) saida.push(caminho);
  }
  return saida;
}

function existeDestino(rota) {
  const limpo = rota.split("#")[0].split("?")[0];
  if (limpo === "" || limpo === "/") return existsSync(join(raiz, "index.html"));
  const comoArquivo = join(raiz, limpo);
  if (existsSync(comoArquivo) && statSync(comoArquivo).isFile()) return true;
  return existsSync(join(raiz, limpo, "index.html"));
}

const arquivos = paginas(raiz);
const quebrados = [];
const semBarra = [];
let total = 0;

for (const arq of arquivos) {
  const html = readFileSync(arq, "utf8");
  const origem = "/" + posix.join(...arq.split(/[\\/]/).slice(1)).replace(/index\.html$/, "");
  for (const m of html.matchAll(/(?:href|action)="([^"]+)"/g)) {
    const alvo = m[1];
    if (!alvo.startsWith("/")) continue;
    if (alvo.startsWith("//")) continue;
    total++;

    const limpo = alvo.split("#")[0].split("?")[0];
    if (!existeDestino(alvo)) {
      quebrados.push({ origem, alvo });
      continue;
    }
    const ehArquivo = /\.[a-z0-9]{2,5}$/i.test(limpo);
    if (!ehArquivo && limpo !== "/" && !limpo.endsWith("/")) {
      semBarra.push({ origem, alvo });
    }
  }
}

console.log(`paginas analisadas: ${arquivos.length}`);
console.log(`links internos: ${total}`);
console.log(`QUEBRADOS: ${quebrados.length}`);
for (const q of quebrados) console.log(`  ${q.origem}  ->  ${q.alvo}`);
console.log(`sem barra final: ${semBarra.length}`);
for (const s of semBarra) console.log(`  ${s.origem}  ->  ${s.alvo}`);

process.exit(quebrados.length > 0 ? 1 : 0);

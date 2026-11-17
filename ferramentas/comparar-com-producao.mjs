/**
 * Compara o pacote local com o que está publicado, por SHA-256, e lista o
 * que precisa ser enviado. Os nomes em /_astro/ têm hash do conteúdo:
 * enviar o HTML novo sem o CSS novo deixa a página sem estilo.
 * Só faz requisições GET às URLs públicas do site.
 *
 *   pnpm run build
 *   node ferramentas/preparar-publicacao.mjs
 *   node ferramentas/comparar-com-producao.mjs [https://dominio]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";

const PACOTE = "publicacao";
const SITE = process.argv[2] ?? "https://itechsolucoesdigitais.com";

const NAO_VERIFICAVEL = {
  ".htaccess": "negado por HTTP pela propria regra que ele define",
  "api/.htaccess": "idem",
  "api/contato.php": "endpoint POST. GET responde 405, que e o correto",
};

const resumo = (b) => createHash("sha256").update(b).digest("hex");

const locais = [];
(function anda(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) anda(p);
    else locais.push(p);
  }
})(PACOTE);

const caminhoWeb = (f) => relative(PACOTE, f).split("\\").join("/");

const urlDe = (rel) =>
  SITE + "/" + rel.replace(/(^|\/)index\.html$/, (_, b) => b || "");

const emLotes = async (itens, n, fn) => {
  const saida = [];
  for (let i = 0; i < itens.length; i += n) {
    saida.push(...(await Promise.all(itens.slice(i, i + n).map(fn))));
  }
  return saida;
};

console.log("comparando " + locais.length + " arquivos com " + SITE);
console.log("");

const resultados = await emLotes(locais, 6, async (f) => {
  const rel = caminhoWeb(f);
  if (rel in NAO_VERIFICAVEL) return { rel, estado: "oculto" };

  const local = readFileSync(f);
  try {
    const r = await fetch(urlDe(rel), {
      redirect: "follow",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    if (!r.ok) return { rel, estado: r.status === 404 ? "ausente" : "erro", codigo: r.status };
    const remoto = Buffer.from(await r.arrayBuffer());
    return {
      rel,
      estado: resumo(local) === resumo(remoto) ? "igual" : "diferente",
      bytesLocal: local.length,
      bytesRemoto: remoto.length,
    };
  } catch (e) {
    return { rel, estado: "erro", detalhe: e.message };
  }
});

const por = (e) => resultados.filter((r) => r.estado === e);

const diferentes = por("diferente");
const ausentes = por("ausente");
const erros = por("erro");
const ocultos = por("oculto");

console.log("  iguais ............ " + por("igual").length);
console.log("  DIFERENTES ........ " + diferentes.length);
console.log("  AUSENTES no ar .... " + ausentes.length);
console.log("  nao verificaveis .. " + ocultos.length + "  (negados por HTTP de proposito)");
if (erros.length) console.log("  erros ............. " + erros.length);

const enviar = [...diferentes, ...ausentes].map((r) => r.rel).sort();

if (enviar.length) {
  console.log("");
  console.log("PRECISA ENVIAR:");
  for (const r of [...diferentes].sort((a, b) => a.rel.localeCompare(b.rel))) {
    console.log("  alterado  " + r.rel + "  (" + r.bytesLocal + " contra " + r.bytesRemoto + " bytes)");
  }
  for (const r of [...ausentes].sort((a, b) => a.rel.localeCompare(b.rel))) {
    console.log("  novo      " + r.rel);
  }
}

if (erros.length) {
  console.log("");
  console.log("NAO FOI POSSIVEL CONFERIR:");
  erros.forEach((r) => console.log("  " + r.rel + "  " + (r.codigo ?? r.detalhe)));
}

const lista = "_alterados.txt";
writeFileSync(lista, enviar.join("\n") + (enviar.length ? "\n" : ""));

console.log("");
if (!enviar.length) {
  console.log("NADA A ENVIAR. O que esta no ar e igual ao pacote local.");
} else {
  console.log("lista gravada em " + lista);
  console.log("");
  console.log("para montar o pacote so com estes arquivos:");
  console.log("  powershell -File ferramentas/montar-zip-publicacao.ps1 -Origem publicacao \\");
  console.log("    -Destino site.zip -Lista " + lista);
}

console.log("");
console.log("FORA DESTA CONFERENCIA, de proposito:");
for (const [arq, porque] of Object.entries(NAO_VERIFICAVEL)) {
  console.log("  " + arq.padEnd(20) + porque);
}
console.log("Conferir esses tres e manual, pelo gerenciador de arquivos.");

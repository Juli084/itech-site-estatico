/**
 * Bateria funcional do endpoint de contato (public/api/contato.php).
 *
 * 1. Suba o PHP servindo public/ com a configuração de teste, que usa um
 *    dublê do PHPMailer gravando em arquivo em vez de enviar:
 *
 *      ITECH_CONFIG=ferramentas/teste/contato.config.php \
 *        php -S 127.0.0.1:8099 -t public
 *
 * 2. node ferramentas/testar-endpoint.mjs [url]
 *
 * Sai com código 1 se algum caso falhar.
 */
const base = process.argv[2] ?? "http://127.0.0.1:8099/api/contato.php";
const origem = new URL(base).origin;

let passou = 0;
let falhou = 0;

const enviar = async (campos, extra = {}) => {
  const corpo = new URLSearchParams(campos).toString();
  const r = await fetch(base, {
    method: extra.metodo ?? "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Origin: extra.origem ?? origem,
      ...(extra.cabecalhos ?? {}),
    },
    body: extra.metodo === "GET" ? undefined : (extra.corpoCru ?? corpo),
    redirect: "manual",
  });
  let json = null;
  try { json = JSON.parse(await r.text()); } catch {  }
  return { status: r.status, json };
};

const caso = (nome, condicao, visto) => {
  if (condicao) { passou++; console.log(`  PASSA  ${nome}`); }
  else { falhou++; console.log(`  FALHA  ${nome}  -> visto: ${JSON.stringify(visto)}`); }
};

const valido = (n = 1) => ({
  nome: `Cliente ${n}`,
  email: `cliente${n}@exemplo.com.br`,
  telefone: "15 99999-0000",
  servico: "desenvolvimento-web",
  mensagem: `Mensagem numero ${n}, com tamanho suficiente para passar na validacao.`,
});

console.log(`Endpoint: ${base}\n`);

const vistos = [];
for (let i = 1; i <= 6; i++) vistos.push((await enviar(valido(i))).status);
caso(
  "limite de 5 por janela: 5 passam e o 6o da 429",
  vistos.slice(0, 5).every((s) => s === 200 || s === 503) && vistos[5] === 429,
  vistos
);
console.log("  (contadores agora saturados; o que segue nao depende deles)\n");

let r = await enviar({}, { metodo: "GET" });
caso("GET e recusado com 405", r.status === 405, r);

r = await enviar({});
caso("POST vazio -> 422 e lista os campos", r.status === 422 && Array.isArray(r.json?.campos), r);

r = await enviar({ ...valido(), email: "nao-e-email" });
caso("e-mail invalido -> 422 apontando 'email'", r.status === 422 && r.json?.campos?.includes("email"), r);

r = await enviar({ ...valido(), mensagem: "oi" });
caso("mensagem curta -> 422 apontando 'mensagem'", r.status === 422 && r.json?.campos?.includes("mensagem"), r);

r = await enviar({ ...valido(), empresa_site: "http://spam.example" });
caso("armadilha preenchida -> recusado", r.status === 422, r);

r = await enviar({ ...valido(), nome: "Joao\r\nBcc: vitima@exemplo.com" });
caso("injecao de cabecalho no nome -> recusado", r.status === 422, r);

r = await enviar(valido(), { origem: "https://site-malicioso.example" });
caso("origem fora da lista -> 403", r.status === 403, r);

r = await enviar({}, { corpoCru: "mensagem=" + "a".repeat(70000) });
caso("corpo acima de 64 KB -> 413", r.status === 413, r);

console.log(`\npassaram: ${passou}   falharam: ${falhou}`);
process.exit(falhou > 0 ? 1 : 0);

# Site da iTech Soluções Digitais

Site institucional da iTech Soluções Digitais, de Sorocaba (SP), que atende em desenvolvimento web,
cibersegurança e tráfego pago. Está no ar em **[itechsolucoesdigitais.com](https://itechsolucoesdigitais.com)**
desde outubro de 2026.

Este repositório é uma cópia pública do repositório de trabalho, que é privado, no estado publicado
em 3 de novembro de 2026. O código é o que está em produção, com estas diferenças:

- os comentários foram reescritos (os originais registravam discussões internas);
- as fotos foram trocadas por marcadores do mesmo tamanho (ver [Imagens](#imagens));
- duas correções que não mudam o HTML gerado: um erro de tipo encontrado pelo `astro check` e o
  escape de `<` no JSON-LD, para que um texto com `</script>` não possa fechar o bloco.

Conferi a equivalência página por página: as 11 páginas geradas aqui têm o mesmo HTML e as mesmas
regras de CSS que o servidor entrega hoje. Mudam apenas os nomes dos arquivos de imagem e a forma
como o CSS é dividido em arquivos.

## O problema

- A empresa já tinha hospedagem compartilhada com Apache e PHP e não queria um servidor Node nem
  um serviço pago novo.
- O site anterior, em Next.js, confirmava o envio do formulário de contato sem garantir que a
  mensagem tinha saído. Para uma empresa pequena, um contato perdido em silêncio é o pior defeito
  possível.
- O site precisava ser leve, acessível e encontrável em busca, com uma página de privacidade que
  dissesse a verdade sobre o que acontece com os dados do formulário.

## Como resolvi

| Decisão | Motivo |
|---|---|
| Astro com saída estática | O HTML fica pronto no build. No servidor não há processo para manter, atualizar ou atacar |
| Nenhum JavaScript no navegador | O formulário envia por POST nativo do HTML. Isso permite uma CSP com `script-src 'self'` sem `'unsafe-inline'` |
| Um único endpoint PHP para o contato | É a única parte dinâmica. O PHP já existia na hospedagem |
| Configuração e biblioteca de e-mail fora da raiz web | Nada que contenha credencial pode ser pedido por URL |
| Publicação por lista de permissão | `noindex` e `robots.txt` são pedidos a robôs, não controle de acesso. O que não deve estar no ar simplesmente não é enviado |
| HSTS adiado | Um erro no HSTS deixa o site inacessível para quem já visitou, e não há como desfazer pelo servidor. Entra com prazo curto depois de o HTTPS ficar estável |

Os detalhes estão em [docs/arquitetura.md](docs/arquitetura.md) e [docs/seguranca.md](docs/seguranca.md).

## O formulário de contato

O endpoint [`public/api/contato.php`](public/api/contato.php) recebe o POST, valida e envia pelo
PHPMailer via SMTP autenticado. As defesas, em ordem:

1. aceita só `POST` com `application/x-www-form-urlencoded` ou `application/json`, até 64 KB;
2. confere `Origin` contra uma lista fechada, quando o cabeçalho existe;
3. limita a 5 envios por origem a cada 15 minutos, identificando a origem por HMAC do IP (o IP
   nunca é gravado em texto claro);
4. recusa o envio se o campo oculto vier preenchido;
5. exige UTF-8 válido, normaliza (NFC) e só então valida;
6. recusa caracteres de controle nos campos que chegam a cabeçalho de e-mail, inclusive U+2028 e
   U+0085, e revalida depois da normalização;
7. monta o assunto a partir de uma lista fechada e coloca o e-mail do visitante em Reply-To pela
   API do PHPMailer, nunca concatenado em cabeçalho;
8. evita e-mail duplicado em clique duplo, e remove essa marca quando o envio falha, para que a
   segunda tentativa não receba um "obrigado" falso;
9. só responde sucesso depois de o servidor SMTP aceitar a mensagem.

Nenhuma resposta revela detalhe técnico, e o registro da aplicação guarda só o tipo de evento,
nunca nome, e-mail, telefone ou mensagem.

## Como verifico

| Comando | O que confere | Resultado nesta versão |
|---|---|---|
| `pnpm run check` | `astro check`, incluindo os arquivos `.astro` | 0 erros, 0 avisos |
| `pnpm run typecheck` | TypeScript estrito | sem erros |
| `pnpm run build` | gera o site em `dist/` | 11 páginas |
| `pnpm run verificar` | links internos, sitemap contra `noindex`, SEO on-page e peso por página | sem problemas |
| `pnpm run publicacao` | monta o pacote só com o que é público | 49 arquivos, 11 de 11 páginas |
| `ferramentas/testar-endpoint.mjs` | bateria do endpoint em PHP 8.3 | 9 de 9 casos |

O peso da página mais pesada do site real, com as fotos, é de no máximo 197 KB (a ferramenta assume a
maior variante de cada `srcset`), para um orçamento de 600 KB.

A integração contínua ([.github/workflows/verificar.yml](.github/workflows/verificar.yml)) roda
tudo isso a cada push, sobe o endpoint com um dublê do PHPMailer para executar a bateria e procura
segredos com o gitleaks.

## Rodando localmente

Requer Node 22.23.4 ou superior (exigência do Astro 7.4) e pnpm.

```bash
pnpm install
pnpm run dev
```

Para o endpoint, com Docker:

```bash
docker run --rm -p 8099:8099 -v "$PWD:/app" -w /app \
  -e ITECH_CONFIG=/app/ferramentas/teste/contato.config.php \
  php:8.3-cli php -S 0.0.0.0:8099 -t public
```

```bash
node ferramentas/testar-endpoint.mjs http://127.0.0.1:8099/api/contato.php
```

## Estrutura

```
src/
  pages/        home, três páginas de serviço, contato e seus retornos, privacidade, 404
  components/   cabeçalho, rodapé, aberturas de página, lista de escopo
  content/      textos tipados das páginas (itech.ts, servicos.ts)
  styles/       tokens de cor e tipografia, base e composição
public/
  .htaccess     cabeçalhos de segurança, regras de acesso, cache e forma canônica
  api/          endpoint de contato e sua exceção no .htaccess
config/         exemplo de configuração e carregador do PHPMailer (vão para fora da raiz web)
ferramentas/    verificações do build, bateria do endpoint e empacotamento da publicação
docs/           arquitetura, segurança e publicação
```

## Imagens

As fotos do site publicado vêm do Canva da empresa, e a licença não permite redistribuir os
arquivos. Aqui o build usa marcadores com as mesmas dimensões, gerados para este repositório. O
resultado visual real está no site.

## Limitações conhecidas

- HSTS ainda não está ativo.
- `style-src` precisa de `'unsafe-inline'`, porque duas páginas passam a URL da foto de topo por
  atributo `style`. O motivo e o risco estão em [docs/seguranca.md](docs/seguranca.md).
- A bateria do endpoint não cobre a falha de SMTP. Esse caminho foi conferido à mão com o dublê
  (`ITECH_DUBLE_FALHA=1`): as duas tentativas respondem 503.
- O contraste de cores é auditado no navegador (`ferramentas/auditar-contraste.js`), sem teste
  automatizado.

## Licença

O código está publicado para consulta e continua com todos os direitos reservados à iTech Soluções
Digitais. As fontes em `public/fonts/` são distribuídas sob a SIL Open Font License 1.1, com as
licenças em `public/fonts/licencas/`.

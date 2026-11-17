# Arquitetura

## Visão geral

```
navegador ──GET──> Apache (hospedagem compartilhada)
                     ├─ HTML, CSS, fontes e imagens gerados pelo Astro (estáticos)
                     └─ POST /api/contato.php ──> PHPMailer ──SMTP autenticado──> caixa da empresa
                              │
                              └─ lê a configuração em ~/itech-config/ (fora da raiz web)
```

Não há banco de dados, processo Node em produção nem JavaScript no navegador. A única parte que
executa código no servidor é o endpoint de contato.

## Build

O Astro gera `dist/` com `output: "static"`, `build.format: "directory"` (cada rota vira
`rota/index.html`) e `trailingSlash: "always"`. O CSS sempre sai em arquivo
(`inlineStylesheets: "never"`), o que mantém a CSP sem `'unsafe-inline'` para blocos `<style>`.

As imagens passam pelo `astro:assets`: cada foto de topo sai em AVIF e WebP, em várias larguras, com
`srcset`. Os arquivos em `/_astro/` têm hash do conteúdo no nome e são servidos com cache de um ano.

## Conteúdo

Os textos ficam em `src/content/`, tipados:

- `itech.ts`: dados da empresa (nome, cidade, contato) e textos da home;
- `servicos.ts`: as três páginas de serviço, com escopo (o que inclui e o que não inclui),
  processo, perguntas frequentes e o tipo de abertura de cada página.

A página `src/pages/servicos/[slug].astro` gera as três rotas a partir desse arquivo, com
`getStaticPaths`. Cada serviço escolhe uma das três aberturas em `src/components/heroi/`
(dividida, imersiva ou tipográfica), que são componentes distintos, não variações de um só.

## Formulário de contato

O formulário em `/contato/` envia por POST nativo do HTML, sem JavaScript. O endpoint responde de
duas formas:

- para quem envia JSON (ou pede JSON no `Accept`), código HTTP e corpo JSON;
- para o envio comum do navegador, `303 See Other` para uma página estática de retorno:
  `/contato/obrigado/`, `/contato/revisar/`, `/contato/aguarde/` ou `/contato/indisponivel/`.

As páginas de retorno têm `noindex` e ficam fora do sitemap. Uma página estática não consegue
repreencher os campos com o que o visitante digitou, e isso foi aceito para não colocar script no
caminho do envio e não colocar dado pessoal na URL.

## Verificações

As ferramentas em `ferramentas/` leem o `dist/`, não o código-fonte, porque o que importa é o que
o servidor entrega:

| Ferramenta | Confere |
|---|---|
| `verificar-links.mjs` | todo link interno aponta para um arquivo que existe |
| `verificar-sitemap.mjs` | nenhuma página `noindex` no sitemap e nenhuma página pública fora dele |
| `auditar-seo.mjs` | título, descrição, canonical, `h1`, metadados de compartilhamento e `alt` |
| `medir-peso.mjs` | teto de peso por página contra o orçamento de 600 KB |
| `testar-endpoint.mjs` | a bateria do endpoint, contra um PHP local com dublê do PHPMailer |

A publicação está descrita em [publicacao.md](publicacao.md).

# Segurança

## Superfície de ataque

| Componente | Exposição | Observação |
|---|---|---|
| Páginas estáticas | Leitura | Sem conteúdo enviado por visitantes, sem JavaScript |
| `POST /api/contato.php` | Escrita | Única entrada de dados; dispara e-mail |
| Arquivos no servidor | Leitura, se mal configurados | Logs, backups e `.php` enviados por engano |
| Configuração e PHPMailer | Nenhuma | Ficam fora de `public_html/` |

O que este projeto não controla: o servidor web, o PHP e o certificado TLS são da hospedagem
compartilhada, e a entrega depende do servidor SMTP da caixa de e-mail.

## Cabeçalhos HTTP

Definidos em [`public/.htaccess`](../public/.htaccess):

| Cabeçalho | Valor | Por quê |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; connect-src 'self'` | Nada vem de outra origem; não há script executável no HTML |
| `X-Content-Type-Options` | `nosniff` | Impede o navegador de adivinhar o tipo de um arquivo |
| `X-Frame-Options` | `DENY` | Redundante com `frame-ancestors`, para navegadores antigos |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Não envia o caminho completo para outros sites |
| `Permissions-Policy` | câmera, microfone, localização, pagamento e USB desligados | O site não usa nenhum deles |

Os únicos blocos `<script>` do HTML são de JSON-LD (`application/ld+json`), que o navegador trata
como dado e não executa. Eles são gerados a partir do conteúdo do repositório, com `<` escapado.

**`style-src 'unsafe-inline'`.** Duas páginas passam a URL da foto de topo por atributo `style`,
porque o caminho com hash só existe depois do build. Para explorar isso, um atacante precisaria
injetar HTML, e o site não exibe nada vindo de visitantes. Removê-lo exigiria gerar um CSS por
página com a URL embutida.

**HSTS.** Ainda não está ativo, por decisão. Depois que o navegador recebe
`Strict-Transport-Security`, ele recusa HTTP pelo prazo definido, mesmo que o servidor pare de
enviar o cabeçalho. Um problema de certificado com HSTS ativo deixa o site inacessível para quem já
visitou. O plano é começar com `max-age=86400` e aumentar aos poucos.

## Regras de acesso a arquivos

- `Options -Indexes` na raiz e em `api/`: nenhuma pasta lista seu conteúdo.
- Negação de arquivos ocultos, backups de editor, logs (incluindo `error_log`, sem extensão),
  `.sql`, `.env`, `.ini`, `.yml`, `.md` e `.sh`.
- Todo `.php` é negado na raiz. Em `api/`, só `contato.php` é liberado, pelo nome.
- HTTP e `www` recebem 301 para a forma canônica em HTTPS.

## Endpoint de contato

| Ameaça | Controle |
|---|---|
| Envio automatizado em massa | Limite de 5 envios por origem em 15 minutos; requisição inválida conta 0,34. Campo oculto que pessoas não preenchem |
| Requisição de outro site | `Origin` conferido contra lista fechada, quando presente |
| Injeção de cabeçalho de e-mail | Caracteres de controle recusados (incluindo U+0085, U+2028 e U+2029), revalidação depois da normalização NFC, assunto de lista fechada, Reply-To pela API |
| Corpo gigante ou malformado | 64 KB no `Content-Length` e na leitura; UTF-8 inválido, estrutura aninhada e tipo de conteúdo fora da lista são recusados |
| Contadores inundando o disco | Origem identificada só por `REMOTE_ADDR` (não por `X-Forwarded-For`, que o cliente controla), com teto de arquivos e poda dos vencidos |
| Vazamento de detalhe técnico | `display_errors` desligado; respostas genéricas; detalhes só no log técnico, fora da raiz web |
| Confirmação falsa de envio | Sucesso só depois do aceite do SMTP; a marca contra envio duplicado é removida quando o envio falha |
| Falha de armazenamento | Contador que não pode ser gravado nega a requisição (503), nunca libera |

A configuração real fica em `~/itech-config/contato.php`, com permissão 600, criada direto no
servidor. O repositório só tem o [exemplo](../config/contato.exemplo.php), com valores fictícios.

## Privacidade

- O IP nunca é gravado em texto claro: os contadores usam HMAC com uma chave que fica só na
  configuração do servidor.
- O registro da aplicação guarda tipo de evento e data, nunca nome, e-mail, telefone ou mensagem.
- Nenhum dado digitado vai para a URL.
- A página `/privacidade/` descreve quais dados o formulário coleta, para que servem, para onde vão
  e como pedir acesso, correção ou eliminação.

## No repositório

- Nenhuma credencial versionada; `.gitignore` cobre `.env`, `*.pem`, `*.key` e a configuração real.
- O gitleaks roda na integração contínua. O arquivo [`.gitleaks.toml`](../.gitleaks.toml) libera
  apenas os valores fictícios dos arquivos de exemplo, pelo texto exato.
- `.htaccess` e `.php` ficam sempre em LF (`.gitattributes`): um CR no fim da linha do `.htaccess`
  entra no valor da diretiva e pode derrubar o site com erro 500.

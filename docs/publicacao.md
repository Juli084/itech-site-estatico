# Publicação

A hospedagem é compartilhada e a publicação é manual, pelo gerenciador de arquivos do painel. Por
isso o processo se apoia em ferramentas que montam e conferem o pacote antes do envio.

## 1. Gerar e conferir

```bash
pnpm run check
pnpm run build
pnpm run verificar
```

## 2. Montar o pacote

```bash
pnpm run publicacao
```

Gera `publicacao/` a partir de uma lista de permissão: as 11 páginas públicas, os arquivos da raiz
(`.htaccess`, `robots.txt`, sitemap, favicons, imagem de compartilhamento) e o endpoint em `api/`.
Os ativos de `/_astro/` e `/fonts/` só entram se alguma página permitida os referencia. Qualquer
arquivo fora da lista fica para trás, e a ferramenta informa quantos.

## 3. Ver o que mudou

```bash
node ferramentas/comparar-com-producao.mjs
```

Baixa cada arquivo publicado por HTTPS, compara por SHA-256 e grava em `_alterados.txt` só o que
precisa subir. Isso evita enviar um HTML novo sem o CSS novo que ele referencia (os nomes em
`/_astro/` mudam junto com o conteúdo).

## 4. Empacotar e enviar

```powershell
.\ferramentas\montar-zip-publicacao.ps1 -Origem publicacao -Destino site.zip -Lista _alterados.txt
```

O script grava as entradas do zip com barra normal. O `Compress-Archive` do Windows PowerShell 5.1
usa barra invertida, e no servidor Linux cada `pasta\arquivo` viraria um arquivo solto.

Antes de extrair o zip em `public_html/`, faça uma cópia do conteúdo atual.

## 5. Conferir no servidor

```bash
curl -sI https://itechsolucoesdigitais.com/
```

Os cabeçalhos de segurança precisam aparecer na resposta real. Módulo habilitado não garante que a
diretiva tenha efeito.

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://itechsolucoesdigitais.com/api/contato.php
```

A resposta esperada é `405`: o endpoint está vivo e recusa GET. `403` significa que a exceção de
`api/.htaccess` não teve efeito, `404` que o arquivo não chegou e `500` que há erro de PHP.

Por fim, envie uma mensagem real pelo formulário e confira se ela chegou à caixa.

## Configuração do servidor (uma vez)

1. Criar `~/itech-config/` fora de `public_html/`.
2. Copiar `config/contato.exemplo.php` para `~/itech-config/contato.php`, preencher no próprio
   servidor e aplicar `chmod 600`.
3. Colocar o PHPMailer em `~/itech-config/PHPMailer/` e copiar `config/phpmailer-autoload.php` para
   `~/itech-config/PHPMailer/autoload.php`.
4. Definir o destino do `error_log` do PHP fora de `public_html/`.

## HSTS

Com o HTTPS estável por algumas semanas, descomentar no `.htaccess`:

```apache
Header always set Strict-Transport-Security "max-age=86400"
```

Conferir por alguns dias e aumentar o prazo aos poucos. `includeSubDomains` e `preload` só depois
de confirmar que todos os subdomínios têm certificado válido.

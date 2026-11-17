<?php
/**
 * Exemplo de configuração do endpoint de contato. Todos os valores são
 * fictícios; nenhum arquivo versionado contém credencial.
 *
 * Onde fica: fora de public_html/, com permissão 600. Tudo dentro de
 * public_html/ pode ser pedido por URL, e um arquivo de configuração ali
 * fica a uma requisição de distância.
 *
 *     /home/USUARIO/itech-config/contato.php
 *     chmod 600 /home/USUARIO/itech-config/contato.php
 *
 * O endpoint procura, nesta ordem:
 *   1. o caminho na variável de ambiente ITECH_CONFIG
 *   2. <um nível acima da raiz web>/itech-config/contato.php
 *   3. <dois níveis acima>/itech-config/contato.php
 *
 * Preencha direto no servidor. Se uma credencial vazar, troque-a antes de
 * corrigir qualquer arquivo.
 */

return [
    /* SMTP: os dados vêm do painel de quem hospeda a caixa de e-mail, que
       nem sempre é quem hospeda o site. */
    'smtp_host'       => 'smtp.exemplo-nao-use.com',
    'smtp_porta'      => 465,
    'smtp_seguranca'  => 'ssl',          // 'ssl' na 465, 'tls' na 587
    'smtp_usuario'    => 'naoenvie@exemplo-nao-use.com',
    'smtp_senha'      => 'TROQUE-ESTE-VALOR-NO-SERVIDOR',

    /* O remetente precisa ser do próprio domínio (SPF/DKIM); remetente de
       outro domínio tende a ser recusado ou cair no spam. */
    'remetente_email' => 'naoenvie@exemplo-nao-use.com',
    'remetente_nome'  => 'Site iTech',
    'destino'         => 'destino@exemplo-nao-use.com',

    /* Lista fechada de Origin. Só recusa quando o cabeçalho existe e está
       fora da lista, porque requisições legítimas podem vir sem ele. */
    'origens' => [
        'https://itechsolucoesdigitais.com',
        'https://www.itechsolucoesdigitais.com',
    ],

    /* Contadores de frequência, fora de public_html/. Guardam só HMAC do
       IP, nunca o IP em texto claro. */
    'dir_dados'      => '/home/USUARIO/itech-config/dados',
    'max_contadores' => 5000,

    /* Chave do HMAC. Gere no servidor com:
           head -c 32 /dev/urandom | base64
       Trocar este valor só zera os contadores. */
    'segredo_ip' => 'TROQUE-POR-UMA-STRING-ALEATORIA-LONGA',

    /* PHPMailer também fora de public_html/, para que os .php da
       biblioteca não possam ser chamados por URL. Sem Composer, aponte
       para config/phpmailer-autoload.php copiado para o servidor. */
    'phpmailer_autoload' => '/home/USUARIO/itech-config/PHPMailer/autoload.php',

    /* Registro da aplicação: só evento e contagem, nunca dado pessoal. O
       log técnico do PHP é outro arquivo, também fora da raiz web. */
    'log_app' => '/home/USUARIO/itech-config/contato-app.log',
];

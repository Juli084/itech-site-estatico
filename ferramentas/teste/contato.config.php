<?php
/**
 * Configuração do endpoint só para teste local. Valores fictícios, e o
 * `phpmailer_autoload` aponta para o dublê, que grava em arquivo em vez
 * de enviar: nada sai daqui, mesmo por engano.
 *
 *   docker run --rm -p 8099:8099 \
 *     -v "<raiz do projeto>:/app" -w /app \
 *     -e ITECH_CONFIG=/app/ferramentas/teste/contato.config.php \
 *     php:8.3-cli php -S 0.0.0.0:8099 -t public
 *
 *   node ferramentas/testar-endpoint.mjs http://127.0.0.1:8099/api/contato.php
 *
 * Use a mesma versão de PHP da hospedagem.
 */

$base = getenv('ITECH_TESTE_DADOS') ?: sys_get_temp_dir() . '/itech-teste';
@mkdir($base, 0700, true);

return [
    /* Não usados pelo dublê; existem porque o endpoint exige as chaves. */
    'smtp_host'      => 'smtp.exemplo-nao-use.test',
    'smtp_porta'     => 465,
    'smtp_seguranca' => 'ssl',
    'smtp_usuario'   => 'naoenvie@exemplo-nao-use.test',
    'smtp_senha'     => 'VALOR-DE-TESTE-SEM-USO',

    'remetente_email' => 'naoenvie@exemplo-nao-use.test',
    'remetente_nome'  => 'Teste iTech',
    'destino'         => 'destino@exemplo-nao-use.test',

    /* A origem de onde a bateria envia. Fora da lista, todo caso válido
       cairia em 403. */
    'origens' => [
        'http://127.0.0.1:8099',
        'http://localhost:8099',
    ],

    'dir_dados'      => $base . '/dados',
    'max_contadores' => 5000,

    /* Fixo para que contadores e marcas de envio sejam reproduzíveis.
       Em produção, este valor é aleatório e secreto. */
    'segredo_ip' => 'segredo-fixo-de-teste-nao-use-em-producao-0000',

    'phpmailer_autoload' => __DIR__ . '/phpmailer-duble.php',

    'log_app' => $base . '/contato-app.log',
];

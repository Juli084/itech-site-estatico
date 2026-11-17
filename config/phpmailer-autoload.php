<?php
/**
 * Carregador do PHPMailer para instalação sem Composer.
 *
 * O PHPMailer baixado em zip não traz vendor/autoload.php, que só o
 * Composer gera, e hospedagem compartilhada nem sempre tem Composer. Este
 * arquivo inclui apenas as três classes que o endpoint usa:
 *
 *   Exception.php  usada internamente pelo PHPMailer
 *   PHPMailer.php  classe principal
 *   SMTP.php       necessária para isSMTP()
 *
 * POP3.php e OAuth.php ficam de fora: o endpoint não usa POP-before-SMTP
 * nem XOAUTH2.
 *
 * Fica fora de public_html/, ao lado da pasta src/ do PHPMailer:
 *
 *     /home/USUARIO/itech-config/PHPMailer/autoload.php   <- este arquivo
 *     /home/USUARIO/itech-config/PHPMailer/src/...
 *
 * Testado com PHPMailer 7.1.1 (LGPL-2.1-only), que não é distribuído
 * neste repositório.
 */

/* O zip do GitHub extrai numa pasta com sufixo de commit
   (PHPMailer-PHPMailer-a1b2c3d). Se src/ não estiver ao lado, procura um
   nível abaixo antes de desistir. */
$base = __DIR__ . '/src';

if (!is_dir($base)) {
    $achados = glob(__DIR__ . '/*/src', GLOB_ONLYDIR) ?: [];
    foreach ($achados as $candidato) {
        if (is_file($candidato . '/PHPMailer.php')) {
            $base = $candidato;
            break;
        }
    }
}

$arquivos = ['Exception.php', 'PHPMailer.php', 'SMTP.php'];

foreach ($arquivos as $arquivo) {
    $caminho = $base . '/' . $arquivo;

    /* A exceção chega ao try/catch do endpoint, que responde 503 e registra
       o motivo. O visitante nunca vê confirmação de um envio que não
       aconteceu. */
    if (!is_readable($caminho)) {
        throw new \RuntimeException(
            'PHPMailer incompleto: nao foi possivel ler ' . $caminho
        );
    }

    require_once $caminho;
}

if (!class_exists(\PHPMailer\PHPMailer\PHPMailer::class, false)) {
    throw new \RuntimeException(
        'PHPMailer carregado de ' . $base . ', mas a classe nao foi definida'
    );
}

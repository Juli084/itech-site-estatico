<?php
/**
 * Endpoint do formulário de contato.
 *
 * O site é estático: o HTML de /contato/ é gerado no build, não a cada
 * requisição. Isso define duas escolhas deste arquivo.
 *
 * 1. Não há token de tempo por página. Um token gerado no build seria o
 *    mesmo para todos os visitantes e venceria para todos ao mesmo tempo.
 *    As defesas contra robô são o campo oculto, o limite por origem, as
 *    listas fechadas e a conferência de Origin.
 * 2. A proteção contra envio duplicado (clique duplo, nova tentativa da
 *    rede) é calculada aqui, a partir do conteúdo: HMAC de origem, e-mail,
 *    mensagem e janela de 10 minutos.
 *
 * Nenhuma credencial fica neste arquivo. A configuração mora fora da raiz
 * web (ver config/contato.exemplo.php).
 */

declare(strict_types=1);

/* Erros nunca vão para a resposta HTTP. O destino do log vem da
   configuração do servidor, fora da raiz web: sem isso, o PHP grava
   `error_log` na pasta do script, acessível por URL. */
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);

const LIMITE_CORPO       = 65536;   // 64 KB
const MSG_MIN            = 10;
const MSG_MAX            = 3000;    // pontos de código, não bytes
const JANELA_SEG         = 900;     // 15 min
const LIMITE_POR_ORIGEM  = 5;
const PESO_INVALIDO      = 0.34;    // requisição inválida pesa menos
const JANELA_IDEMP_SEG   = 600;     // 10 min

/* ------------------------------------------------------------------ */
/* Extensões obrigatórias                                              */
/* ------------------------------------------------------------------ */

/* A validação usa mb_check_encoding(), mb_strlen() e mb_substr(). Sem
   mbstring, a primeira chamada seria um erro fatal com 500 em branco.
   Melhor falhar com 503 e o motivo no log. */
if (!extension_loaded('mbstring')) {
    error_log('contato: extensao mbstring ausente; o endpoint nao pode validar UTF-8');
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['estado' => 'indisponivel'], JSON_UNESCAPED_UNICODE);
    exit;
}

/* ------------------------------------------------------------------ */
/* Configuração                                                        */
/* ------------------------------------------------------------------ */

/**
 * Procura a configuração acima da raiz web, nunca dentro dela. O caminho
 * pode ser fixado pela variável de ambiente ITECH_CONFIG.
 */
function carregar_config(): ?array {
    $candidatos = [];
    $env = getenv('ITECH_CONFIG');
    if (is_string($env) && $env !== '') {
        $candidatos[] = $env;
    }
    $raiz = dirname(__DIR__, 2); // .../public_html/.. quando em api/
    $candidatos[] = $raiz . '/itech-config/contato.php';
    $candidatos[] = dirname(__DIR__, 3) . '/itech-config/contato.php';

    foreach ($candidatos as $c) {
        /* is_file, e não só is_readable: is_readable também é verdadeiro
           para diretório, e `require` de diretório é erro fatal. */
        if (!is_string($c) || $c === '' || !is_file($c) || !is_readable($c)) {
            continue;
        }

        /* Falha ao carregar vira 503 com motivo no log, nunca 500 cru. */
        try {
            $cfg = require $c;
        } catch (\Throwable $e) {
            error_log('contato: falha ao carregar ' . $c . ': ' . $e->getMessage());
            return null;
        }

        return is_array($cfg) ? $cfg : null;
    }
    return null;
}

/* ------------------------------------------------------------------ */
/* Resposta                                                            */
/* ------------------------------------------------------------------ */

/**
 * Quem envia JSON recebe JSON. Decidir só pelo Accept falharia com fetch,
 * que não envia Accept: application/json por padrão.
 */
function quer_json(): bool {
    $ct = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
    if (str_starts_with($ct, 'application/json')) {
        return true;
    }
    $a = $_SERVER['HTTP_ACCEPT'] ?? '';
    $x = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    return str_contains((string)$a, 'application/json') || $x === 'fetch';
}

/**
 * Com JavaScript: código HTTP e JSON. Sem JavaScript: 303 para uma página
 * de retorno. Nenhuma resposta revela detalhe técnico.
 */
function responder(int $codigo, string $chave, array $campos = [], string $destino = ''): never {
    if (quer_json()) {
        http_response_code($codigo);
        header('Content-Type: application/json; charset=utf-8');
        $corpo = ['estado' => $chave];
        if ($campos !== []) {
            $corpo['campos'] = $campos; // só nomes, nunca valores
        }
        echo json_encode($corpo, JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($destino !== '') {
        http_response_code(303);
        header('Location: ' . $destino);
        exit;
    }
    http_response_code($codigo);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Nao foi possivel processar o envio.";
    exit;
}

/**
 * Destino sem JavaScript. Uma página estática não consegue ler a query
 * nem repreencher campos, então há uma página de retorno por tipo de
 * resultado, sempre com caminho de volta ao formulário.
 *
 * Nenhum valor digitado entra na URL: dado pessoal em endereço acaba no
 * histórico do navegador, no Referer e no log do servidor.
 */
function url_erro(string $chave, array $campos): string {
    return match ($chave) {
        'frequencia'   => '/contato/aguarde/',
        'indisponivel' => '/contato/indisponivel/',
        default        => '/contato/revisar/',
    };
}

/* ------------------------------------------------------------------ */
/* Texto                                                               */
/* ------------------------------------------------------------------ */

/* Lista explícita: além de \r e \n, cobre U+0085, U+2028 e U+2029, que
   também quebram linha em cabeçalho de e-mail. */
const RE_CONTROLE = '/[\x{0000}-\x{001F}\x{007F}\x{0085}\x{2028}\x{2029}]/u';

function limpo(string $v): string {
    return preg_replace('/^[\s\x{00A0}]+|[\s\x{00A0}]+$/u', '', $v) ?? '';
}

function utf8_ok(string $v): bool {
    return mb_check_encoding($v, 'UTF-8');
}

function tem_controle(string $v): bool {
    return preg_match(RE_CONTROLE, $v) === 1;
}

function normalizar(string $v): string {
    $v = limpo($v);
    if (class_exists('Normalizer')) {
        $n = \Normalizer::normalize($v, \Normalizer::FORM_C);
        if (is_string($n)) {
            $v = $n;
        }
    }
    return $v;
}

/* ------------------------------------------------------------------ */
/* Contadores                                                          */
/* ------------------------------------------------------------------ */

/**
 * Origem identificada por HMAC do REMOTE_ADDR: o IP nunca é gravado em
 * texto claro. X-Forwarded-For é ignorado de propósito: quem envia
 * controla esse cabeçalho, e cada valor forjado criaria um contador novo
 * em disco.
 */
function id_origem(string $segredo): string {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    return substr(hash_hmac('sha256', $ip, $segredo), 0, 32);
}

/**
 * Janela deslizante por origem, em arquivo com flock. Se o armazenamento
 * falhar, a resposta é negar (503), nunca liberar.
 * Devolve [permitido, segundos_para_nova_tentativa, falha].
 */
function cota(string $dir, string $id, float $peso, int $teto): array {
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return [false, 0, 'armazenamento'];
    }
    $arq = $dir . '/c_' . $id;
    $fh = @fopen($arq, 'c+');
    if ($fh === false) {
        return [false, 0, 'armazenamento'];
    }
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        return [false, 0, 'armazenamento'];
    }
    $agora = time();
    $bruto = stream_get_contents($fh);
    $reg = json_decode((string)$bruto, true);
    $eventos = is_array($reg['e'] ?? null) ? $reg['e'] : [];
    $eventos = array_values(array_filter(
        $eventos,
        fn($x) => is_array($x) && ($x[0] ?? 0) > $agora - JANELA_SEG
    ));

    $soma = 0.0;
    foreach ($eventos as $x) {
        $soma += (float)($x[1] ?? 1);
    }

    $permitido = $soma + $peso <= $teto;
    $espera = 0;
    if (!$permitido && $eventos !== []) {
        $espera = max(1, ($eventos[0][0] + JANELA_SEG) - $agora);
    }
    $eventos[] = [$agora, $peso];

    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode(['e' => $eventos]));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    @chmod($arq, 0600);

    return [$permitido, $espera, ''];
}

/** Remove contadores vencidos e mantém um teto de arquivos. */
function podar(string $dir, int $maxArquivos): void {
    $itens = @glob($dir . '/c_*');
    if (!is_array($itens)) {
        return;
    }
    $agora = time();
    foreach ($itens as $i) {
        if (@filemtime($i) < $agora - JANELA_SEG * 2) {
            @unlink($i);
        }
    }
    $itens = @glob($dir . '/c_*');
    if (is_array($itens) && count($itens) > $maxArquivos) {
        usort($itens, fn($a, $b) => (@filemtime($a) <=> @filemtime($b)));
        foreach (array_slice($itens, 0, count($itens) - $maxArquivos) as $velho) {
            @unlink($velho);
        }
    }
}

/**
 * Marca de envio, gravada na checagem e não depois do envio: é isso que
 * barra o clique duplo, quando a segunda requisição chega antes de a
 * primeira terminar de falar com o SMTP.
 *
 * Consequência: uma tentativa que falha também fica marcada. Por isso o
 * caminho de falha sempre chama desmarcar_envio().
 */
function ja_enviado(string $dir, string $chave): bool {
    $arq = $dir . '/i_' . $chave;
    if (is_file($arq) && @filemtime($arq) > time() - JANELA_IDEMP_SEG) {
        return true;
    }
    @touch($arq);
    @chmod($arq, 0600);
    return false;
}

/**
 * Remove a marca quando o envio não se confirmou. Sem isso, a sequência
 * "SMTP falha, visitante tenta de novo" respondia "mensagem recebida" sem
 * enviar nada. Entre um e-mail duplicado e uma confirmação falsa, o
 * duplicado é o erro menos grave.
 */
function desmarcar_envio(string $dir, string $chave): void {
    @unlink($dir . '/i_' . $chave);
}

/* ------------------------------------------------------------------ */
/* Registro da aplicação: só evento e números, nunca dado pessoal      */
/* ------------------------------------------------------------------ */

function registrar(?array $cfg, string $evento, array $extra = []): void {
    $destino = $cfg['log_app'] ?? '';
    if (!is_string($destino) || $destino === '') {
        return;
    }
    $linha = json_encode([
        'em' => gmdate('c'),
        'evento' => $evento,
    ] + $extra, JSON_UNESCAPED_UNICODE);
    @file_put_contents($destino, $linha . PHP_EOL, FILE_APPEND | LOCK_EX);
}

/* ================================================================== */
/* Fluxo                                                              */
/* ================================================================== */

$cfg = carregar_config();

/* 1. Método */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405, 'metodo');
}

/* 1b. Tipo de conteúdo: só JSON e formulário codificado. multipart é 415. */
$ct = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
$ehJson = str_starts_with($ct, 'application/json');
$ehForm = str_starts_with($ct, 'application/x-www-form-urlencoded');
if (!$ehJson && !$ehForm) {
    responder(415, 'formato', [], url_erro('formato', []));
}

/* 1c. Tamanho declarado e tamanho lido */
$declarado = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($declarado > LIMITE_CORPO) {
    responder(413, 'tamanho', [], url_erro('tamanho', []));
}
$bruto = (string)file_get_contents('php://input', false, null, 0, LIMITE_CORPO + 1);
if (strlen($bruto) > LIMITE_CORPO) {
    responder(413, 'tamanho', [], url_erro('tamanho', []));
}

/* Sem configuração: 503 genérico, sem dizer o que falta. */
if ($cfg === null) {
    responder(503, 'indisponivel', [], url_erro('indisponivel', []));
}

/* 2. Origin, como defesa complementar, nunca única */
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
$permitidas = is_array($cfg['origens'] ?? null) ? $cfg['origens'] : [];
if ($origem !== '' && $permitidas !== [] && !in_array($origem, $permitidas, true)) {
    registrar($cfg, 'origem_recusada');
    responder(403, 'origem', [], url_erro('origem', []));
}

/* 3. Limite por origem */
$dirDados = (string)($cfg['dir_dados'] ?? '');
$segredo  = (string)($cfg['segredo_ip'] ?? '');
if ($dirDados === '' || $segredo === '') {
    responder(503, 'indisponivel', [], url_erro('indisponivel', []));
}
podar($dirDados, (int)($cfg['max_contadores'] ?? 5000));
$id = id_origem($segredo);

/* 4. Decodificar. Recusa estrutura aninhada e vetor onde se espera texto. */
$dados = [];
if ($ehJson) {
    $j = json_decode($bruto, true);
    if (!is_array($j)) {
        cota($dirDados, $id, PESO_INVALIDO, LIMITE_POR_ORIGEM);
        responder(422, 'invalido', ['mensagem'], url_erro('invalido', ['mensagem']));
    }
    $dados = $j;
} else {
    parse_str($bruto, $dados);
}
foreach ($dados as $k => $v) {
    if (!is_string($v)) {
        cota($dirDados, $id, PESO_INVALIDO, LIMITE_POR_ORIGEM);
        responder(422, 'invalido', [is_string($k) ? $k : 'campo'],
                  url_erro('invalido', [is_string($k) ? $k : 'campo']));
    }
}

$campo = fn(string $n): string => isset($dados[$n]) && is_string($dados[$n]) ? $dados[$n] : '';

/* 5. Campo oculto: nenhuma pessoa preenche. Recusa sem dizer qual defesa
      disparou. */
if ($campo('empresa_site') !== '') {
    cota($dirDados, $id, 1.0, LIMITE_POR_ORIGEM);
    registrar($cfg, 'oculto_preenchido');
    responder(422, 'invalido', [], url_erro('invalido', []));
}

/* 6. UTF-8 válido antes de qualquer outra coisa */
foreach (['nome', 'email', 'telefone', 'servico', 'mensagem'] as $n) {
    if ($campo($n) !== '' && !utf8_ok($campo($n))) {
        cota($dirDados, $id, PESO_INVALIDO, LIMITE_POR_ORIGEM);
        responder(422, 'invalido', [$n], url_erro('invalido', [$n]));
    }
}

/* 7. Normalizar antes de validar */
$nome     = normalizar($campo('nome'));
$email    = normalizar($campo('email'));
$telefone = normalizar($campo('telefone'));
$servico  = normalizar($campo('servico'));
$mensagem = normalizar($campo('mensagem'));

/* 8. Validar */
$erros = [];

$nomeLen = mb_strlen($nome, 'UTF-8');
if ($nomeLen < 2 || $nomeLen > 120 || tem_controle($nome)) {
    $erros[] = 'nome';
}
if (strlen($email) > 254 || tem_controle($email)
    || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $erros[] = 'email';
}
if ($telefone !== '') {
    $digitos = preg_replace('/\D+/u', '', $telefone) ?? '';
    if (strlen($digitos) < 10 || strlen($digitos) > 13) {
        $erros[] = 'telefone';
    }
    $telefone = $digitos;
}
/* Lista fechada: valor fora dela é recusado, não "corrigido". */
$servicosValidos = ['', 'desenvolvimento-web', 'ciberseguranca', 'trafego-pago'];
if (!in_array($servico, $servicosValidos, true)) {
    $erros[] = 'servico';
}
$msgLen = mb_strlen($mensagem, 'UTF-8');
if ($msgLen < MSG_MIN || $msgLen > MSG_MAX) {
    $erros[] = 'mensagem';
}

if ($erros !== []) {
    cota($dirDados, $id, PESO_INVALIDO, LIMITE_POR_ORIGEM);
    responder(422, 'invalido', $erros, url_erro('invalido', $erros));
}

/* 9. Revalidar, depois da normalização, os campos que chegam a cabeçalho
      de e-mail: a normalização pode produzir caractere que a validação
      anterior não viu. */
foreach (['nome' => $nome, 'email' => $email] as $n => $v) {
    if (tem_controle($v)) {
        cota($dirDados, $id, PESO_INVALIDO, LIMITE_POR_ORIGEM);
        registrar($cfg, 'controle_pos_normalizacao');
        responder(422, 'invalido', [$n], url_erro('invalido', [$n]));
    }
}

/* 10. Só agora a requisição conta como envio de peso cheio */
[$permitido, $espera, $falha] = cota($dirDados, $id, 1.0, LIMITE_POR_ORIGEM);
if ($falha !== '') {
    registrar($cfg, 'armazenamento_indisponivel');
    responder(503, 'indisponivel', [], url_erro('indisponivel', []));
}
if (!$permitido) {
    header('Retry-After: ' . max(1, (int)$espera));
    registrar($cfg, 'limite_origem');
    responder(429, 'frequencia', [], url_erro('frequencia', []));
}

/* 11. Proteção contra envio duplicado, calculada pelo conteúdo */
$chaveIdem = substr(hash_hmac(
    'sha256',
    $id . '|' . $email . '|' . $mensagem . '|' . intdiv(time(), JANELA_IDEMP_SEG),
    $segredo
), 0, 32);
if (ja_enviado($dirDados, $chaveIdem)) {
    registrar($cfg, 'repetido');
    responder(200, 'ok', [], '/contato/obrigado/');
}

/* 12. Montar e enviar. O assunto vem de uma lista fechada: nenhum texto
       livre do visitante entra em cabeçalho. O e-mail do visitante vai
       em Reply-To, pela API, já validado. */
$rotulos = [
    ''                    => 'sem frente definida',
    'desenvolvimento-web' => 'Desenvolvimento web',
    'ciberseguranca'      => 'Cibersegurança',
    'trafego-pago'        => 'Tráfego pago',
];
$assunto = 'Contato pelo site: ' . ($rotulos[$servico] ?? 'sem frente definida');

$corpo = "Nome: {$nome}\n"
       . "E-mail: {$email}\n"
       . "Telefone: " . ($telefone !== '' ? $telefone : '(nao informado)') . "\n"
       . "Frente: " . ($rotulos[$servico] ?? '-') . "\n"
       . "-----\n"
       . $mensagem . "\n";

$enviado = false;
$autoload = (string)($cfg['phpmailer_autoload'] ?? '');
if ($autoload !== '' && is_readable($autoload)) {
    try {
        require_once $autoload;
        $m = new \PHPMailer\PHPMailer\PHPMailer(true);
        $m->SMTPDebug = 0;            // exemplos de provedor costumam vir com depuração ligada
        $m->Debugoutput = static fn() => null;
        $m->isSMTP();
        $m->Host       = (string)$cfg['smtp_host'];
        $m->Port       = (int)$cfg['smtp_porta'];
        $m->SMTPAuth   = true;
        $m->Username   = (string)$cfg['smtp_usuario'];
        $m->Password   = (string)$cfg['smtp_senha'];
        $m->SMTPSecure = (string)$cfg['smtp_seguranca'];
        $m->CharSet    = 'UTF-8';
        $m->setFrom((string)$cfg['remetente_email'], (string)$cfg['remetente_nome']);
        $m->addAddress((string)$cfg['destino']);
        $m->addReplyTo($email, $nome);   // pela API, nunca cabeçalho concatenado
        $m->Subject = $assunto;
        $m->Body    = $corpo;
        $m->send();
        $enviado = true;
    } catch (\Throwable $e) {
        /* O detalhe vai para o log técnico, fora da raiz web. A resposta
           HTTP não conta nada. */
        error_log('contato: falha no envio: ' . $e->getMessage());
        $enviado = false;
    }
} else {
    error_log('contato: biblioteca de e-mail ausente ou ilegivel');
}

if (!$enviado) {
    desmarcar_envio($dirDados, $chaveIdem);
    registrar($cfg, 'falha_envio');
    responder(503, 'indisponivel', [], url_erro('indisponivel', []));
}

/* 13. Sucesso só depois de o servidor SMTP aceitar. Nunca otimista. */
registrar($cfg, 'enviado', ['frente' => $servico !== '' ? $servico : '-']);
responder(200, 'ok', [], '/contato/obrigado/');

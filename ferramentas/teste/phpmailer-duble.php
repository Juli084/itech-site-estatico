<?php
/**
 * Dublê do PHPMailer para a bateria de testes. Em vez de enviar, grava
 * cada mensagem em JSON Lines (ITECH_DUBLE_SAIDA ou o diretório
 * temporário), para o teste conferir destinatário, Reply-To, assunto e
 * corpo.
 *
 * ITECH_DUBLE_FALHA=1 simula falha de SMTP, com a mesma forma do
 * PHPMailer real (exceção, não retorno false). É assim que se testa o
 * caminho de 503 e a remoção da marca de envio.
 *
 * Não vai para o servidor: ferramentas/ fica fora da lista de
 * preparar-publicacao.mjs.
 */

namespace PHPMailer\PHPMailer;

class Exception extends \Exception {}

class PHPMailer
{
    public int $SMTPDebug = 0;
    public $Debugoutput = null;
    public string $Host = '';
    public int $Port = 0;
    public bool $SMTPAuth = false;
    public string $Username = '';
    public string $Password = '';
    public string $SMTPSecure = '';
    public string $CharSet = '';
    public int $Timeout = 30;
    public string $Subject = '';
    public string $Body = '';

    private array $de = [];
    private array $para = [];
    private array $responderPara = [];

    public function __construct(bool $excecoes = false) {}

    public function isSMTP(): void {}

    public function setFrom(string $email, string $nome = ''): void
    {
        $this->de = ['email' => $email, 'nome' => $nome];
    }

    public function addAddress(string $email, string $nome = ''): void
    {
        $this->para[] = ['email' => $email, 'nome' => $nome];
    }

    public function addReplyTo(string $email, string $nome = ''): void
    {
        $this->responderPara[] = ['email' => $email, 'nome' => $nome];
    }

    public function send(): bool
    {
        if (getenv('ITECH_DUBLE_FALHA') === '1') {
            throw new Exception('SMTP Error: Could not authenticate. (DUBLE)');
        }

        $destino = getenv('ITECH_DUBLE_SAIDA')
            ?: sys_get_temp_dir() . '/itech-duble-envios.jsonl';

        $registro = [
            'quando'        => date('c'),
            'host'          => $this->Host,
            'porta'         => $this->Port,
            'seguranca'     => $this->SMTPSecure,
            'usuario'       => $this->Username,
            'senhaTamanho'  => strlen($this->Password),
            'charset'       => $this->CharSet,
            'de'            => $this->de,
            'para'          => $this->para,
            'responderPara' => $this->responderPara,
            'assunto'       => $this->Subject,
            'corpo'         => $this->Body,
        ];

        file_put_contents(
            $destino,
            json_encode($registro, JSON_UNESCAPED_UNICODE) . PHP_EOL,
            FILE_APPEND | LOCK_EX
        );

        return true;
    }
}

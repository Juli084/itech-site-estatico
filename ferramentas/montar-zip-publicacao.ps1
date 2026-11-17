# Monta o zip de publicação com barra normal como separador.
#
# Compress-Archive, no Windows PowerShell 5.1, grava "pasta\arquivo" com
# barra invertida, o que a especificação ZIP não permite. No Windows passa
# despercebido; extraído num servidor Linux, cada entrada vira um arquivo
# solto com esse nome literal. Aqui cada entrada é escrita com o nome
# normalizado.
#
# Uso: .\ferramentas\montar-zip-publicacao.ps1 -Origem publicacao -Destino site.zip [-Lista _alterados.txt]

param(
    [Parameter(Mandatory = $true)][string]$Origem,
    [Parameter(Mandatory = $true)][string]$Destino,
    [string[]]$Excluir = @(),
    # Arquivo com um caminho relativo por linha (gerado por
    # comparar-com-producao.mjs): só esses entram no zip.
    [string]$Lista = ""
)

$somente = $null
if ($Lista -ne "") {
    if (-not (Test-Path $Lista)) { throw "Lista não encontrada: $Lista" }
    $somente = @{}
    Get-Content $Lista | Where-Object { $_.Trim() -ne "" } | ForEach-Object {
        $somente[$_.Trim().Replace('/', '\')] = $true
    }
    Write-Output "usando lista: $($somente.Count) arquivos"
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path $Destino) { Remove-Item $Destino -Force }

$origemCompleta = (Resolve-Path $Origem).Path.TrimEnd('\')
$fluxo = [System.IO.File]::Open($Destino, [System.IO.FileMode]::CreateNew)
$zip = New-Object System.IO.Compression.ZipArchive($fluxo, [System.IO.Compression.ZipArchiveMode]::Create)

$n = 0
Get-ChildItem $origemCompleta -Recurse -File -Force | ForEach-Object {
    $rel = $_.FullName.Substring($origemCompleta.Length + 1)

    if ($null -ne $somente -and -not $somente.ContainsKey($rel)) { return }

    foreach ($padrao in $Excluir) {
        if ($rel -like $padrao) { return }
    }

    $nome = $rel -replace '\\', '/'

    $entrada = $zip.CreateEntry($nome, [System.IO.Compression.CompressionLevel]::Optimal)
    $saida = $entrada.Open()
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $saida.Write($bytes, 0, $bytes.Length)
    $saida.Dispose()
    $script:n++
}

$zip.Dispose()
$fluxo.Dispose()

Write-Output "$Destino : $n arquivos"

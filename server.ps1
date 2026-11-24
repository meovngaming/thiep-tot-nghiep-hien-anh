<#
  Local Preview & Persistent Guestbook Server (http://localhost:8095/)
  - Serves static files (HTML, CSS, JS, PNG, SVG, OTF/TTF/WOFF2)
  - Provides live Guestbook API persisted to ./data/wishes.json:
      GET  /api/wishes       -> list all wishes
      POST /api/wishes       -> append a new wish
      POST /api/wishes/like  -> increment heart count on a wish
#>

param(
  [int]$Port = 8095
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataDir = Join-Path $root 'data'
$dataFile = Join-Path $dataDir 'wishes.json'

if (-not (Test-Path $dataDir)) {
  New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

function Initialize-WishesFile {
  if (-not (Test-Path $dataFile)) {
    $seed = @(
      @{
        id           = 'seed-1'
        name         = 'Gia đình nhỏ'
        relationship = 'Gia đình'
        attendance   = 'attending'
        message      = 'Chúc mừng con gái yêu đã hoàn thành xuất sắc chặng đường đại học tại Bách Khoa! Cả nhà rất tự hào về Tân Kỹ sư Hiền Anh.'
        likes        = 3
        createdAt    = '2026-11-22T08:30:00+07:00'
      },
      @{
        id           = 'seed-2'
        name         = 'Hội bạn thân Lab Hóa'
        relationship = 'Bạn bè'
        attendance   = 'attending'
        message      = 'Nhất định có mặt từ 9h sáng ở Tòa B2 để chụp 1001 tấm ảnh! Chúc Hiền Anh luôn tỏa sáng trên con đường phía trước nhé!'
        likes        = 2
        createdAt    = '2026-11-23T14:15:00+07:00'
      }
    )
    $json = ConvertTo-Json -InputObject @($seed) -Depth 6
    [System.IO.File]::WriteAllText($dataFile, $json, [System.Text.UTF8Encoding]::new($false))
  }
}

function Read-Wishes {
  Initialize-WishesFile
  try {
    $raw = [System.IO.File]::ReadAllText($dataFile, [System.Text.Encoding]::UTF8)
    if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
    $parsed = $raw | ConvertFrom-Json
    if ($null -eq $parsed) { return @() }
    if ($parsed -is [System.Array]) { return @($parsed) }
    return @($parsed)
  } catch {
    return @()
  }
}

function Write-Wishes($items) {
  $json = ConvertTo-Json -InputObject @($items) -Depth 6
  [System.IO.File]::WriteAllText($dataFile, $json, [System.Text.UTF8Encoding]::new($false))
}

function Send-JsonResponse($ctx, $statusCode, $obj) {
  $json = ConvertTo-Json -InputObject $obj -Depth 6
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  $ctx.Response.StatusCode = $statusCode
  $ctx.Response.ContentType = 'application/json; charset=utf-8'
  $ctx.Response.Headers.Add('Cache-Control', 'no-store')
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Read-BodyJson($req) {
  $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
  $body = $reader.ReadToEnd()
  $reader.Close()
  if ([string]::IsNullOrWhiteSpace($body)) { return $null }
  return ($body | ConvertFrom-Json)
}

Initialize-WishesFile

$mime = @{
  '.html'  = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'application/javascript; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.webp'  = 'image/webp'
  '.otf'   = 'font/otf'
  '.ttf'   = 'font/ttf'
  '.woff'  = 'font/woff'
  '.woff2' = 'font/woff2'
  '.mp3'   = 'audio/mpeg'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Graduation Invitation Server listening on http://localhost:$Port/"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)

    # API: GET /api/wishes
    if ($path -eq '/api/wishes' -and $req.HttpMethod -eq 'GET') {
      $items = Read-Wishes
      Send-JsonResponse $ctx 200 @{ ok = $true; wishes = @($items) }
      $ctx.Response.OutputStream.Close()
      continue
    }

    # API: POST /api/wishes
    if ($path -eq '/api/wishes' -and $req.HttpMethod -eq 'POST') {
      $payload = Read-BodyJson $req
      if ($null -eq $payload -or [string]::IsNullOrWhiteSpace($payload.name) -or [string]::IsNullOrWhiteSpace($payload.message)) {
        Send-JsonResponse $ctx 400 @{ ok = $false; error = 'Missing name or message' }
        $ctx.Response.OutputStream.Close()
        continue
      }

      $entry = [PSCustomObject]@{
        id           = if ($payload.id) { [string]$payload.id } else { 'wish-' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
        name         = ([string]$payload.name).Trim()
        relationship = if ($payload.relationship) { [string]$payload.relationship } else { 'Bạn bè' }
        attendance   = if ($payload.attendance -eq 'declined') { 'declined' } else { 'attending' }
        message      = ([string]$payload.message).Trim()
        likes        = 0
        createdAt    = if ($payload.createdAt) { [string]$payload.createdAt } else { [DateTime]::Now.ToString('o') }
      }

      $current = @(Read-Wishes)
      $updated = @($entry) + $current
      Write-Wishes $updated
      Send-JsonResponse $ctx 201 @{ ok = $true; entry = $entry }
      $ctx.Response.OutputStream.Close()
      continue
    }

    # API: POST /api/wishes/like
    if ($path -eq '/api/wishes/like' -and $req.HttpMethod -eq 'POST') {
      $payload = Read-BodyJson $req
      $targetId = if ($payload -and $payload.id) { [string]$payload.id } else { '' }
      $current = @(Read-Wishes)
      $newLikes = 0
      foreach ($item in $current) {
        if ($item.id -eq $targetId) {
          $curLikes = if ($null -ne $item.likes) { [int]$item.likes } else { 0 }
          $newLikes = $curLikes + 1
          if ($item.PSObject.Properties.Name -contains 'likes') {
            $item.likes = $newLikes
          } else {
            $item | Add-Member -NotePropertyName 'likes' -NotePropertyValue $newLikes
          }
          break
        }
      }
      Write-Wishes $current
      Send-JsonResponse $ctx 200 @{ ok = $true; id = $targetId; likes = $newLikes }
      $ctx.Response.OutputStream.Close()
      continue
    }

    # Static File Serving
    if ($path -eq '/') { $path = '/index.html' }
    $rel = $path.TrimStart('/').Replace('/', '\')
    $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))

    if ($full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path $full -PathType Leaf)) {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.OutputStream.Close()
  } catch {
    try { $ctx.Response.StatusCode = 500; $ctx.Response.OutputStream.Close() } catch {}
  }
}

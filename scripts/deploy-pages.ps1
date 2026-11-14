<#
  一键发布到 GitHub Pages。

  背景：本机原先没有 git，2026-11-14 用 winget 安装 Git for Windows
  （C:\Program Files\Git\cmd\git.exe），推送凭据由 Git Credential Manager 保存，
  HTTPS 推送免交互即可通过。

  仓库约定（勿改动）：
    master               源码主分支（本地开发）
    main                 部署分支，GitHub Pages 从这里发布
    codex/apple-human-ux 旧功能分支
    backup/*             历史备份分支，不要删除、不要 force push

  用法：
    powershell -NoProfile -File scripts\deploy-pages.ps1 -Message "feat: ..."
    powershell -NoProfile -File scripts\deploy-pages.ps1 -Message "..." -DryRun

  注意：本文件必须保存为“UTF-8 带 BOM”，否则 Windows PowerShell 5.1 会按 GBK 解析中文而报语法错。
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Message,
  [switch]$DryRun,
  [int]$WaitSeconds = 120
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repo

function Resolve-Git {
  $cmd = Get-Command git -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($p in @('C:\Program Files\Git\cmd\git.exe', 'C:\Program Files (x86)\Git\cmd\git.exe')) {
    if (Test-Path -LiteralPath $p) { return $p }
  }
  throw '找不到 git.exe：请先安装 Git for Windows（winget install --id Git.Git -e）'
}

$git = Resolve-Git
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE = 'never'

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  # 函数内单独放宽：git 把进度写到 stderr，5.1 下会变成 ErrorRecord，Stop 会直接抛异常
  $ErrorActionPreference = 'Continue'
  # git 的进度信息走 stderr；统一并到 stdout，避免 ErrorActionPreference=Stop 把 stderr 当异常
  & $git @GitArgs 2>&1 | ForEach-Object { "$_" } | Out-Host
  if ($LASTEXITCODE -ne 0) { throw ("git " + ($GitArgs -join ' ') + " 失败（exit $LASTEXITCODE）") }
}

function Test-Dirty {
  $out = & $git status --porcelain
  return [bool]($out -and $out.Count -gt 0)
}

$branch = (& $git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "当前分支: $branch"

# 1) 提交源码
if (Test-Dirty) {
  if ($DryRun) {
    Write-Host '待提交变更:'
    & $git status --short | Out-Host
  } else {
    Invoke-Git add -A
    $msgPath = Join-Path $env:TEMP 'dsh-deploy-msg.txt'
    [IO.File]::WriteAllText($msgPath, $Message, (New-Object System.Text.UTF8Encoding($false)))
    Invoke-Git commit -F $msgPath --quiet
    Write-Host ('已提交: ' + (& $git log --oneline -1))
  }
} else {
  Write-Host '工作区干净，跳过源码提交'
}

if ($DryRun) { Write-Host 'DryRun：不推送、不部署'; return }

# 2) 推送源码分支
Invoke-Git push origin $branch
Write-Host "已推送 $branch"

# 3) 从 origin/main 派生部署提交（快进，不改写历史）
Invoke-Git fetch origin main
$mainSha = (& $git rev-parse origin/main).Trim()
$deployBranch = 'deploy-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
Invoke-Git checkout -B $deployBranch $mainSha

Invoke-Git checkout $branch -- .
$toDelete = (& $git diff --name-only --diff-filter=D --no-renames $mainSha $branch)
if ($toDelete -and $toDelete.Count -gt 0) { Invoke-Git rm --quiet -r -- $toDelete }
Invoke-Git add -A

$staged = (& $git diff --cached --stat)
if (-not $staged -or $staged.Count -eq 0) {
  Write-Host '部署分支与 main 内容一致，无需部署'
  Invoke-Git checkout $branch
  return
}

$deployMsg = 'deploy: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm') + "`n`n" + $Message
$msgPath2 = Join-Path $env:TEMP 'dsh-deploy-msg2.txt'
[IO.File]::WriteAllText($msgPath2, $deployMsg, (New-Object System.Text.UTF8Encoding($false)))
Invoke-Git commit -F $msgPath2 --quiet
$deploySha = (& $git rev-parse HEAD).Trim()
Invoke-Git push origin ($deployBranch + ':main')
Write-Host "已推送 main: $mainSha -> $deploySha"
Invoke-Git checkout $branch

# 4) 等 Pages 构建并校验线上内容
$indexLocal = [IO.File]::ReadAllText((Join-Path $repo 'index.html'), (New-Object System.Text.UTF8Encoding($false)))
$expectVersion = if ($indexLocal -match 'app\.js\?v=([\w\-]+)') { $matches[1] } else { $null }
if (-not $expectVersion) { Write-Warning '没在 index.html 里找到 app.js?v= 版本标记，跳过线上校验'; return }

$base = 'https://877579658-oss.github.io/comfyui-prompt-studio/'
$deadline = (Get-Date).AddSeconds($WaitSeconds)
$ok = $false
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 10
  try {
    $cb = '?cb=' + [guid]::NewGuid().ToString('N')
    $page = Invoke-WebRequest ($base + $cb) -UseBasicParsing -TimeoutSec 30
    $liveVersion = if ($page.Content -match 'app\.js\?v=([\w\-]+)') { $matches[1] } else { $null }
    if ($page.StatusCode -eq 200 -and $liveVersion -eq $expectVersion) {
      Write-Host "线上已更新：HTTP 200，资源版本 $liveVersion"
      $ok = $true
      break
    }
    Write-Host "线上仍是 $liveVersion，等待构建……"
  } catch {
    Write-Host "访问失败，重试：$($_.Exception.Message)"
  }
}
if (-not $ok) { Write-Warning "等待超时：请手动访问 $base 确认" }

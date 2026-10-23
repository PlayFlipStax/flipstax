# FlipStax - runs the VS importer and the export (Oct 23): needs the dev server (.devserver.ps1, port 8834) and Chrome.
#   powershell -File toolss-import.ps1
# Reads incoming-assets/vs-cards/*.txt through tools/vs-import-rules.js, writes data/vs-cards-new.js, then writes data/vs-export.txt.
param([string]$Repo = (Split-Path $PSScriptRoot -Parent), [int]$Port = 9385, [string]$Base = "http://localhost:8834")
$ErrorActionPreference = 'Stop'
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$prof = Join-Path $env:TEMP ("fs-shoot-" + [guid]::NewGuid().ToString('N').Substring(0,8))
$proc = Start-Process $chrome -ArgumentList "--headless=new","--remote-debugging-port=$Port","--user-data-dir=$prof","--no-first-run","--mute-audio","--hide-scrollbars","--disable-background-timer-throttling","--disable-renderer-backgrounding","--disable-backgrounding-occluded-windows","about:blank" -PassThru
Start-Sleep -Seconds 3
$page = (Invoke-RestMethod "http://127.0.0.1:$Port/json/list") | Where-Object { $_.type -eq 'page' } | Select-Object -First 1
$ws = New-Object System.Net.WebSockets.ClientWebSocket
$ws.ConnectAsync([Uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).Wait()
$script:id = 0
function Cdp($method, $params = @{}) {
  $script:id++; $myid = $script:id
  $json = @{ id = $myid; method = $method; params = $params } | ConvertTo-Json -Depth 20 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $ws.SendAsync([ArraySegment[byte]]$bytes, [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).Wait()
  while ($true) {
    $buf = New-Object byte[] 4194304; $sb = New-Object Text.StringBuilder
    do { $t = $ws.ReceiveAsync([ArraySegment[byte]]$buf, [Threading.CancellationToken]::None); if (-not $t.Wait(30000)) { throw "timeout $method" }; $r = $t.Result; [void]$sb.Append([Text.Encoding]::UTF8.GetString($buf, 0, $r.Count)) } while (-not $r.EndOfMessage)
    $msg = $sb.ToString() | ConvertFrom-Json
    if ($msg.id -eq $myid) { if ($msg.error) { throw ("CDP " + $method + ": " + ($msg.error | ConvertTo-Json -Compress)) }; return $msg.result }
  }
}
function Js($code) { $r = Cdp 'Runtime.evaluate' @{ expression = $code; returnByValue = $true; awaitPromise = $true }; if ($r.exceptionDetails) { return "JS-ERROR: " + $r.exceptionDetails.exception.description }; return $r.result.value }
try {
  $T = Join-Path $Repo 'tools'
  function Load { Cdp 'Page.navigate' @{ url = "$Base/flipstax.html?debug=fast&cb=" + [guid]::NewGuid().ToString('N').Substring(0,6) } | Out-Null; for ($k = 0; $k -lt 40; $k++) { Start-Sleep 1; if ((Js "!!(window.__debug && window.__debug.cardPools)") -eq $true) { return } }; throw 'page did not load' }
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  # pass 1: read the sources, write data/vs-cards-new.js
  Load
  Js ([IO.File]::ReadAllText("$T\vs-import-rules.js")) | Out-Null
  Js ([IO.File]::ReadAllText("$T\vs-era-tags.js")) | Out-Null
  $r = Js ([IO.File]::ReadAllText("$T\vs-import.js")); "import: $r"
  if ($r -notlike '{*') { throw "the importer failed: $r" }
  [IO.File]::WriteAllText("$Repo\data\vs-cards-new.js", (Js "window.__vsImport.js"), $utf8)
  "report: " + (Js "JSON.stringify(window.__vsImport.report)")
  # pass 2: reload with the new data, write data/vs-export.txt
  Load
  "export: " + (Js ([IO.File]::ReadAllText("$T\vs-export.js")))
  [IO.File]::WriteAllText("$Repo\data\vs-export.txt", (Js "window.__export.text"), $utf8)
} finally {
  try { $ws.Dispose() } catch {}
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like "*$([IO.Path]::GetFileName($prof))*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

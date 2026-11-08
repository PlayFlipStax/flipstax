# FlipStax frame-time check (Run 2, I3).
# Plays one ?replay=1 episode in headless Chromium (Chrome's --headless=new) on a 390x844 phone viewport and prints
# per-screen p50/p95/max frame time (ms) and dropped-frame counts. Needs the dev server (.devserver.ps1, port 8834).
#   powershell -File tools\frametime.ps1                 # fast-forwarded episode (?debug=fast), about 2 minutes
#   powershell -File tools\frametime.ps1 -Lite           # the same with ?lite=1
#   powershell -File tools\frametime.ps1 -CpuSlowdown 4  # throttle the CPU 4x (a mid-range phone)
param([switch]$Lite, [switch]$Profile, [int]$CpuSlowdown = 4, [int]$MaxSecs = 300, [int]$Port = 9341, [switch]$Headed, [string]$Base = 'http://localhost:8834')
$ErrorActionPreference = 'Stop'
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$prof = Join-Path $env:TEMP ("fs-ft-" + [guid]::NewGuid().ToString('N').Substring(0,8))
$args = @("--remote-debugging-port=$Port","--user-data-dir=$prof","--no-first-run","--mute-audio","--window-size=470,1000","--disable-background-timer-throttling","--disable-renderer-backgrounding","--disable-backgrounding-occluded-windows","about:blank")
if (-not $Headed) { $args = @("--headless=new") + $args }
$proc = Start-Process $chrome -ArgumentList $args -PassThru
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
    $buf = New-Object byte[] 1048576; $sb = New-Object Text.StringBuilder
    do { $t = $ws.ReceiveAsync([ArraySegment[byte]]$buf, [Threading.CancellationToken]::None); if (-not $t.Wait(30000)) { throw "CDP timeout on $method" }; $r = $t.Result; [void]$sb.Append([Text.Encoding]::UTF8.GetString($buf, 0, $r.Count)) } while (-not $r.EndOfMessage)
    $msg = $sb.ToString() | ConvertFrom-Json
    if ($msg.id -eq $myid) { if ($msg.error) { throw ("CDP " + $method + ": " + ($msg.error | ConvertTo-Json -Compress)) }; return $msg.result }
  }
}
function Js($code) { $r = Cdp 'Runtime.evaluate' @{ expression = $code; returnByValue = $true }; if ($r.exceptionDetails) { return "JS-ERROR: " + $r.exceptionDetails.exception.description }; return $r.result.value }
try {
  Cdp 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 2; mobile = $true } | Out-Null
  if ($CpuSlowdown -gt 1) { Cdp 'Emulation.setCPUThrottlingRate' @{ rate = $CpuSlowdown } | Out-Null }
  $q = 'replay=1&debug=fast' + $(if ($Lite) { '&lite=1' } else { '' })
  Cdp 'Page.navigate' @{ url = "$Base/flipstax.html?$q" } | Out-Null
  Start-Sleep 4
  Js "(()=>{ document.querySelector('.replay-btn').click(); [...document.querySelectorAll('.replay-list button')].find(x=>x.textContent==='Restart Daily').click(); return 1; })()" | Out-Null
  Js ([IO.File]::ReadAllText((Join-Path $PSScriptRoot 'frametime-probe.js'))) | Out-Null
  if ($Profile) { Cdp 'Performance.enable' @{} | Out-Null }
  $pm = @{}; $prev = $null
  $t0 = Get-Date; $rep = $null
  while (((Get-Date) - $t0).TotalSeconds -lt $MaxSecs) {
    Start-Sleep -Milliseconds $(if ($Profile) { 1000 } else { 3000 })
    if ($Profile) {
      $m = @{}; (Cdp 'Performance.getMetrics').metrics | ForEach-Object { $m[$_.name] = $_.value }
      $sc = Js "window.__show ? (window.__show.scene === 'mystery' ? 'mystery:' + window.__show.info : window.__show.scene) : 'start'"
      if ($prev) { if (-not $pm[$sc]) { $pm[$sc] = @{ s = 0; layout = 0; style = 0; layoutMs = 0; styleMs = 0; scriptMs = 0; taskMs = 0 } }; $p = $pm[$sc]; $p.s++; $p.layout += $m.LayoutCount - $prev.LayoutCount; $p.style += $m.RecalcStyleCount - $prev.RecalcStyleCount; $p.layoutMs += 1000 * ($m.LayoutDuration - $prev.LayoutDuration); $p.styleMs += 1000 * ($m.RecalcStyleDuration - $prev.RecalcStyleDuration); $p.scriptMs += 1000 * ($m.ScriptDuration - $prev.ScriptDuration); $p.taskMs += 1000 * ($m.TaskDuration - $prev.TaskDuration) }
      $prev = $m
    }
    $r = Js "window.__ft && window.__ft.report ? JSON.stringify(window.__ft.report) : ''"; if ($r) { $rep = $r; break }
  }
  if (-not $rep) { Js "window.__ft.finish()" | Out-Null; $rep = Js "JSON.stringify(window.__ft.report)" }
  $o = $rep | ConvertFrom-Json
  "FlipStax frame times - " + $(if ($Lite) { 'lite' } else { 'full' }) + " mode, CPU x$CpuSlowdown, " + $(if ($Headed) { 'headed' } else { 'headless' })
  "{0,-26} {1,7} {2,7} {3,7} {4,8} {5,8}" -f 'screen', 'frames', 'p50', 'p95', 'max', 'dropped'
  $o.scenes.PSObject.Properties | Sort-Object { -$_.Value.p95 } | ForEach-Object { "{0,-26} {1,7} {2,7} {3,7} {4,8} {5,8}" -f $_.Name, $_.Value.frames, $_.Value.p50, $_.Value.p95, $_.Value.max, $_.Value.dropped }
  "{0,-26} {1,7} {2,7} {3,7} {4,8} {5,8}" -f 'ALL', $o.total.frames, $o.total.p50, $o.total.p95, $o.total.max, $o.total.dropped
  if ($Profile) { ""; "per second, by screen: layouts, style recalcs, layout ms, style ms, script ms, busy ms"; $pm.GetEnumerator() | Sort-Object { -($_.Value.taskMs / [Math]::Max(1, $_.Value.s)) } | ForEach-Object { $v = $_.Value; $n = [Math]::Max(1, $v.s); "{0,-26} {1,6:N0} {2,6:N0} {3,7:N1} {4,7:N1} {5,7:N1} {6,7:N1}" -f $_.Key, ($v.layout / $n), ($v.style / $n), ($v.layoutMs / $n), ($v.styleMs / $n), ($v.scriptMs / $n), ($v.taskMs / $n) } }
} finally {
  try { $ws.Dispose() } catch {}
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like "*$([IO.Path]::GetFileName($prof))*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

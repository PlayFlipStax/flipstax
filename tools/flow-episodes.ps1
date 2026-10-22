# FlipStax flow set on Windows (Run 4A): the same 40-episode check as tools/flow-episodes.py, in headless Chrome over CDP.
# Whole Daily episodes played by tools/touch-episode-probe.js with phone-style taps. Each episode must show the rundown's
# scenes in order with every VS block's count, no VS card twice and no script errors.
# The set: 15 today, 15 today in lite mode, 10 on other days (?showdate=, some with a Cosmic Surprise).
# Needs the dev server (.devserver.ps1, port 8834).
#   powershell -File tools\flow-episodes.ps1                      # fast-forwarded (?debug=fast), 5 in parallel
#   powershell -File tools\flow-episodes.ps1 -RealTime -Parallel 8  # real speed (?debug=1): the timing report
param([int]$Normal = 15, [int]$Lite = 15, [int]$Other = 10, [int]$Parallel = 5, [switch]$RealTime, [int]$MaxSecs = 0, [string]$Out = '', [string]$Base = 'http://localhost:8834', [int]$PortBase = 9400)
$ErrorActionPreference = 'Stop'
if (-not $MaxSecs) { $MaxSecs = $(if ($RealTime) { 900 } else { 420 }) }
$probe = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'touch-episode-probe.js'))
$jobs = @()
for ($i = 0; $i -lt $Normal; $i++) { $jobs += @{ lite = $false; date = '' } }
for ($i = 0; $i -lt $Lite; $i++) { $jobs += @{ lite = $true; date = '' } }
$day0 = Get-Date '2026-10-22'
for ($i = 0; $i -lt $Other; $i++) { $jobs += @{ lite = $false; date = $day0.AddDays(1 + $i * 7 + (Get-Random -Maximum 7)).ToString('yyyy-MM-dd') } }
$worker = {
  param($job, $port, $probe, $realArg, $maxSecs, $base)
  $real = [int]$realArg -eq 1
  $ErrorActionPreference = 'Stop'
  $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
  $prof = Join-Path $env:TEMP ("fs-flow-" + [guid]::NewGuid().ToString('N').Substring(0,8))
  Start-Process $chrome -ArgumentList "--headless=new","--remote-debugging-port=$port","--user-data-dir=$prof","--no-first-run","--mute-audio","--autoplay-policy=no-user-gesture-required","--window-size=390,844","--disable-background-timer-throttling","--disable-renderer-backgrounding","--disable-backgrounding-occluded-windows","about:blank" | Out-Null
  Start-Sleep -Seconds 3
  try {
    $page = (Invoke-RestMethod "http://127.0.0.1:$port/json/list") | Where-Object { $_.type -eq 'page' } | Select-Object -First 1
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
        do { $t = $ws.ReceiveAsync([ArraySegment[byte]]$buf, [Threading.CancellationToken]::None); if (-not $t.Wait(60000)) { throw "CDP timeout on $method" }; $r = $t.Result; [void]$sb.Append([Text.Encoding]::UTF8.GetString($buf, 0, $r.Count)) } while (-not $r.EndOfMessage)
        $msg = $sb.ToString() | ConvertFrom-Json
        if ($msg.id -eq $myid) { if ($msg.error) { throw ("CDP " + $method + ": " + ($msg.error | ConvertTo-Json -Compress)) }; return $msg.result }
      }
    }
    function Js($code) { $r = Cdp 'Runtime.evaluate' @{ expression = $code; returnByValue = $true }; if ($r.exceptionDetails) { return "JS-ERROR: " + $r.exceptionDetails.exception.description }; return $r.result.value }
    Cdp 'Emulation.setDeviceMetricsOverride' @{ width = 390; height = 844; deviceScaleFactor = 1; mobile = $true } | Out-Null
    $q = $(if ($real) { 'debug=1' } else { 'debug=fast' }) + $(if ($job.lite) { '&lite=1' } else { '' }) + $(if ($job.date) { '&showdate=' + $job.date } else { '' })
    $url = "$base/flipstax.html?$q"
    Cdp 'Page.navigate' @{ url = $url } | Out-Null; Start-Sleep 3
    Js "localStorage.clear(); localStorage.setItem('flipstax_howto_daily_v3','1'); 'x'" | Out-Null
    Cdp 'Page.navigate' @{ url = $url } | Out-Null; Start-Sleep 4
    $opts = $(if ($real) { "window.__ttOpts = { fast:false, cine:false, vsMin:1500, vsMax:3500, firstMin:1800, firstMax:3600, ansMin:2500, ansMax:6000, mgMin:700, mgMax:1800, luckyMin:1800, luckyMax:3200, wwMin:900, wwMax:1800 };" } else { "window.__ttOpts = { fast:true, vsMin:40, vsMax:2500 };" })
    $enter = Js "(()=>{ const b = document.getElementById('homeEnterBtn'); if (!b) return 'no enter'; b.click(); return 'ok'; })()"
    Start-Sleep -Milliseconds 800
    Js "(()=>{ const m = document.getElementById('modeSelectOverlay'), b = document.getElementById('modeDailyBtn'); if (m && !m.classList.contains('hidden') && b) b.click(); return 1; })()" | Out-Null
    Start-Sleep -Milliseconds 300
    Js ($opts + $probe) | Out-Null
    $t0 = Get-Date; $rep = $null
    while (((Get-Date) - $t0).TotalSeconds -lt $maxSecs) {
      Start-Sleep 3
      $r = Js "window.__tt && window.__tt.report ? JSON.stringify(window.__tt.report) : ''"
      if ($r) { $rep = $r; break }
    }
    if (-not $rep) {
      $st = Js "JSON.stringify((()=>{ const s = window.__show; if (!s) return { none:1 }; return { scene:s.scene, state:s.state, log:s.log.slice(-8).map(e=> e.kind + ' ' + e.scene + ':' + e.state + ' ' + e.detail) }; })())"
      $rep = '{"ok":false,"problems":["timed out"],"where":' + $st + '}'
    }
    return ($job.lite, $job.date, $rep) -join '|'
  } catch { return ($job.lite, $job.date, ('{"ok":false,"problems":["runner: ' + ($_.Exception.Message -replace '"', "'") + '"]}')) -join '|' }
  finally {
    try { $ws.Dispose() } catch {}
    Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like "*$([IO.Path]::GetFileName($prof))*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  }
}
$running = @(); $results = @(); $k = 0
while ($k -lt $jobs.Count -or $running.Count) {
  while ($k -lt $jobs.Count -and $running.Count -lt $Parallel) {
    $running += Start-Job -ScriptBlock $worker -ArgumentList $jobs[$k], ($PortBase + $k), $probe, ($(if ($RealTime) { 1 } else { 0 })), $MaxSecs, $Base; $k++
  }
  $done = $running | Where-Object { $_.State -ne 'Running' }
  foreach ($j in $done) { $results += (Receive-Job $j); Remove-Job $j; $running = @($running | Where-Object { $_.Id -ne $j.Id }) }
  if (-not $done) { Start-Sleep 2 }
}
$pass = 0; $secs = @(); $lines = @()
foreach ($r in $results) {
  $p = $r -split '\|', 3; $o = $p[2] | ConvertFrom-Json
  if ($o.ok) { $pass++ }
  if ($o.minutes) { $secs += [double]$o.minutes * 60 }
  $lines += ("{0} {1,-5} {2,-10} {3,6}s cosmic={4} vs={5} {6}" -f $(if ($o.ok) { 'PASS' } else { 'FAIL' }), $(if ($p[0] -eq 'True') { 'lite' } else { '' }), $p[1], $(if ($o.minutes) { [math]::Round([double]$o.minutes * 60) } else { '-' }), $o.cosmic, $o.vsCards, (($o.problems | Select-Object -First 2) -join ' / '))
}
$lines
"{0} of {1} pass" -f $pass, $results.Count
if ($secs.Count) { "episode seconds: min {0:N0}, avg {1:N0}, max {2:N0}" -f ($secs | Measure-Object -Minimum).Minimum, ($secs | Measure-Object -Average).Average, ($secs | Measure-Object -Maximum).Maximum }
if ($Out) { $results | Set-Content -Encoding utf8 $Out }

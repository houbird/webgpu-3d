# 啟動本地開發伺服器的腳本

# Windows PowerShell 版本
if ($env:OS -eq "Windows_NT") {
  Write-Host "啟動本地開發伺服器..." -ForegroundColor Green
  Write-Host "請確保已安裝 Python" -ForegroundColor Yellow
  
  try {
    Set-Location $PSScriptRoot
    Write-Host "伺服器將在 http://localhost:8000 啟動" -ForegroundColor Cyan
    Write-Host "按 Ctrl+C 停止伺服器" -ForegroundColor Yellow
    python -m http.server 8000
  }
  catch {
    Write-Host "啟動失敗。請確保已安裝 Python 並可在命令列中使用。" -ForegroundColor Red
    Write-Host "您也可以使用 Node.js: npx serve ." -ForegroundColor Yellow
    Read-Host "按 Enter 鍵繼續"
  }
}
else {
  # Unix/Linux/macOS 版本
  echo "啟動本地開發伺服器..."
  echo "伺服器將在 http://localhost:8000 啟動"
  python3 -m http.server 8000 || python -m http.server 8000
}

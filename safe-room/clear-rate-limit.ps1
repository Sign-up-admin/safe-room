# 清除登录限流记录的PowerShell脚本
# 使用方法：.\clear-rate-limit.ps1

param(
    [string]$ServerUrl = "http://192.168.3.142:8081",
    [string]$Ip = "",
    [string]$Key = ""
)

$baseUrl = "$ServerUrl/springboot1ngh61a2/admin/clearRateLimit"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "清除登录限流记录工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 构建请求URL
$url = $baseUrl
$params = @()

if ($Ip) {
    $params += "ip=$Ip"
}

if ($Key) {
    $params += "key=$Key"
}

if ($params.Count -gt 0) {
    $url += "?" + ($params -join "&")
}

Write-Host "请求URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json" -ErrorAction Stop
    
    if ($response.code -eq 0) {
        Write-Host "✓ 成功：$($response.msg)" -ForegroundColor Green
        Write-Host ""
        Write-Host "现在可以重新尝试登录了！" -ForegroundColor Green
    } else {
        Write-Host "✗ 失败：$($response.msg)" -ForegroundColor Red
    }
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "✗ 请求失败：$errorMessage" -ForegroundColor Red
    Write-Host ""
    Write-Host "提示：" -ForegroundColor Yellow
    Write-Host "1. 检查服务器地址是否正确" -ForegroundColor Gray
    Write-Host "2. 检查应用是否正在运行" -ForegroundColor Gray
    Write-Host "3. 如果配置了安全密钥，请使用 -Key 参数" -ForegroundColor Gray
    Write-Host ""
    Write-Host "使用示例：" -ForegroundColor Yellow
    Write-Host "  .\clear-rate-limit.ps1 -ServerUrl http://localhost:8080" -ForegroundColor Gray
    Write-Host "  .\clear-rate-limit.ps1 -Ip 192.168.1.100 -Key your_secret_key" -ForegroundColor Gray
}






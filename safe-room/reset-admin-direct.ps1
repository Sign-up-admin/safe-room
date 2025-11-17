# 直接修改数据库重置admin账户（开发环境）
# 使用方法：.\reset-admin-direct.ps1

param(
    [string]$Username = "admin",
    [string]$NewPassword = "admin",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "fitness_gym",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "直接修改数据库重置Admin账户" -ForegroundColor Cyan
Write-Host "（开发环境专用）" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了psql
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "错误：未找到psql命令。请确保PostgreSQL客户端已安装并在PATH中。" -ForegroundColor Red
    Write-Host "或者使用Docker容器中的psql：" -ForegroundColor Yellow
    Write-Host "  docker exec -it <postgres-container-name> psql -U postgres -d fitness_gym" -ForegroundColor Yellow
    exit 1
}

Write-Host "数据库连接信息：" -ForegroundColor Yellow
Write-Host "  主机: $DbHost" -ForegroundColor Gray
Write-Host "  端口: $DbPort" -ForegroundColor Gray
Write-Host "  数据库: $DbName" -ForegroundColor Gray
Write-Host "  用户: $DbUser" -ForegroundColor Gray
Write-Host ""

# 设置环境变量
$env:PGPASSWORD = $DbPassword

# 构建SQL命令
$sql = @"
-- 重置admin账户
UPDATE users 
SET 
    password = '$NewPassword',
    password_hash = NULL,
    failed_login_attempts = 0,
    lock_until = NULL,
    status = 0
WHERE username = '$Username';

-- 验证更新结果
SELECT 
    id, 
    username, 
    password, 
    CASE 
        WHEN password_hash IS NULL THEN 'NULL (将使用旧密码)' 
        ELSE '已设置' 
    END as password_status,
    failed_login_attempts, 
    lock_until, 
    status,
    role 
FROM users 
WHERE username = '$Username';
"@

Write-Host "正在重置账户..." -ForegroundColor Yellow

# 执行SQL
try {
    $result = $sql | psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -t -A -F "|"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ 账户重置成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "账户信息：" -ForegroundColor Cyan
        $lines = $result -split "`n" | Where-Object { $_ -match '\|' }
        foreach ($line in $lines) {
            $fields = $line -split '\|'
            if ($fields.Count -ge 8) {
                Write-Host "  ID: $($fields[0])" -ForegroundColor Gray
                Write-Host "  用户名: $($fields[1])" -ForegroundColor Gray
                Write-Host "  密码: $($fields[2])" -ForegroundColor Gray
                Write-Host "  密码状态: $($fields[3])" -ForegroundColor Gray
                Write-Host "  失败次数: $($fields[4])" -ForegroundColor Gray
                Write-Host "  锁定状态: $($fields[5])" -ForegroundColor Gray
                Write-Host "  账户状态: $($fields[6])" -ForegroundColor Gray
                Write-Host "  角色: $($fields[7])" -ForegroundColor Gray
            }
        }
        Write-Host ""
        Write-Host "现在可以使用以下信息登录：" -ForegroundColor Green
        Write-Host "  用户名: $Username" -ForegroundColor Yellow
        Write-Host "  密码: $NewPassword" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "注意：首次登录后，系统会自动将密码迁移到BCrypt加密格式。" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  重要提示：" -ForegroundColor Yellow
        Write-Host "   - 这是开发环境操作，生产环境请使用安全的方式重置密码" -ForegroundColor Yellow
        Write-Host "   - 如果仍然遇到429限流错误，请等待2分钟或使用清除限流脚本" -ForegroundColor Yellow
    } else {
        Write-Host "错误：账户重置失败。请检查数据库连接和权限。" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "错误：执行SQL时发生异常：$_" -ForegroundColor Red
    exit 1
} finally {
    # 清除密码环境变量
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}






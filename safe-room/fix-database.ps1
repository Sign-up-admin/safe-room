# 数据库修复脚本 - 添加缺失的列
# 适用于 PostgreSQL 数据库

param(
    [string]$Host = "localhost",
    [int]$Port = 5432,
    [string]$Database = "fitness_gym",
    [string]$User = "postgres",
    [string]$Password = "postgres"
)

Write-Host "开始修复数据库..." -ForegroundColor Green
Write-Host "数据库: $Database@${Host}:${Port}" -ForegroundColor Cyan

# 检查 psql 是否可用
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "错误: 未找到 psql 命令。请确保 PostgreSQL 客户端已安装并在 PATH 中。" -ForegroundColor Red
    Write-Host "提示: 可以下载 PostgreSQL 客户端或使用 Docker 容器执行 SQL。" -ForegroundColor Yellow
    exit 1
}

# 设置环境变量
$env:PGPASSWORD = $Password

# 创建临时 SQL 文件
$sqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlContent = @"
-- 修复 yonghu 表：添加缺失的 huiyuankamingcheng 列
DO `$`$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'yonghu' 
        AND column_name = 'huiyuankamingcheng'
    ) THEN
        ALTER TABLE yonghu ADD COLUMN huiyuankamingcheng VARCHAR(200);
        RAISE NOTICE '已添加列 huiyuankamingcheng';
    ELSE
        RAISE NOTICE '列 huiyuankamingcheng 已存在，跳过';
    END IF;
END `$`$;

-- 验证修复结果
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'yonghu' 
AND column_name = 'huiyuankamingcheng';
"@

$sqlContent | Out-File -FilePath $sqlFile -Encoding UTF8

try {
    Write-Host "执行 SQL 修复脚本..." -ForegroundColor Yellow
    
    # 执行 SQL
    $result = & psql -h $Host -p $Port -U $User -d $Database -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n数据库修复成功！" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "`n数据库修复失败！" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "执行 SQL 时出错: $_" -ForegroundColor Red
    exit 1
} finally {
    # 清理临时文件
    if (Test-Path $sqlFile) {
        Remove-Item $sqlFile -Force
    }
    # 清除密码环境变量
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n修复完成！" -ForegroundColor Green


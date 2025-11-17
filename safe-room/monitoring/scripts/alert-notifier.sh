#!/bin/bash
# 告警通知脚本
# 处理告警事件并发送通知

set -e

# 配置
SCRIPT_VERSION="2.0.0"
LOG_FILE="/tmp/alert-notifier_$(date +%Y%m%d_%H%M%S).log"

# 通知配置（可以从环境变量或配置文件读取）
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_SMTP_SERVER="${EMAIL_SMTP_SERVER:-smtp.gmail.com}"
EMAIL_SMTP_PORT="${EMAIL_SMTP_PORT:-587}"
EMAIL_USERNAME="${EMAIL_USERNAME:-}"
EMAIL_PASSWORD="${EMAIL_PASSWORD:-}"
EMAIL_FROM="${EMAIL_FROM:-alerts@fitnessgym.com}"
EMAIL_TO="${EMAIL_TO:-devops@fitnessgym.com}"

# 告警数据（从标准输入读取）
ALERT_DATA=""

# 日志函数
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $*" | tee -a "$LOG_FILE"
}

log_warn() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] $*" | tee -a "$LOG_FILE" >&2
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $*" | tee -a "$LOG_FILE" >&2
}

# 解析告警数据
parse_alert_data() {
    if [ -n "$1" ]; then
        ALERT_DATA="$1"
    else
        # 从标准输入读取
        ALERT_DATA=$(cat)
    fi

    log_info "Parsing alert data..."

    # 验证JSON格式
    if ! echo "$ALERT_DATA" | jq . >/dev/null 2>&1; then
        log_error "Invalid JSON alert data"
        exit 1
    fi

    log_info "Alert data parsed successfully"
}

# 获取告警信息
get_alert_info() {
    local field="$1"
    echo "$ALERT_DATA" | jq -r "$field // empty"
}

# 发送Slack通知
send_slack_notification() {
    local alertname status severity summary description

    alertname=$(get_alert_info '.labels.alertname')
    status=$(get_alert_info '.status')
    severity=$(get_alert_info '.labels.severity')
    summary=$(get_alert_info '.annotations.summary')
    description=$(get_alert_info '.annotations.description')

    if [ -z "$SLACK_WEBHOOK_URL" ]; then
        log_warn "Slack webhook URL not configured, skipping Slack notification"
        return 0
    fi

    log_info "Sending Slack notification..."

    # 确定颜色
    local color
    case "$severity" in
        "critical") color="danger" ;;
        "warning") color="warning" ;;
        "info") color="good" ;;
        *) color="good" ;;
    esac

    # 构建Slack消息
    local slack_payload
    slack_payload=$(cat << EOF
{
    "attachments": [
        {
            "color": "$color",
            "title": "🚨 Alert: $alertname",
            "fields": [
                {
                    "title": "Status",
                    "value": "$status",
                    "short": true
                },
                {
                    "title": "Severity",
                    "value": "$severity",
                    "short": true
                },
                {
                    "title": "Summary",
                    "value": "$summary",
                    "short": false
                },
                {
                    "title": "Description",
                    "value": "$description",
                    "short": false
                }
            ],
            "footer": "Fitness Gym Monitoring",
            "ts": $(date +%s)
        }
    ]
}
EOF
)

    # 发送到Slack
    if curl -s -X POST -H 'Content-type: application/json' \
        --data "$slack_payload" "$SLACK_WEBHOOK_URL" >/dev/null 2>&1; then
        log_info "Slack notification sent successfully"
    else
        log_error "Failed to send Slack notification"
        return 1
    fi
}

# 发送邮件通知
send_email_notification() {
    local alertname status severity summary description runbook_url dashboard_url

    alertname=$(get_alert_info '.labels.alertname')
    status=$(get_alert_info '.status')
    severity=$(get_alert_info '.labels.severity')
    summary=$(get_alert_info '.annotations.summary')
    description=$(get_alert_info '.annotations.description')
    runbook_url=$(get_alert_info '.annotations.runbook_url')
    dashboard_url=$(get_alert_info '.annotations.dashboard_url')

    if [ -z "$EMAIL_USERNAME" ] || [ -z "$EMAIL_PASSWORD" ]; then
        log_warn "Email credentials not configured, skipping email notification"
        return 0
    fi

    log_info "Sending email notification..."

    # 构建邮件内容
    local subject="[ALERT] $alertname - $severity"
    local body
    body=$(cat << EOF
Subject: $subject
From: $EMAIL_FROM
To: $EMAIL_TO
Content-Type: text/html; charset=UTF-8

<html>
<body>
    <h2>🚨 告警通知</h2>

    <table border="1" cellpadding="5" cellspacing="0">
        <tr>
            <th>告警名称</th>
            <td>$alertname</td>
        </tr>
        <tr>
            <th>状态</th>
            <td>$status</td>
        </tr>
        <tr>
            <th>严重程度</th>
            <td>$severity</td>
        </tr>
        <tr>
            <th>摘要</th>
            <td>$summary</td>
        </tr>
        <tr>
            <th>描述</th>
            <td>$description</td>
        </tr>
        <tr>
            <th>发生时间</th>
            <td>$(date '+%Y-%m-%d %H:%M:%S')</td>
        </tr>
    </table>

    <h3>相关链接</h3>
    <ul>
        $(if [ -n "$runbook_url" ]; then echo "<li><a href=\"$runbook_url\">处理手册</a></li>"; fi)
        $(if [ -n "$dashboard_url" ]; then echo "<li><a href=\"$dashboard_url\">监控仪表板</a></li>"; fi)
        <li><a href="http://grafana:3000">Grafana主页面</a></li>
        <li><a href="http://prometheus:9090">Prometheus主页面</a></li>
    </ul>

    <hr>
    <p><small>此邮件由Fitness Gym监控系统自动发送</small></p>
</body>
</html>
EOF
)

    # 发送邮件
    if echo "$body" | curl -s --url "smtp://$EMAIL_SMTP_SERVER:$EMAIL_SMTP_PORT" \
        --mail-from "$EMAIL_FROM" \
        --mail-rcpt "$EMAIL_TO" \
        --user "$EMAIL_USERNAME:$EMAIL_PASSWORD" \
        --insecure \
        -T - >/dev/null 2>&1; then
        log_info "Email notification sent successfully"
    else
        log_error "Failed to send email notification"
        return 1
    fi
}

# 发送Webhook通知
send_webhook_notification() {
    local webhook_url="${WEBHOOK_URL:-}"

    if [ -z "$webhook_url" ]; then
        log_warn "Webhook URL not configured, skipping webhook notification"
        return 0
    fi

    log_info "Sending webhook notification..."

    # 发送到Webhook
    if echo "$ALERT_DATA" | curl -s -X POST -H 'Content-Type: application/json' \
        --data @- "$webhook_url" >/dev/null 2>&1; then
        log_info "Webhook notification sent successfully"
    else
        log_error "Failed to send webhook notification"
        return 1
    fi
}

# 记录告警到文件
log_alert() {
    local alert_log_file="/var/log/fitness-gym/alerts.log"

    # 确保目录存在
    mkdir -p "$(dirname "$alert_log_file")" 2>/dev/null || true

    local alertname status severity summary
    alertname=$(get_alert_info '.labels.alertname')
    status=$(get_alert_info '.status')
    severity=$(get_alert_info '.labels.severity')
    summary=$(get_alert_info '.annotations.summary')

    echo "$(date '+%Y-%m-%d %H:%M:%S') [$severity] $alertname - $status - $summary" >> "$alert_log_file"

    log_info "Alert logged to $alert_log_file"
}

# 检查是否为重复告警
is_duplicate_alert() {
    local alertname instance
    alertname=$(get_alert_info '.labels.alertname')
    instance=$(get_alert_info '.labels.instance')

    local cache_file="/tmp/alert_cache_${alertname}_${instance}.tmp"
    local current_time
    current_time=$(date +%s)

    # 检查缓存文件
    if [ -f "$cache_file" ]; then
        local last_time
        last_time=$(cat "$cache_file")
        local time_diff=$((current_time - last_time))

        # 如果5分钟内有相同告警，认为是重复的
        if [ "$time_diff" -lt 300 ]; then
            log_info "Duplicate alert detected, skipping notification"
            return 0
        fi
    fi

    # 更新缓存
    echo "$current_time" > "$cache_file"

    return 1
}

# 主函数
main() {
    log_info "Starting alert notifier script v$SCRIPT_VERSION"

    # 解析告警数据
    parse_alert_data "$1"

    # 检查是否为重复告警
    if is_duplicate_alert; then
        log_info "Skipping duplicate alert notification"
        exit 0
    fi

    # 记录告警
    log_alert

    # 发送各种通知
    local notification_failed=false

    # Slack通知
    if ! send_slack_notification; then
        notification_failed=true
    fi

    # 邮件通知
    if ! send_email_notification; then
        notification_failed=true
    fi

    # Webhook通知
    if ! send_webhook_notification; then
        notification_failed=true
    fi

    if [ "$notification_failed" = true ]; then
        log_error "Some notifications failed to send"
        exit 1
    else
        log_info "All alert notifications sent successfully"
        exit 0
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
Alert Notifier Script v$SCRIPT_VERSION

Usage: $0 [options] [alert-data]

Arguments:
    alert-data    JSON formatted alert data (if not provided, reads from stdin)

Options:
    --help                    Show this help message
    --slack-webhook URL       Slack webhook URL
    --email-config SERVER:PORT:USER:PASS:FROM:TO    Email configuration
    --webhook-url URL         Webhook URL for notifications

Environment Variables:
    SLACK_WEBHOOK_URL         Slack webhook URL
    EMAIL_SMTP_SERVER         SMTP server (default: smtp.gmail.com)
    EMAIL_SMTP_PORT           SMTP port (default: 587)
    EMAIL_USERNAME            SMTP username
    EMAIL_PASSWORD            SMTP password
    EMAIL_FROM               From email address
    EMAIL_TO                  To email address
    WEBHOOK_URL               Webhook URL

Examples:
    echo '{"labels":{"alertname":"TestAlert"},"annotations":{"summary":"Test"}}' | $0
    $0 --slack-webhook "https://hooks.slack.com/..." '{"alert":"data"}'
EOF
}

# 参数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_help
            exit 0
            ;;
        --slack-webhook)
            SLACK_WEBHOOK_URL="$2"
            shift 2
            ;;
        --email-config)
            IFS=':' read -r EMAIL_SMTP_SERVER EMAIL_SMTP_PORT EMAIL_USERNAME EMAIL_PASSWORD EMAIL_FROM EMAIL_TO <<< "$2"
            shift 2
            ;;
        --webhook-url)
            WEBHOOK_URL="$2"
            shift 2
            ;;
        -*)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
        *)
            # 第一个非选项参数作为告警数据
            ALERT_DATA="$1"
            shift
            break
            ;;
    esac
done

# 运行主函数
main "$ALERT_DATA"

#!/bin/bash

# API文档CI/CD脚本
# 用于在本地或CI环境中自动生成和验证API文档

set -e  # 遇到错误立即退出

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCS_DIR="$PROJECT_ROOT/docs"
API_DOCS_DIR="$DOCS_DIR/technical/api"
GENERATED_DOC="$API_DOCS_DIR/GENERATED_API.md"

# 日志函数
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1"
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >&2
}

log_warn() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "未找到Node.js，请安装Node.js"
        exit 1
    fi

    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "未找到npm，请安装npm"
        exit 1
    fi

    # 检查Git
    if ! command -v git &> /dev/null; then
        log_error "未找到Git，请安装Git"
        exit 1
    fi

    log_info "依赖检查通过"
}

# 检查Controller文件变更
check_controller_changes() {
    log_info "检查Controller文件变更..."

    # 获取变更的文件
    if [ -n "$CI_COMMIT_BEFORE_SHA" ] && [ -n "$CI_COMMIT_SHA" ]; then
        # GitLab CI
        CHANGED_FILES=$(git diff --name-only "$CI_COMMIT_BEFORE_SHA" "$CI_COMMIT_SHA")
    elif [ -n "$GITHUB_SHA" ] && [ -n "$GITHUB_BASE_REF" ]; then
        # GitHub Actions
        CHANGED_FILES=$(git diff --name-only "origin/$GITHUB_BASE_REF" "$GITHUB_SHA")
    else
        # 本地检查（与上次提交比较）
        CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")
    fi

    # 检查Controller文件
    CONTROLLER_CHANGED=$(echo "$CHANGED_FILES" | grep "springboot1ngh61a2/src/main/java/com/controller/.*\.java" | wc -l)

    if [ "$CONTROLLER_CHANGED" -gt 0 ]; then
        log_info "检测到 $CONTROLLER_CHANGED 个Controller文件变更"
        return 0
    else
        log_info "未检测到Controller文件变更"
        return 1
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."

    cd "$PROJECT_ROOT"
    npm install

    if [ $? -ne 0 ]; then
        log_error "依赖安装失败"
        exit 1
    fi

    log_info "依赖安装完成"
}

# 生成API文档
generate_api_docs() {
    log_info "生成API文档..."

    cd "$PROJECT_ROOT"

    # 确保输出目录存在
    mkdir -p "$API_DOCS_DIR"

    # 生成文档
    node docs/scripts/generate-api-docs.js --output "$GENERATED_DOC" --verbose

    if [ $? -ne 0 ]; then
        log_error "API文档生成失败"
        exit 1
    fi

    if [ -f "$GENERATED_DOC" ]; then
        log_info "API文档生成成功: $GENERATED_DOC"
    else
        log_error "API文档文件未生成"
        exit 1
    fi
}

# 验证API文档
validate_api_docs() {
    log_info "验证API文档..."

    if [ ! -f "$GENERATED_DOC" ]; then
        log_error "API文档文件不存在: $GENERATED_DOC"
        exit 1
    fi

    # 检查文件大小
    FILE_SIZE=$(stat -f%z "$GENERATED_DOC" 2>/dev/null || stat -c%s "$GENERATED_DOC" 2>/dev/null || wc -c < "$GENERATED_DOC")
    if [ "$FILE_SIZE" -lt 1000 ]; then
        log_error "API文档文件过小，可能生成失败"
        exit 1
    fi

    # 检查基本内容
    if ! grep -q "自动生成的API文档" "$GENERATED_DOC"; then
        log_error "API文档缺少标题信息"
        exit 1
    fi

    if ! grep -q "控制器数量" "$GENERATED_DOC"; then
        log_error "API文档缺少控制器统计信息"
        exit 1
    fi

    if ! grep -q "## 🎯" "$GENERATED_DOC"; then
        log_error "API文档缺少控制器章节"
        exit 1
    fi

    log_info "API文档验证通过"
}

# 提交文档变更
commit_docs() {
    log_info "检查文档变更..."

    cd "$PROJECT_ROOT"

    # 检查文档是否有变更
    if git diff --quiet "$GENERATED_DOC"; then
        log_info "API文档无变更"
        return 0
    fi

    # 配置Git用户信息
    if [ -n "$CI" ]; then
        git config user.email "${GIT_USER_EMAIL:-ci@local.dev}"
        git config user.name "${GIT_USER_NAME:-CI Bot}"
    fi

    # 添加并提交文档
    git add "$GENERATED_DOC"

    # 检查是否有变更需要提交
    if git diff --cached --quiet; then
        log_info "暂存区无变更"
        return 0
    fi

    COMMIT_MSG="docs: 自动更新API文档"
    if [ -n "$CI_COMMIT_SHORT_SHA" ]; then
        COMMIT_MSG="$COMMIT_MSG ($CI_COMMIT_SHORT_SHA)"
    elif [ -n "$GITHUB_SHA" ]; then
        COMMIT_MSG="$COMMIT_MSG (${GITHUB_SHA:0:8})"
    fi

    git commit -m "$COMMIT_MSG"

    log_info "API文档已提交: $COMMIT_MSG"
}

# 部署文档（可选）
deploy_docs() {
    log_info "部署API文档..."

    # 这里可以添加文档部署逻辑
    # 例如：复制到网站目录、上传到CDN等

    log_info "文档部署完成"
}

# 显示帮助信息
show_help() {
    cat << EOF
API文档CI/CD脚本

用法: $0 [选项]

选项:
  -c, --check-only    只检查是否有Controller变更，不生成文档
  -g, --generate      生成API文档
  -v, --validate      验证API文档
  -s, --commit        提交文档变更
  -d, --deploy        部署文档
  -a, --all          执行完整流程（默认）
  -h, --help         显示帮助信息

环境变量:
  CI                 在CI环境中运行
  GITHUB_SHA         GitHub Actions提交SHA
  GITHUB_BASE_REF    GitHub Actions基础分支
  CI_COMMIT_SHA      GitLab CI提交SHA
  CI_COMMIT_BEFORE_SHA  GitLab CI之前的提交SHA

示例:
  $0 --all                    # 执行完整流程
  $0 --check-only             # 只检查变更
  $0 --generate --validate    # 生成并验证文档
EOF
}

# 主函数
main() {
    local check_only=false
    local do_generate=false
    local do_validate=false
    local do_commit=false
    local do_deploy=false

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--check-only)
                check_only=true
                shift
                ;;
            -g|--generate)
                do_generate=true
                shift
                ;;
            -v|--validate)
                do_validate=true
                shift
                ;;
            -s|--commit)
                do_commit=true
                shift
                ;;
            -d|--deploy)
                do_deploy=true
                shift
                ;;
            -a|--all)
                do_generate=true
                do_validate=true
                do_commit=true
                do_deploy=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # 默认执行完整流程
    if [ "$check_only" = false ] && [ "$do_generate" = false ] && [ "$do_validate" = false ] && [ "$do_commit" = false ] && [ "$do_deploy" = false ]; then
        do_generate=true
        do_validate=true
        do_commit=true
        do_deploy=true
    fi

    log_info "开始API文档CI/CD流程..."

    # 检查依赖
    check_dependencies

    # 检查Controller变更
    if ! check_controller_changes; then
        if [ "$check_only" = true ]; then
            log_info "未检测到Controller变更，退出"
            exit 0
        fi
        log_warn "未检测到Controller变更，但继续执行"
    fi

    if [ "$check_only" = true ]; then
        exit 0
    fi

    # 安装依赖
    install_dependencies

    # 生成文档
    if [ "$do_generate" = true ]; then
        generate_api_docs
    fi

    # 验证文档
    if [ "$do_validate" = true ]; then
        validate_api_docs
    fi

    # 提交文档
    if [ "$do_commit" = true ]; then
        commit_docs
    fi

    # 部署文档
    if [ "$do_deploy" = true ]; then
        deploy_docs
    fi

    log_info "API文档CI/CD流程完成 ✅"
}

# 执行主函数
main "$@"


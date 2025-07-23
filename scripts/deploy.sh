#!/bin/bash

# 简化部署脚本
# 用于自动化部署到 GitHub Pages

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查版本
check_version() {
    local cmd=$1
    local expected_version=$2
    local version_cmd=$3
    
    if command -v $cmd &> /dev/null; then
        local current_version=$($version_cmd)
        log "当前 $cmd 版本: $current_version"
        
        # 简单的版本检查（可以根据需要改进）
        if [[ "$current_version" == *"$expected_version"* ]]; then
            log "✓ $cmd 版本符合要求"
        else
            warn "$cmd 版本可能不匹配，期望包含 $expected_version"
        fi
    else
        error "$cmd 未安装"
        exit 1
    fi
}

# 检查环境变量
check_env() {
    log "检查环境变量..."
    
    if [ ! -f ".env.local" ]; then
        warn "未找到 .env.local 文件"
        if [ -f "env.example" ]; then
            info "复制 env.example 到 .env.local"
            cp env.example .env.local
            warn "请编辑 .env.local 文件，填入你的高德地图API密钥"
        else
            error "未找到 env.example 文件"
            exit 1
        fi
    else
        log "找到 .env.local 文件"
    fi
}

# 检查依赖
check_dependencies() {
    log "检查依赖..."
    
    check_command "node"
    check_command "pnpm"
    
    # 检查版本
    check_version "node" "23" "node --version"
    check_version "pnpm" "10.8" "pnpm --version"
    
    if [ ! -f "package.json" ]; then
        error "未找到 package.json 文件"
        exit 1
    fi
    
    log "依赖检查通过"
}

# 安装依赖
install_dependencies() {
    log "安装依赖..."
    pnpm install --frozen-lockfile
    log "依赖安装完成"
}

# 代码检查
run_lint() {
    log "运行代码检查..."
    pnpm lint
    log "代码检查完成"
}

# 构建项目
build_project() {
    log "构建项目..."
    pnpm build
    log "项目构建完成"
}

# 检查构建结果
check_build() {
    log "检查构建结果..."
    
    if [ ! -d "dist" ]; then
        error "构建失败：未找到 dist 目录"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        error "构建失败：未找到 index.html"
        exit 1
    fi
    
    log "构建结果检查通过"
}

# 本地预览
preview_build() {
    log "启动本地预览..."
    info "预览地址: http://localhost:4173/travel/"
    info "按 Ctrl+C 停止预览"
    pnpm preview
}

# 部署到 GitHub
deploy_to_github() {
    log "准备部署到 GitHub..."
    
    # 检查 git 状态
    if [ -n "$(git status --porcelain)" ]; then
        warn "有未提交的更改"
        read -p "是否提交更改? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Auto commit before deployment"
        else
            error "请先提交或暂存更改"
            exit 1
        fi
    fi
    
    # 推送到 GitHub
    log "推送到 GitHub..."
    git push origin main
    
    log "部署完成！"
    info "GitHub Actions 将自动构建和部署"
    info "部署地址:"
    info "- GitHub Pages: https://zenheart.github.io/travel/"
    info "- 自定义域名: https://blog.zenheart.site/travel/"
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -c, --check    仅运行检查和构建"
    echo "  -p, --preview  构建后启动本地预览"
    echo "  -d, --deploy   构建并部署到 GitHub"
    echo "  -a, --all      运行完整流程（检查、构建、部署）"
    echo ""
    echo "示例:"
    echo "  $0 --check      # 仅检查"
    echo "  $0 --preview    # 构建并预览"
    echo "  $0 --deploy     # 构建并部署"
    echo "  $0 --all        # 完整流程"
}

# 主函数
main() {
    local check_only=false
    local preview=false
    local deploy=false
    local all=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--check)
                check_only=true
                shift
                ;;
            -p|--preview)
                preview=true
                shift
                ;;
            -d|--deploy)
                deploy=true
                shift
                ;;
            -a|--all)
                all=true
                shift
                ;;
            *)
                error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有参数，显示帮助
    if [ "$check_only" = false ] && [ "$preview" = false ] && [ "$deploy" = false ] && [ "$all" = false ]; then
        show_help
        exit 0
    fi
    
    # 运行流程
    log "开始部署流程..."
    
    check_dependencies
    check_env
    install_dependencies
    run_lint
    
    if [ "$check_only" = true ]; then
        build_project
        check_build
        log "检查完成"
        exit 0
    fi
    
    build_project
    check_build
    
    if [ "$preview" = true ] || [ "$all" = true ]; then
        preview_build
    fi
    
    if [ "$deploy" = true ] || [ "$all" = true ]; then
        deploy_to_github
    fi
    
    log "部署流程完成！"
}

# 运行主函数
main "$@" 
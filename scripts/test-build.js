#!/usr/bin/env node

/**
 * 构建测试脚本
 * 用于验证构建过程是否正常
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'green') {
  console.log(`${colors[color]}[${new Date().toISOString()}] ${message}${colors.reset}`);
}

function error(message) {
  log(`ERROR: ${message}`, 'red');
}

function warn(message) {
  log(`WARNING: ${message}`, 'yellow');
}

function info(message) {
  log(`INFO: ${message}`, 'blue');
}

// 检查文件是否存在
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description} 存在`);
    return true;
  } else {
    error(`✗ ${description} 不存在: ${filePath}`);
    return false;
  }
}

// 运行命令
function runCommand(command, description) {
  try {
    log(`运行: ${description}`);
    execSync(command, { stdio: 'inherit' });
    log(`✓ ${description} 成功`);
    return true;
  } catch (err) {
    error(`✗ ${description} 失败: ${err.message}`);
    return false;
  }
}

// 检查构建结果
function checkBuildOutput() {
  log('检查构建输出...');
  
  const distPath = 'dist';
  if (!fs.existsSync(distPath)) {
    error('构建失败：未找到 dist 目录');
    return false;
  }
  
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexHtmlPath)) {
    error('构建失败：未找到 index.html');
    return false;
  }
  
  // 检查 index.html 内容
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // 检查基础路径配置
  if (indexHtml.includes('/travel/')) {
    log('✓ 基础路径配置正确');
  } else {
    warn('基础路径可能未正确配置');
  }
  
  // 检查资源文件
  const assetsDir = path.join(distPath, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    log(`✓ 找到 ${assets.length} 个资源文件`);
  }
  
  log('构建输出检查通过');
  return true;
}

// 主函数
function main() {
  log('开始构建测试...');
  
  // 检查必要文件
  const requiredFiles = [
    { path: 'package.json', desc: 'package.json' },
    { path: 'vite.config.ts', desc: 'vite.config.ts' },
    { path: 'src/main.tsx', desc: 'main.tsx' },
    { path: 'index.html', desc: 'index.html' }
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (!checkFile(file.path, file.desc)) {
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    error('必要文件缺失，无法继续测试');
    process.exit(1);
  }
  
  // 清理之前的构建
  if (fs.existsSync('dist')) {
    log('清理之前的构建...');
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  // 运行构建
  if (!runCommand('pnpm build', '构建项目')) {
    process.exit(1);
  }
  
  // 检查构建结果
  if (!checkBuildOutput()) {
    process.exit(1);
  }
  
  log('构建测试完成！');
  info('构建输出目录: dist/');
  info('可以通过 pnpm preview 预览构建结果');
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as testBuild }; 
#!/usr/bin/env node

/**
 * 安全检查脚本
 * 检查环境变量和基本配置
 */

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

function warn(message) {
  log(`WARNING: ${message}`, 'yellow');
}

function error(message) {
  log(`ERROR: ${message}`, 'red');
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

// 检查环境变量
function checkEnvironmentVariables() {
  log('检查环境变量...');
  
  const envFile = '.env.local';
  if (!fs.existsSync(envFile)) {
    warn(`未找到 ${envFile} 文件`);
    if (fs.existsSync('env.example')) {
      info('复制 env.example 到 .env.local');
      fs.copyFileSync('env.example', '.env.local');
      warn('请编辑 .env.local 文件，填入你的高德地图API密钥');
    }
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'VITE_AMAP_API_KEY',
    'VITE_BASE_URL'
  ];
  
  let allPresent = true;
  for (const varName of requiredVars) {
    if (envContent.includes(varName)) {
      log(`✓ 环境变量 ${varName} 已配置`);
    } else {
      error(`✗ 环境变量 ${varName} 未配置`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// 检查构建配置
function checkBuildConfig() {
  log('检查构建配置...');
  
  const viteConfigPath = 'vite.config.ts';
  if (!checkFile(viteConfigPath, 'vite.config.ts')) {
    return false;
  }
  
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // 检查 base 配置
  if (viteConfig.includes('base:')) {
    log('✓ Vite base 配置已设置');
  } else {
    warn('Vite base 配置未设置，可能影响子目录部署');
  }
  
  // 检查 React 插件
  if (viteConfig.includes('@vitejs/plugin-react')) {
    log('✓ React 插件已配置');
  } else {
    error('React 插件未配置');
  }
  
  return true;
}

// 检查路由配置
function checkRouterConfig() {
  log('检查路由配置...');
  
  const appPath = 'src/App.tsx';
  if (!checkFile(appPath, 'App.tsx')) {
    return false;
  }
  
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  // 检查是否使用 HashRouter
  if (appContent.includes('HashRouter')) {
    log('✓ 使用 HashRouter，适合子目录部署');
  } else if (appContent.includes('BrowserRouter')) {
    warn('使用 BrowserRouter，可能需要服务器配置支持');
  } else {
    error('未找到路由配置');
  }
  
  return true;
}

// 主函数
function main() {
  log('开始安全检查...');
  
  const checks = [
    checkEnvironmentVariables,
    checkBuildConfig,
    checkRouterConfig
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
    }
    console.log('');
  }
  
  if (allPassed) {
    log('所有检查通过！');
    log('部署信息:');
    log('- GitHub Pages: https://zenheart.github.io/travel/');
    log('- 自定义域名: https://blog.zenheart.site/travel/');
    process.exit(0);
  } else {
    error('检查失败，请修复上述问题');
    process.exit(1);
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  checkEnvironmentVariables,
  checkBuildConfig,
  checkRouterConfig
}; 
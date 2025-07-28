#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES模块中的__dirname替代）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 复制content目录中的图片文件到public/content目录
function copyContentAssets() {
  const contentDir = path.resolve(projectRoot, 'content');
  const publicContentDir = path.resolve(projectRoot, 'public', 'content');

  console.log('🚀 开始复制 content 目录中的图片资源...');
  console.log(`📂 源目录: ${contentDir}`);
  console.log(`📂 目标目录: ${publicContentDir}`);

  // 清空目标目录
  if (fs.existsSync(publicContentDir)) {
    fs.rmSync(publicContentDir, { recursive: true, force: true });
  }

  // 确保目标目录存在
  fs.mkdirSync(publicContentDir, { recursive: true });

  // 递归复制函数
  function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) {
      console.warn(`⚠️  源目录不存在: ${src}`);
      return;
    }

    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
      // 确保目标目录存在
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      // 读取目录内容
      const files = fs.readdirSync(src);

      files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        copyRecursive(srcPath, destPath);
      });
    } else if (stats.isFile()) {
      // 只复制图片文件
      const ext = path.extname(src).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
        // 确保目标目录存在
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        console.log(`📷 复制图片: ${path.relative(projectRoot, src)} -> ${path.relative(projectRoot, dest)}`);
      }
    }
  }

  // 开始复制
  copyRecursive(contentDir, publicContentDir);
  console.log('✅ Content assets 复制完成!');
}

// 运行复制
copyContentAssets();

#!/usr/bin/env node

// scripts/seed-kv.mjs
// 一键初始化 EdgeOne KV：将 data/site.json 写入 EdgeOne KV 命名空间
// 用法：npm run deploy:seed-kv
// 前提：edgeone CLI 已安装，KV 命名空间已创建，edgeone.json 已配置

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function error(msg) {
  console.error('\n[ERROR]', msg);
  process.exit(1);
}

// ── 检查 edgeone CLI ──
try {
  execSync('edgeone --version', { stdio: 'ignore' });
} catch {
  error('EdgeOne CLI 未安装。请运行: npm install -g edgeone');
}

// ── 读取 edgeone.json 获取 KV 命名空间 ID ──
const edgeonePath = join(ROOT, 'edgeone.json');
if (!existsSync(edgeonePath)) error('未找到 edgeone.json');

const config = JSON.parse(readFileSync(edgeonePath, 'utf-8'));
const namespaceId = config.kv?.SITE_DATA?.id;

if (!namespaceId || namespaceId === 'PLACEHOLDER') {
  error(
    'edgeone.json 中 kv.SITE_DATA.id 仍为 PLACEHOLDER。\n' +
    '请在 EdgeOne 控制台创建 KV 命名空间，然后更新 edgeone.json 中的 id。\n' +
    '详见: https://pages.edgeone.ai/zh/document/edgeone-cli'
  );
}

// ── 读取种子数据 ──
const dataPath = join(ROOT, 'data', 'site.json');
if (!existsSync(dataPath)) error('未找到 data/site.json');

const data = readFileSync(dataPath, 'utf-8');

// 验证 JSON
try {
  JSON.parse(data);
} catch {
  error('data/site.json 包含无效 JSON');
}

// ── 写入 KV ──
console.log('正在将种子数据写入 EdgeOne KV...');
console.log('  命名空间 ID:', namespaceId);
console.log('  Key: site_data');
console.log('  大小:', (data.length / 1024).toFixed(1), 'KB');

try {
  execSync(
    `edgeone kv put ${namespaceId} site_data --value-file "${dataPath}"`,
    { stdio: 'inherit', cwd: ROOT }
  );
  console.log('\n[成功] KV 种子数据写入完成！');
} catch (err) {
  error(`KV 写入失败: ${err.stderr?.toString() || err.message}`);
}

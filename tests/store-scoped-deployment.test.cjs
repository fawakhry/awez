const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy-pages.yml'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'prototype/service-worker.js'), 'utf8');

assert.match(
  workflow,
  /store-scoped-products\.js/,
  'صفحة النشر يجب أن تحمّل منطق البحث المرتبط بكل متجر'
);

assert.match(
  serviceWorker,
  /'\.\/store-scoped-products\.js'/,
  'ملف البحث المرتبط بالمتجر يجب أن يكون ضمن App Shell للعمل دون اتصال'
);

const normalizationIndex = workflow.indexOf('search-normalization.js');
const scopedSearchIndex = workflow.indexOf('store-scoped-products.js');
assert.ok(normalizationIndex >= 0 && scopedSearchIndex > normalizationIndex,
  'يجب تحميل البحث المرتبط بالمتجر بعد تطبيع البحث العربي حتى يستخدمه');

console.log('store-scoped search deployment wiring tests passed');

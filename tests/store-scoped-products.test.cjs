const assert = require('node:assert/strict');
const {
  migrateProducts,
  productsForStore,
  filterStoresByQuery,
} = require('../prototype/store-scoped-products.js');

const stores = [
  { id: 'kheir', name: 'خير زمان', category: 'سوبر ماركت', address: 'وسط بنها' },
  { id: 'trend', name: 'ترند مول', category: 'ملابس', address: 'بنها الجديدة' },
];

const migrated = migrateProducts([
  { id: 'rice', name: 'أرز مصري', category: 'سوبر ماركت' },
  { id: 'shirt', name: 'قميص', category: 'ملابس', storeId: 'trend' },
], 'kheir');

assert.equal(migrated[0].storeId, 'kheir', 'البيانات القديمة تُربط بالمتجر الافتراضي');
assert.equal(migrated[1].storeId, 'trend', 'لا يتم تغيير الربط الموجود');
assert.equal(productsForStore(migrated, 'trend').length, 1, 'كل متجر يعرض منتجاته فقط');
assert.deepEqual(
  filterStoresByQuery(stores, migrated, 'أرز').map((store) => store.id),
  ['kheir'],
  'البحث باسم منتج لا يُظهر متجرًا غير مرتبط به'
);
assert.deepEqual(
  filterStoresByQuery(stores, migrated, 'ملابس').map((store) => store.id),
  ['trend'],
  'البحث بقسم المتجر يظل يعمل'
);
assert.equal(filterStoresByQuery(stores, migrated, '').length, 2, 'البحث الفارغ يعرض كل المتاجر');

console.log('store-scoped products tests passed');

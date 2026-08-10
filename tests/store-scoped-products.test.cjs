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
  { id: 'rice', name: 'أرز مصري', category: 'سوبر ماركت', active: true },
  { id: 'oil', name: 'زيت ذرة', category: 'سوبر ماركت', active: true },
  { id: 'shirt', name: 'قميص', category: 'ملابس', storeId: 'trend', active: true },
  { id: 'hidden-shoes', name: 'حذاء مخفي', category: 'أحذية', storeId: 'trend', active: false },
], 'kheir');

assert.equal(migrated[0].storeId, 'kheir', 'البيانات القديمة تُربط بالمتجر الافتراضي');
assert.equal(migrated[2].storeId, 'trend', 'لا يتم تغيير الربط الموجود');
assert.equal(productsForStore(migrated, 'trend').length, 2, 'كل متجر يحتفظ بمنتجاته فقط');
assert.deepEqual(
  filterStoresByQuery(stores, migrated, 'أرز').map((store) => store.id),
  ['kheir'],
  'البحث باسم منتج لا يُظهر متجرًا غير مرتبط به'
);
assert.deepEqual(
  filterStoresByQuery(stores, migrated, 'زيت ورز').map((store) => store.id),
  ['kheir'],
  'الطلب الطبيعي متعدد الكلمات يطابق منتجات المتجر حتى مع واو العطف'
);
assert.deepEqual(
  filterStoresByQuery(stores, migrated, 'قميص وزيت').map((store) => store.id),
  [],
  'لا يتم تجميع منتجات من متجرين مختلفين لإنتاج نتيجة خاطئة'
);
assert.deepEqual(
  filterStoresByQuery(stores, migrated, 'ملابس').map((store) => store.id),
  ['trend'],
  'البحث بقسم المتجر يظل يعمل'
);
assert.deepEqual(
  filterStoresByQuery(stores, migrated, 'حذاء مخفي').map((store) => store.id),
  [],
  'المنتج غير النشط لا يجعل متجره يظهر في نتائج البحث'
);
assert.equal(filterStoresByQuery(stores, migrated, '').length, 2, 'البحث الفارغ يعرض كل المتاجر');

console.log('store-scoped products tests passed');
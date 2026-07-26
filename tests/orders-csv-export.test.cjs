const assert = require('node:assert/strict');
const { safeText, csvCell, buildOrdersCsv, buildProductsCsv, orderProducts, formatOrderDate } = require('../prototype/orders-csv-export.js');

assert.equal(safeText('=SUM(A1:A2)'), '\t=SUM(A1:A2)');
assert.equal(safeText('+201000000000'), '\t+201000000000');
assert.equal(safeText('عميل\nجديد'), 'عميل جديد');
assert.equal(csvCell('قال "تمام"'), '"قال ""تمام"""');
assert.equal(orderProducts({ items: [{ name: 'أرز', qty: 2 }] }), 'أرز × 2');
assert.equal(formatOrderDate('not-a-date'), '');
const localizedDate = formatOrderDate('2026-07-25T08:00:00.000Z');
assert.ok(localizedDate.includes('٢٠٢٦'), 'date should use Arabic-Egyptian year digits');
assert.ok(!localizedDate.includes('T'), 'date should be human-readable, not raw ISO');

const ordersCsv = buildOrdersCsv([{ id:'AWZ-123', createdAt:'2026-07-25T08:00:00.000Z', status:'pending', customer:{ name:'=HYPERLINK("bad")', phone:'01000000000', address:'بنها', payment:'cash', notes:'اتصل قبل الوصول' }, items:[{ name:'زيت', qty:1 }], total:78 }]);
assert.match(ordersCsv, /"AWZ-123"/);
assert.match(ordersCsv, /"جديد"/);
assert.match(ordersCsv, /"\t=HYPERLINK\(""bad""\)"/);
assert.match(ordersCsv, /"زيت × 1"/);
assert.match(ordersCsv, /٢٠٢٦/);
assert.doesNotMatch(ordersCsv, /2026-07-25T08:00:00\.000Z/);
assert.equal(ordersCsv.split('\r\n').length, 2);

const productsCsv = buildProductsCsv([
  { id:'rice', name:'أرز مصري', category:'سوبر ماركت', price:42, stock:5, active:true, storeId:'kheir' },
  { id:'shirt', name:'=HYPERLINK("bad")', category:'ملابس', price:250, stock:0, active:false, storeId:'trend' }
]);
assert.match(productsCsv, /"معرف المنتج","اسم المنتج","القسم","السعر","المخزون","الحالة","معرف المتجر"/);
assert.match(productsCsv, /"rice","أرز مصري","سوبر ماركت","42","5","متاح","kheir"/);
assert.match(productsCsv, /"shirt","\t=HYPERLINK\(""bad""\)","ملابس","250","0","موقوف","trend"/);
assert.equal(productsCsv.split('\r\n').length, 3);

console.log('Orders and product inventory CSV export tests passed');

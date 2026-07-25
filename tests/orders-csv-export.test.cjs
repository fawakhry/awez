const assert = require('node:assert/strict');
const {
  safeText,
  csvCell,
  buildOrdersCsv,
  orderProducts
} = require('../prototype/orders-csv-export.js');

assert.equal(safeText('=SUM(A1:A2)'), '\t=SUM(A1:A2)');
assert.equal(safeText('+201000000000'), '\t+201000000000');
assert.equal(safeText('عميل\nجديد'), 'عميل جديد');
assert.equal(csvCell('قال "تمام"'), '"قال ""تمام"""');
assert.equal(orderProducts({ items: [{ name: 'أرز', qty: 2 }] }), 'أرز × 2');

const csv = buildOrdersCsv([{
  id: 'AWZ-123',
  createdAt: '2026-07-25T08:00:00.000Z',
  status: 'pending',
  customer: {
    name: '=HYPERLINK("bad")',
    phone: '01000000000',
    address: 'بنها',
    payment: 'cash',
    notes: 'اتصل قبل الوصول'
  },
  items: [{ name: 'زيت', qty: 1 }],
  total: 78
}]);

assert.match(csv, /"AWZ-123"/);
assert.match(csv, /"جديد"/);
assert.match(csv, /"\t=HYPERLINK\(""bad""\)"/);
assert.match(csv, /"زيت × 1"/);
assert.equal(csv.split('\r\n').length, 2);

console.log('Orders CSV export tests passed');

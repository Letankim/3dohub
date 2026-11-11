import {
  runSpellCheck,
  applySafeAutoFixes,
} from '../frontend/src/modules/spell-check/services/spell-engine';

const sample = `
BÁO CÁO
Về việc kieemr tra và sát nhập theo Nghị định 30/2020/NĐ-CP ngày 05 tháng 3 năm 2020.
Thực hiện chỉ đạo của đảng cộng sản việt nam , mọi công tác chuẩn đoán ,bàng giao đã được sử lý.
Tình hình vô hình chung đạt năng xuất cao.
`;

const res = runSpellCheck(sample);
console.log('Total issues detected:', res.stats.total, 'in', res.stats.executionMs, 'ms');

const expectedCorrections = [
  ['kieemr', 'kiểm'],
  ['sát nhập', 'sáp nhập'],
  ['đảng cộng sản việt nam', 'Đảng Cộng sản Việt Nam'],
  ['chuẩn đoán', 'chẩn đoán'],
  ['bàng giao', 'bàn giao'],
  ['sử lý', 'xử lý'],
  ['vô hình chung', 'vô hình trung'],
  ['năng xuất', 'năng suất'],
];

for (const [wrong, right] of expectedCorrections) {
  const found = res.issues.find(
    (i) => i.original.toLowerCase() === wrong.toLowerCase() && i.replacement === right
  );
  if (!found) {
    throw new Error(`Expected issue "${wrong}" -> "${right}" not found!`);
  }
}

const fixed = applySafeAutoFixes(sample, res.issues);
console.log('Fixed sample:\n', fixed);

const recheck = runSpellCheck(fixed);
console.log('Issues after auto-fix:', recheck.stats.total);
if (recheck.stats.total !== 0) {
  console.log('Remaining issues:', recheck.issues);
  throw new Error(`Expected 0 remaining issues after safe auto-fix, got ${recheck.stats.total}`);
}

// Verify protected pattern 30/2020/NĐ-CP remained untouched
if (!fixed.includes('30/2020/NĐ-CP') || !fixed.includes('ngày 05 tháng 3 năm 2020')) {
  throw new Error('Protected patterns were corrupted!');
}

console.log('ALL SPELL CHECK ENGINE ASSERTIONS PASSED!');

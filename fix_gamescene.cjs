const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'scenes', 'GameScene.js');
let content = fs.readFileSync(filePath, 'utf-8');

// FIX 1: Remove old _serveDishToCustomer (the one with this.completedDish)
// This is the OLD method that starts around line 840
const oldMethodStart = '  _serveDishToCustomer(customer) {\r\n    if (!this.completedDish';
const oldMethodEnd = '    this._updateServedCounter();\r\n  }\r\n\r\n  _freeSeat(customer)';

const startIdx = content.indexOf(oldMethodStart);
const endIdx = content.indexOf(oldMethodEnd);

if (startIdx !== -1 && endIdx !== -1) {
  // Remove from the method start (including the empty line before it) to just before _freeSeat
  const lineBeforeStart = content.lastIndexOf('\r\n', startIdx - 1);
  content = content.substring(0, lineBeforeStart) + '\r\n\r\n  _freeSeat(customer)' + content.substring(endIdx + oldMethodEnd.length);
  console.log('FIX 1: Removed old _serveDishToCustomer method');
} else {
  console.log('FIX 1: Old _serveDishToCustomer not found (startIdx=' + startIdx + ', endIdx=' + endIdx + ')');
  // Try without \r\n
  const oldMethodStartLF = '  _serveDishToCustomer(customer) {\n    if (!this.completedDish';
  const startIdx2 = content.indexOf(oldMethodStartLF);
  console.log('  Try LF: startIdx=' + startIdx2);
}

// FIX 2: Replace _showMoneyAnimation with _showMoneyPopup
const before2 = content;
content = content.replace('this._showMoneyAnimation(', 'this._showMoneyPopup(');
if (content !== before2) {
  console.log('FIX 2: Replaced _showMoneyAnimation -> _showMoneyPopup');
} else {
  console.log('FIX 2: _showMoneyAnimation not found (already fixed?)');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done! File saved.');


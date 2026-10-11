const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'src/theme/characters.ts');
const context = { exports: {}, require: asset => {
  const resolved = path.resolve(path.dirname(filename), asset);
  assert.ok(fs.existsSync(resolved), asset);
  return resolved;
}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const { CHARACTERS, SAD_CHARACTERS, characterForHealth } = context.exports;
for (const id of Object.keys(CHARACTERS)) {
  assert.equal(characterForHealth(id, 30), SAD_CHARACTERS[id] ?? CHARACTERS[id]);
  assert.equal(characterForHealth(id, 31), CHARACTERS[id]);
  assert.equal(characterForHealth(id, null), CHARACTERS[id]);
}
assert.equal(characterForHealth('buddy', 0), SAD_CHARACTERS.buddy);
assert.equal(characterForHealth('dolphin', 30.4), SAD_CHARACTERS.dolphin);
assert.equal(characterForHealth('dolphin', 30.5), CHARACTERS.dolphin);
console.log('Mobile artwork files and health switching passed.');

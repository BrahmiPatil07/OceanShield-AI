const fs = require('fs');
const path = require('path');

const js = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const idRegex = /(?:document\.querySelector\(['"]#([^'"]+)['"]\)|document\.getElementById\(['"]([^'"]+)['"]\))/g;
const referencedIds = new Set();
let match;
while ((match = idRegex.exec(js)) !== null) {
  referencedIds.add(match[1] || match[2]);
}

let missingInGitOriginal = [];
referencedIds.forEach(id => {
  const pattern = new RegExp(`id=["']${id}["']`);
  if (!pattern.test(html)) {
    missingInGitOriginal.push(id);
  }
});

console.log('Total referenced IDs in app.js:', referencedIds.size);
console.log('Missing in git_original_index.html:', missingInGitOriginal.length);
console.log('List of missing in git_original_index.html:', missingInGitOriginal);

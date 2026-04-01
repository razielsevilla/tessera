const fs = require('fs');
const path = require('path');
const base = 'C:\\Users\\Raziel\\.cargo\\registry\\src';
function find(dir) {
    try {
        for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
            const p = path.join(dir, f.name);
            if (f.isDirectory() && f.name.includes('poseidon-hash')) return p;
            if (f.isDirectory() && dir === base) { 
                const res = find(p); 
                if (res) return res; 
            }
        }
    } catch(e) {}
}
const p = find(base);
if (p) {
    fs.writeFileSync('lib_out.js.txt', fs.readFileSync(path.join(p, 'src', 'lib.rs'), 'utf8'));
} else {
    fs.writeFileSync('lib_out.js.txt', 'NOT FOUND');
}

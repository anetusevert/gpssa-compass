const fs = require("fs");
const c = fs.readFileSync("src/lib/countries/catalog.ts", "utf8");
const m = c.match(/iso3:\s*"[A-Z]{3}"/g);
console.log("count", m.length);
const set = new Set(m.map((x) => x.match(/[A-Z]{3}/)[0]));
console.log("unique", set.size);
console.log(JSON.stringify([...set].sort(), null, 0));

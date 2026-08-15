import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	buildProductSlug,
	getSectionById,
	getSubById,
} from '../src/js/files/catalog-taxonomy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(__dirname, '../src/json/catalog.json');

const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const usedByScope = new Map();

function scopeKey(product) {
	const section = getSectionById(product.category);
	if (!section) return product.category;
	const sub = getSubById(section, product.subcategory);
	if (section.subs?.length && sub) return `${section.slug}/${sub.slug}`;
	return section.slug;
}

let updated = 0;
for (const product of data.products) {
	const key = scopeKey(product);
	if (!usedByScope.has(key)) usedByScope.set(key, new Set());
	const used = usedByScope.get(key);
	const prev = product.slug;
	product.slug = buildProductSlug({ ...product, slug: undefined }, used);
	if (product.slug !== prev) updated += 1;
}

const tmpPath = `${catalogPath}.tmp`;
fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`);
fs.renameSync(tmpPath, catalogPath);

console.log(`products=${data.products.length} updated=${updated}`);
console.log(
	'sample',
	data.products.slice(0, 3).map((p) => `${p.id}:${p.slug}`).join(', ')
);

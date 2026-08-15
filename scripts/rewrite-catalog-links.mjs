import fs from 'fs';
import {
	catalogPath,
	getProductPath,
	getSectionById,
	getSubById,
} from '../src/js/files/catalog-taxonomy.js';

const catalog = JSON.parse(fs.readFileSync('./src/json/catalog.json', 'utf8'));
const byId = new Map(catalog.products.map((p) => [String(p.id), p]));

function hashToPath(hash) {
	const parts = hash.replace(/^#/, '').split('/').filter(Boolean);
	const section = getSectionById(parts[0]);
	if (!section) return '/catalog/';

	const productToken = parts.find((part) => /^c\d+$/i.test(part));
	if (productToken) {
		const product = byId.get(productToken.replace(/^c/i, ''));
		if (product?.slug) return getProductPath(product);
	}

	const sub = getSubById(section, parts[1]);
	if (sub) return catalogPath(section.slug, sub.slug);
	return catalogPath(section.slug);
}

const files = ['src/index.html', 'src/about.html', 'src/checkout.html'];

for (const file of files) {
	let html = fs.readFileSync(file, 'utf8');
	html = html.replace(/catalog\.html(#[^"'\\\s]*)?/g, (_, hash) =>
		hash ? hashToPath(hash) : '/catalog/'
	);
	html = html.replace(
		'https://mnogogrannik.by/catalog.html?q={search_term_string}',
		'https://mnogogrannik.by/catalog/?q={search_term_string}'
	);
	fs.writeFileSync(file, html);
	console.log('updated', file);
}

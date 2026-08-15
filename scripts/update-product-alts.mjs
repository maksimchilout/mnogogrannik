import fs from 'fs';
import { getProductImageAlt } from '../src/js/files/catalog-utils.js';
import { catalogPages } from '../gulp/tasks/catalog-pages.js';

const catalog = JSON.parse(fs.readFileSync('./src/json/catalog.json', 'utf8'));
const byFile = new Map(
	catalog.products.map((product) => [product.file.toLowerCase(), product])
);
const bySlug = new Map(catalog.products.map((product) => [product.slug, product]));

// Обновляем alt на главной по имени файла в src
let indexHtml = fs.readFileSync('./src/index.html', 'utf8');
indexHtml = indexHtml.replace(
	/<img src="(img\/catalog\/[^"]+)" alt="([^"]*)">/g,
	(match, src, oldAlt) => {
		const file = src.split('/').pop().toLowerCase();
		const product = byFile.get(file);
		if (!product) return match;
		const alt = getProductImageAlt(product).replace(/"/g, '&quot;');
		return `<img src="${src}" alt="${alt}">`;
	}
);
fs.writeFileSync('./src/index.html', indexHtml);

await new Promise((resolve, reject) => {
	catalogPages((error) => (error ? reject(error) : resolve()));
});

const sample = bySlug.get('stol-forma');
console.log('alt sample:', getProductImageAlt(sample));

const productHtml = fs.readFileSync(
	'dist/catalog/loft-mebel/stoly/stol-forma/index.html',
	'utf8'
);
console.log(
	'product page alt:',
	productHtml.match(/catalog-product__media[\s\S]*?alt="([^"]+)"/)?.[1]
);

const listingHtml = fs.readFileSync(
	'dist/catalog/loft-mebel/stoly/index.html',
	'utf8'
);
console.log(
	'listing card alt:',
	listingHtml.match(/stol-forma\/"[\s\S]*?alt="([^"]+)"/)?.[1] ||
		listingHtml.match(/alt="Стол «Форма»[^"]*"/)?.[0]
);

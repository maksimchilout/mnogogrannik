import fs from 'fs';
import path from 'path';

function countIndexFiles(dir) {
	let count = 0;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) count += countIndexFiles(full);
		else if (entry.name === 'index.html') count += 1;
	}
	return count;
}

const listing = fs.readFileSync('dist/catalog/loft-mebel/stoly/index.html', 'utf8');
console.log('listing cards', (listing.match(/item-product/g) || []).length);
console.log('listing css', listing.includes('/css/style.min.css'));
console.log('listing canonical', listing.includes('rel="canonical"'));
console.log('listing product href', listing.includes('/catalog/loft-mebel/stoly/stol-'));

const productDirs = fs
	.readdirSync('dist/catalog/loft-mebel/stoly')
	.filter((name) => name !== 'index.html');
const sampleSlug = productDirs[0];
const product = fs.readFileSync(
	`dist/catalog/loft-mebel/stoly/${sampleSlug}/index.html`,
	'utf8'
);
console.log('sample product', sampleSlug);
console.log('product h1', (product.match(/<h1[^>]*class="catalog-product__title"[^>]*>([^<]+)/) || [])[1]);
console.log('product form', product.includes('data-telegram-order="product"'));
console.log('product description present', product.includes('catalog-product__text'));
console.log('total index.html', countIndexFiles('dist/catalog'));
console.log('legacy redirect', fs.readFileSync('dist/catalog.html', 'utf8').includes('location.replace'));

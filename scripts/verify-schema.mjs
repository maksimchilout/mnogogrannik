import fs from 'fs';
import { catalogPages } from '../gulp/tasks/catalog-pages.js';

await new Promise((resolve, reject) => {
	catalogPages((error) => (error ? reject(error) : resolve()));
});

const productPath = 'dist/catalog/loft-mebel/stoly/stol-forma/index.html';
const html = fs.readFileSync(productPath, 'utf8');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
	(match) => JSON.parse(match[1])
);

console.log(
	'types:',
	blocks.map((block) => block['@type']).join(', ')
);

const product = blocks.find((block) => block['@type'] === 'Product');
const crumbs = blocks.find((block) => block['@type'] === 'BreadcrumbList');
const business = blocks.find((block) => block['@type'] === 'LocalBusiness');

console.log('product name:', product?.name);
console.log('product sku:', product?.sku);
console.log('product price:', product?.offers?.price, product?.offers?.priceCurrency);
console.log('product availability:', product?.offers?.availability);
console.log(
	'breadcrumbs:',
	crumbs?.itemListElement?.map((item) => item.name).join(' → ')
);
console.log('localBusiness phones:', business?.telephone?.join(', '));
console.log('localBusiness hours:', business?.openingHoursSpecification?.length);

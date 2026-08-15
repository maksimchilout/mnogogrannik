import fs from 'fs';
import { catalogPages } from '../gulp/tasks/catalog-pages.js';
import { getSectionById, resolveSeo } from '../src/js/files/catalog-taxonomy.js';

const taxonomyPath = './src/js/files/catalog-taxonomy.js';
let source = fs.readFileSync(taxonomyPath, 'utf8');
source = source.replace(/\| mnogogrannik\.lab/g, '| Mnogogrannik');
source = source.replace(/— mnogogrannik\.lab\./g, '— Mnogogrannik.');
source = source.replace(/mnogogrannik\.lab\./g, 'Mnogogrannik.');
fs.writeFileSync(taxonomyPath, source);

const stairs = resolveSeo(getSectionById('stairs'));
console.log('Title:', stairs.title);
console.log('H1:', stairs.h1);
console.log('Desc:', stairs.description);

await new Promise((resolve, reject) => {
	catalogPages((error) => (error ? reject(error) : resolve()));
});

const html = fs.readFileSync('dist/catalog/lestnicy/index.html', 'utf8');
console.log('HTML title:', html.match(/<title>([^<]+)/)?.[1]);
console.log('HTML h1:', html.match(/<h1[^>]*>([^<]+)/)?.[1]);
console.log(
	'HTML description:',
	html.match(/name="description" content="([^"]+)/)?.[1]
);

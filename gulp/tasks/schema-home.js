import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	getHomePageSchemas,
	renderJsonLdBlocks,
} from '../../src/js/files/catalog-schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partialPath = path.resolve(__dirname, '../../src/html/_schema-home.htm');

export const schemaHome = (done) => {
	try {
		const html = `${renderJsonLdBlocks(...getHomePageSchemas())}\n`;
		fs.writeFileSync(partialPath, html, 'utf8');
		done();
	} catch (error) {
		done(error);
	}
};

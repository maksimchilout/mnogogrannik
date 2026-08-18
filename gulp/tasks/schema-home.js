import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	getAboutPageSchemas,
	getHomePageSchemas,
	renderJsonLdBlocks,
} from '../../src/js/files/catalog-schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlDir = path.resolve(__dirname, '../../src/html');

export const schemaHome = (done) => {
	try {
		fs.writeFileSync(
			path.join(htmlDir, '_schema-home.htm'),
			`${renderJsonLdBlocks(...getHomePageSchemas())}\n`,
			'utf8'
		);
		fs.writeFileSync(
			path.join(htmlDir, '_schema-about.htm'),
			`${renderJsonLdBlocks(...getAboutPageSchemas())}\n`,
			'utf8'
		);
		done();
	} catch (error) {
		done(error);
	}
};

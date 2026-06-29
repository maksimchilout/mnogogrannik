import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogCandidates = [
	path.resolve(__dirname, '../src/json/catalog.json'),
	path.resolve(__dirname, '../dist/json/catalog.json'),
];

let catalogProducts = null;

function loadCatalogProducts() {
	if (catalogProducts) return catalogProducts;

	const catalogPath = catalogCandidates.find((candidate) => fs.existsSync(candidate));
	if (!catalogPath) {
		throw new Error('catalog.json not found for checkout image lookup');
	}

	const raw = fs.readFileSync(catalogPath, 'utf8');
	catalogProducts = JSON.parse(raw).products || [];
	return catalogProducts;
}

export function catalogImageSrc(imagePath) {
	if (!imagePath) return '';

	return imagePath
		.split('/')
		.map((part, index) => (index < 2 ? part : encodeURIComponent(part)))
		.join('/');
}

export function getProductByCartId(cartId) {
	const productId = String(cartId || '').replace(/^c/i, '');
	if (!productId) return null;

	return loadCatalogProducts().find((product) => String(product.id) === productId) || null;
}

export function resolveProductImageUrl(cartId, imageFromClient, siteOrigin) {
	if (imageFromClient) {
		return toAbsoluteImageUrl(imageFromClient, siteOrigin);
	}

	const product = getProductByCartId(cartId);
	if (!product?.image) return '';

	return toAbsoluteImageUrl(catalogImageSrc(product.image), siteOrigin);
}

export function getSiteOriginFromRequest(body, referer) {
	if (body?.siteOrigin) {
		try {
			return new URL(body.siteOrigin).origin;
		} catch {
			// fall through
		}
	}

	if (referer) {
		try {
			return new URL(referer).origin;
		} catch {
			// fall through
		}
	}

	return `http://127.0.0.1:${process.env.PORT || 3000}`;
}

function toAbsoluteImageUrl(src, siteOrigin) {
	if (!src) return '';

	if (/^https?:\/\//i.test(src)) {
		return normalizePathSegments(new URL(src)).href;
	}

	return normalizePathSegments(new URL(src, siteOrigin)).href;
}

function normalizePathSegments(url) {
	url.pathname = url.pathname
		.split('/')
		.map((segment) => {
			if (!segment) return segment;

			try {
				return encodeURIComponent(decodeURIComponent(segment));
			} catch {
				return encodeURIComponent(segment);
			}
		})
		.join('/');

	return url;
}

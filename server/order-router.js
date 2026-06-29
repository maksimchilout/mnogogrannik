import express from 'express';
import multer from 'multer';
import { resolveProductImageUrl, getSiteOriginFromRequest } from './catalog.js';
import { fetchImageBuffer } from './image-fetch.js';
import { sendOrderToTelegram } from './telegram.js';

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024,
		files: 20,
	},
});

function parseJson(value, fallback = null) {
	if (!value) return fallback;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

async function loadCheckoutCartImages(cart, siteOrigin) {
	if (!cart?.items?.length) return [];

	const results = await Promise.all(
		cart.items.map(async (item) => {
			const imageUrl = resolveProductImageUrl(item.id, item.image, siteOrigin);
			if (!imageUrl) {
				console.warn('Checkout image missing for item:', item.id, item.title);
				return null;
			}

			try {
				const buffer = await fetchImageBuffer(imageUrl);
				return {
					title: item.title || 'Товар',
					buffer,
				};
			} catch (error) {
				console.warn('Cart image fetch failed:', item.title, imageUrl, error.message);
				return null;
			}
		})
	);

	return results.filter(Boolean);
}

export function createOrderRouter() {
	const router = express.Router();

	router.post('/order', (req, res) => {
		upload.array('files', 20)(req, res, async (uploadError) => {
			if (uploadError) {
				console.error('Upload failed:', uploadError);
				return res.status(400).json({
					ok: false,
					error: uploadError.message || 'Upload failed',
				});
			}

			try {
				const type = req.body.type || 'custom';
				const fields = parseJson(req.body.fields, {});
				const cart = parseJson(req.body.cart, null);
				const productImageUrl = req.body.productImageUrl || fields.productImage || '';
				const siteOrigin = getSiteOriginFromRequest(req.body, req.headers.referer);

				let productImageBuffer = null;
				let cartImages = [];

				if (type === 'product' && productImageUrl) {
					try {
						productImageBuffer = await fetchImageBuffer(
							resolveProductImageUrl(null, productImageUrl, siteOrigin)
						);
					} catch (error) {
						console.warn('Product image fetch failed:', productImageUrl, error.message);
					}
				}

				if (type === 'checkout') {
					cartImages = await loadCheckoutCartImages(cart, siteOrigin);
					console.log(
						'Checkout order:',
						cart?.items?.length || 0,
						'items,',
						cartImages.length,
						'photos'
					);
				}

				if (type === 'product') {
					console.log('Product order:', fields.productId, fields.product);
				}

				await sendOrderToTelegram({
					type,
					fields,
					cart,
					cartImages,
					files: type === 'product' ? [] : (req.files || []),
					productImageBuffer,
				});

				res.json({ ok: true });
			} catch (error) {
				console.error('Order send failed:', error);
				res.status(500).json({
					ok: false,
					error: error.message || 'Order send failed',
				});
			}
		});
	});

	return router;
}

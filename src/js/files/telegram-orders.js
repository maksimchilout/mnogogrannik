import {
	formatCartPrice,
	getCart,
	getCartTotalPrice,
} from './cart.js';
import { getProductOrderSnapshot } from './product-order-snapshot.js';

const ORDER_API_URL = '/api/order';

function toAbsoluteImageUrl(src) {
	if (!src) return '';
	try {
		return new URL(src, window.location.href).href;
	} catch {
		return src;
	}
}

function collectFormFields(form) {
	const fields = {};
	new FormData(form).forEach((value, key) => {
		if (value instanceof File) return;
		fields[key] = value;
	});
	return fields;
}

export async function submitTelegramOrder(formData) {
	const response = await fetch(ORDER_API_URL, {
		method: 'POST',
		body: formData,
	});

	let result = {};
	try {
		result = await response.json();
	} catch {
		result = {};
	}

	if (!response.ok || !result.ok) {
		throw new Error(result.error || 'Не удалось отправить заявку');
	}

	return result;
}

function collectProductOrderFields(form) {
	const snapshot = getProductOrderSnapshot();

	return {
		productId: snapshot?.productId
			|| form.querySelector('[name="productId"]')?.value?.trim()
			|| '',
		product: snapshot?.product
			|| form.querySelector('[name="product"]')?.value?.trim()
			|| '',
		price: snapshot?.price
			|| form.querySelector('[name="price"]')?.value?.trim()
			|| '',
		name: form.querySelector('[name="name"]')?.value?.trim() || '',
		phone: form.querySelector('[name="phone"]')?.value?.trim() || '',
		productImage: snapshot?.productImage
			|| form.querySelector('[name="productImage"]')?.value?.trim()
			|| '',
	};
}

export async function submitTelegramOrderFromForm(form, type) {
	const formData = new FormData();

	if (type === 'product') {
		const fields = collectProductOrderFields(form);

		if (!fields.productId || !fields.product) {
			throw new Error('Не выбран товар. Откройте карточку товара и попробуйте снова.');
		}

		formData.append('type', type);
		formData.append('fields', JSON.stringify(fields));

		if (fields.productImage) {
			formData.append('productImageUrl', fields.productImage);
		}

		return submitTelegramOrder(formData);
	}

	const fields = collectFormFields(form);

	form.querySelectorAll('input[type="file"]').forEach((input) => {
		Array.from(input.files || []).forEach((file) => {
			formData.append('files', file);
		});
	});

	formData.append('type', type);
	formData.append('fields', JSON.stringify(fields));

	return submitTelegramOrder(formData);
}

function getCheckoutImagesFromDom() {
	const images = {};

	document.querySelectorAll('[data-checkout-pid]').forEach((itemEl) => {
		const productId = itemEl.dataset.checkoutPid;
		const src = itemEl.querySelector('img')?.currentSrc
			|| itemEl.querySelector('img')?.getAttribute('src')
			|| '';

		if (productId && src) {
			images[productId] = toAbsoluteImageUrl(src);
		}
	});

	return images;
}

export async function submitCheckoutTelegramOrder(form) {
	const cart = getCart();
	const entries = Object.entries(cart);
	const checkoutImages = getCheckoutImagesFromDom();

	if (!entries.length) {
		throw new Error('Корзина пуста');
	}

	const fields = collectFormFields(form);
	const items = entries.map(([productId, item]) => ({
		id: productId,
		title: item.title,
		price: item.price || 0,
		quantity: item.quantity || 1,
		image: toAbsoluteImageUrl(item.image) || checkoutImages[productId] || '',
	}));

	const formData = new FormData();
	formData.append('type', 'checkout');
	formData.append('siteOrigin', window.location.origin);
	formData.append('fields', JSON.stringify(fields));
	formData.append(
		'cart',
		JSON.stringify({
			items,
			total: formatCartPrice(getCartTotalPrice(cart)),
		})
	);

	return submitTelegramOrder(formData);
}

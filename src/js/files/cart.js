const CART_STORAGE_KEY = 'mnogogrannik_cart';

import { formatPrice } from './catalog-utils.js';

export function parsePriceValue(text) {
	return parseInt(String(text).replace(/\s/g, '').replace(/[^\d]/g, ''), 10) || 0;
}

export function formatCartPrice(value) {
	const amount = typeof value === 'number' ? value : parsePriceValue(value);
	return formatPrice(amount);
}

export function getCart() {
	try {
		return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || {};
	} catch {
		return {};
	}
}

export function saveCart(cart) {
	localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function getCartTotalQuantity(cart = getCart()) {
	return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotalPrice(cart = getCart()) {
	return Object.values(cart).reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
}

export function getProductDataFromElement(productElement) {
	const imageEl = productElement.querySelector('.item-product__image img');
	const priceEl = productElement.querySelector('.item-product__price:not(.item-product__price_old)');

	return {
		title: productElement.querySelector('.item-product__title')?.textContent.trim() || '',
		image: imageEl?.getAttribute('src') || '',
		alt: imageEl?.getAttribute('alt') || '',
		price: parsePriceValue(priceEl?.textContent || ''),
	};
}

export function addCartItem(productId, productData) {
	const cart = getCart();
	const id = String(productId);

	if (cart[id]) {
		cart[id].quantity += 1;
	} else {
		cart[id] = { ...productData, quantity: 1 };
	}

	saveCart(cart);
	return cart[id];
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderCartListItem(productId, item) {
	const linePrice = (item.price || 0) * item.quantity;

	return `
		<li data-cart-pid="${productId}" class="cart-list__item">
			<a href="#" class="cart-list__image -ibg">
				<img src="${item.image}" alt="${escapeHtml(item.alt || item.title)}">
			</a>
			<div class="cart-list__body">
				<a href="#" class="cart-list__title">${escapeHtml(item.title)}</a>
				<div class="cart-list__price">${formatCartPrice(linePrice)}</div>
			</div>
			<button type="button" class="cart-list__delete" aria-label="Удалить товар">
				<img src="img/icons/close.svg" alt="">
			</button>
		</li>
	`;
}

export function renderCart() {
	const cartList = document.querySelector('.cart-list');
	const cartTotal = document.querySelector('[data-cart-total]');
	const cartFooter = document.querySelector('.cart-header__footer');

	if (!cartList) return;

	const cart = getCart();
	const entries = Object.entries(cart);

	cartList.innerHTML = '';

	entries.forEach(([productId, item]) => {
		cartList.insertAdjacentHTML('beforeend', renderCartListItem(productId, item));
	});

	if (cartTotal) {
		cartTotal.textContent = formatCartPrice(getCartTotalPrice(cart));
	}

	if (cartFooter) {
		cartFooter.hidden = entries.length === 0;
	}

	document.querySelector('.cart-header')?.classList.remove('_empty');
	document.querySelector('[data-cart-empty]')?.setAttribute('hidden', '');

	updateCartBadge();
}

export function updateCartBadge() {
	const cartIcon = document.querySelector('.cart-header__icon');
	if (!cartIcon) return;

	const total = getCartTotalQuantity();
	const badge = cartIcon.querySelector('span');

	if (total > 0) {
		if (badge) {
			badge.textContent = total;
		} else {
			cartIcon.insertAdjacentHTML('beforeend', `<span>${total}</span>`);
		}
	} else if (badge) {
		badge.remove();
	}
}

export function restoreCartFromStorage() {
	renderCart();
}

export function addToCartStorage(productId, productElement) {
	const product = productElement || document.querySelector(`[data-pid="${productId}"]`);
	if (!product) return null;

	const item = addCartItem(productId, getProductDataFromElement(product));
	renderCart();
	return item;
}

export function removeCartItem(productId) {
	const cart = getCart();
	delete cart[String(productId)];
	saveCart(cart);
	renderCart();

	if (!Object.keys(getCart()).length) {
		document.querySelector('.cart-header')?.classList.remove('_active');
	}
}

export function removeFromCartStorage(productId) {
	removeCartItem(productId);
}

export function changeCartItemQuantity(productId, delta) {
	const cart = getCart();
	const id = String(productId);

	if (!cart[id]) return false;

	const current = cart[id].quantity || 1;
	const next = current + delta;

	if (next <= 0) {
		delete cart[id];
	} else {
		cart[id].quantity = next;
	}

	saveCart(cart);
	renderCart();
	return true;
}

export function setCartItemQuantity(productId, quantity) {
	const cart = getCart();
	const id = String(productId);

	if (!cart[id]) return false;

	const next = Math.max(1, Math.floor(Number(quantity) || 1));
	cart[id].quantity = next;
	saveCart(cart);
	renderCart();
	return true;
}

export function clearCart() {
	saveCart({});
	renderCart();
	document.querySelector('.cart-header')?.classList.remove('_active');
}

const CART_STORAGE_KEY = 'funiro_cart';

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

export function getProductDataFromElement(productElement) {
	const imageEl = productElement.querySelector('.item-product__image img');

	return {
		title: productElement.querySelector('.item-product__title')?.textContent.trim() || '',
		image: imageEl?.getAttribute('src') || '',
		alt: imageEl?.getAttribute('alt') || '',
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

export function decrementCartItem(productId) {
	const cart = getCart();
	const id = String(productId);

	if (!cart[id]) return null;

	cart[id].quantity -= 1;

	if (cart[id].quantity <= 0) {
		delete cart[id];
	}

	saveCart(cart);
	return cart[id] || null;
}

function renderCartListItem(productId, item) {
	return `
		<li data-cart-pid="${productId}" class="cart-list__item">
			<a href="#" class="cart-list__image -ibg"><img src="${item.image}" alt="${item.alt || item.title}"></a>
			<div class="cart-list__body">
				<a href="#" class="cart-list__title">${item.title}</a>
				<div class="cart-list__quantity">Количество: <span>${item.quantity}</span></div>
				<a href="#" class="cart-list__delete">Удалить</a>
			</div>
		</li>
	`;
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

function syncCartListItem(productId, item) {
	const cartList = document.querySelector('.cart-list');
	const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`);

	if (cartProduct) {
		cartProduct.querySelector('.cart-list__quantity span').textContent = item.quantity;
	} else {
		cartList?.insertAdjacentHTML('beforeend', renderCartListItem(productId, item));
	}
}

function removeCartListItem(productId) {
	document.querySelector(`[data-cart-pid="${productId}"]`)?.remove();
}

export function restoreCartFromStorage() {
	const cart = getCart();
	const cartList = document.querySelector('.cart-list');

	if (!cartList) return;

	cartList.innerHTML = '';

	Object.entries(cart).forEach(([productId, item]) => {
		cartList.insertAdjacentHTML('beforeend', renderCartListItem(productId, item));
	});

	updateCartBadge();
}

export function addToCartStorage(productId, productElement) {
	const product = productElement || document.querySelector(`[data-pid="${productId}"]`);
	if (!product) return null;

	const item = addCartItem(productId, getProductDataFromElement(product));
	syncCartListItem(productId, item);
	updateCartBadge();
	return item;
}

export function removeFromCartStorage(productId) {
	decrementCartItem(productId);

	const cart = getCart();
	const id = String(productId);
	const cartHeader = document.querySelector('.cart-header');

	if (cart[id]) {
		syncCartListItem(productId, cart[id]);
	} else {
		removeCartListItem(productId);
		cartHeader?.classList.remove('_active');
	}

	updateCartBadge();
}

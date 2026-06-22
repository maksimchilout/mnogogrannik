import {
	formatCartPrice,
	getCart,
	getCartTotalPrice,
	renderCart,
	saveCart,
} from './cart.js';

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderCheckoutItems() {
	const list = document.querySelector('[data-checkout-items]');
	const empty = document.querySelector('[data-checkout-empty]');
	const layout = document.querySelector('[data-checkout-layout]');
	const totalEl = document.querySelector('[data-checkout-total]');
	const submitButton = document.querySelector('[data-checkout-submit]');

	if (!list || !empty || !layout) return;

	const cart = getCart();
	const entries = Object.entries(cart);

	list.innerHTML = '';

	if (!entries.length) {
		empty.hidden = false;
		layout.hidden = true;
		if (submitButton) submitButton.disabled = true;
		return;
	}

	empty.hidden = true;
	layout.hidden = false;
	if (submitButton) submitButton.disabled = false;

	entries.forEach(([productId, item]) => {
		const linePrice = (item.price || 0) * item.quantity;
		list.insertAdjacentHTML(
			'beforeend',
			`
			<li class="checkout-summary__item" data-checkout-pid="${productId}">
				<div class="checkout-summary__image -ibg">
					<img src="${item.image}" alt="${escapeHtml(item.alt || item.title)}">
				</div>
				<div class="checkout-summary__info">
					<h3 class="checkout-summary__title">${escapeHtml(item.title)}</h3>
					<div class="checkout-summary__price">${formatCartPrice(linePrice)}</div>
				</div>
			</li>
		`
		);
	});

	if (totalEl) {
		totalEl.textContent = formatCartPrice(getCartTotalPrice(cart));
	}
}

function initCheckoutForm() {
	const form = document.querySelector('[data-checkout-form]');
	const success = document.querySelector('[data-checkout-success]');

	if (!form) return;

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		if (!Object.keys(getCart()).length) return;

		saveCart({});
		renderCart();
		form.hidden = true;
		document.querySelector('[data-checkout-layout]')?.setAttribute('hidden', '');
		if (success) success.hidden = false;
	});
}

export function initCheckoutPage() {
	if (!document.querySelector('[data-checkout-page]')) return;

	renderCheckoutItems();
	initCheckoutForm();
}

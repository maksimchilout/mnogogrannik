import {
	formatCartPrice,
	getCart,
	getCartTotalPrice,
} from './cart.js';
import { getProductOrderSnapshot } from './product-order-snapshot.js';

const IFRAME_NAME = 'telegram-order-frame';

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

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function line(label, value) {
	if (value === undefined || value === null || value === '') return '';
	return `<b>${escapeHtml(label)}:</b> ${escapeHtml(value)}`;
}

function getTelegramConfig() {
	const cfg = window.MNOGOGRANNIK_TELEGRAM || {};
	const botToken = String(cfg.botToken || '').trim();
	const chatId = String(cfg.chatId || '').trim();

	if (!botToken || !chatId || botToken.includes('PASTE_')) {
		throw new Error(
			'Укажите botToken и chatId в файле js/telegram-config.js (скопируйте из telegram-config.example.js)'
		);
	}

	return { botToken, chatId };
}

function ensureTelegramIframe() {
	let iframe = document.getElementById(IFRAME_NAME);
	if (!iframe) {
		iframe = document.createElement('iframe');
		iframe.name = IFRAME_NAME;
		iframe.id = IFRAME_NAME;
		iframe.title = 'telegram';
		iframe.setAttribute('aria-hidden', 'true');
		iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none;left:-9999px;';
		document.body.appendChild(iframe);
	}
	return iframe;
}

/**
 * Прямая отправка в Telegram Bot API через form+iframe.
 * fetch() к api.telegram.org из браузера блокируется CORS — form POST работает.
 */
function postTelegram(method, fields, fileField = null) {
	return new Promise((resolve, reject) => {
		try {
			const { botToken } = getTelegramConfig();
			ensureTelegramIframe();

			const form = document.createElement('form');
			form.method = 'POST';
			form.action = `https://api.telegram.org/bot${botToken}/${method}`;
			form.target = IFRAME_NAME;
			form.enctype = fileField ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
			form.style.display = 'none';

			Object.entries(fields).forEach(([key, value]) => {
				if (value === undefined || value === null || value === '') return;
				const input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = String(value);
				form.appendChild(input);
			});

			if (fileField?.file) {
				const input = document.createElement('input');
				input.type = 'file';
				input.name = fileField.name || 'photo';
				input.style.display = 'none';

				const transfer = new DataTransfer();
				transfer.items.add(fileField.file);
				input.files = transfer.files;
				form.appendChild(input);
			}

			document.body.appendChild(form);
			form.submit();
			form.remove();

			// Ответ iframe не читается (cross-origin) — ждём отправку запроса
			window.setTimeout(() => resolve({ ok: true }), 700);
		} catch (error) {
			reject(error);
		}
	});
}

async function sendTelegramMessage(text) {
	const { chatId } = getTelegramConfig();
	return postTelegram('sendMessage', {
		chat_id: chatId,
		text,
		parse_mode: 'HTML',
		disable_web_page_preview: 'true',
	});
}

async function sendTelegramPhotoUrl(photoUrl, caption = '') {
	const { chatId } = getTelegramConfig();
	const fields = {
		chat_id: chatId,
		photo: photoUrl,
	};
	if (caption) {
		fields.caption = caption.slice(0, 1024);
		fields.parse_mode = 'HTML';
	}
	return postTelegram('sendPhoto', fields);
}

async function sendTelegramPhotoFile(file, caption = '') {
	const { chatId } = getTelegramConfig();
	const fields = {
		chat_id: chatId,
	};
	if (caption) {
		fields.caption = caption.slice(0, 1024);
		fields.parse_mode = 'HTML';
	}
	return postTelegram('sendPhoto', fields, { name: 'photo', file });
}

function buildSubscribeMessage(fields) {
	return [
		'<b>📰 Рассылка новостей и акций</b>',
		'',
		line('Пометка', fields.note || 'Рассылка новостей и акций'),
		line('Email', fields.email),
	].filter(Boolean).join('\n');
}

function buildProductMessage(fields) {
	return [
		'<b>📦 Заявка на товар</b>',
		'',
		line('Товар', fields.product || '—'),
		line('Цена', fields.price || '—'),
		line('Имя', fields.name),
		line('Телефон', fields.phone),
	].filter(Boolean).join('\n');
}

function buildCustomMessage(fields) {
	return [
		'<b>✏️ Заявка на изготовление</b>',
		'',
		line('Описание', fields.message),
		line('Имя', fields.name),
		line('Телефон', fields.phone),
		line('Email', fields.email),
	].filter(Boolean).join('\n');
}

function buildCheckoutMessage(fields, cart) {
	const lines = ['<b>🛒 Новый заказ с сайта</b>', ''];
	lines.push(line('Имя', fields.name));
	lines.push(line('Телефон', fields.phone));
	lines.push(line('Адрес', fields.address));
	lines.push(line('Комментарий', fields.comment));

	if (cart?.items?.length) {
		lines.push('', '<b>Состав заказа:</b>');
		cart.items.forEach((item, index) => {
			const qty = item.quantity || 1;
			const price = item.price || 0;
			lines.push(
				`${index + 1}. ${escapeHtml(item.title)} — ${qty} шт., ${price * qty} BYN`
			);
		});
		lines.push('', `<b>Итого:</b> ${escapeHtml(cart.total)} BYN`);
	}

	return lines.filter(Boolean).join('\n');
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
	getTelegramConfig();

	if (type === 'product') {
		const fields = collectProductOrderFields(form);

		if (!fields.productId || !fields.product) {
			throw new Error('Не выбран товар. Откройте карточку товара и попробуйте снова.');
		}

		const text = buildProductMessage(fields);
		const imageUrl = fields.productImage ? toAbsoluteImageUrl(fields.productImage) : '';

		if (imageUrl) {
			try {
				await sendTelegramPhotoUrl(imageUrl, text);
				return { ok: true };
			} catch {
				// fallback to text
			}
		}

		await sendTelegramMessage(text);
		return { ok: true };
	}

	if (type === 'subscribe') {
		const email = form.querySelector('[name="email"]')?.value?.trim() || '';
		if (!email) {
			throw new Error('Введите корректный email');
		}

		await sendTelegramMessage(
			buildSubscribeMessage({
				email,
				note: 'Рассылка новостей и акций',
			})
		);
		return { ok: true };
	}

	const fields = collectFormFields(form);
	await sendTelegramMessage(buildCustomMessage(fields));

	const files = [];
	form.querySelectorAll('input[type="file"]').forEach((input) => {
		Array.from(input.files || []).forEach((file) => files.push(file));
	});

	for (let index = 0; index < files.length; index += 1) {
		const caption = files.length === 1 ? 'Фото к заявке' : '';
		try {
			await sendTelegramPhotoFile(files[index], caption);
		} catch {
			// текст уже отправлен
		}
	}

	return { ok: true };
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
	getTelegramConfig();

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

	const cartPayload = {
		items,
		total: formatCartPrice(getCartTotalPrice(cart)),
	};

	await sendTelegramMessage(buildCheckoutMessage(fields, cartPayload));

	for (let index = 0; index < items.length; index += 1) {
		const item = items[index];
		if (!item.image) continue;
		try {
			await sendTelegramPhotoUrl(
				item.image,
				`${index + 1}. ${item.title}`.slice(0, 1024)
			);
		} catch {
			// ignore photo errors
		}
	}

	return { ok: true };
}

import 'dotenv/config';

function getTelegramConfig() {
	return {
		botToken: process.env.TELEGRAM_BOT_TOKEN,
		chatId: process.env.TELEGRAM_CHAT_ID,
	};
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

function buildCheckoutMessage({ fields, cart }) {
	const lines = ['<b>🛒 Новый заказ с сайта</b>', ''];
	lines.push(line('Имя', fields.name));
	lines.push(line('Телефон', fields.phone));
	lines.push(line('E-mail', fields.email));
	lines.push(line('Адрес', fields.address));
	lines.push(line('Комментарий', fields.comment));

	if (cart?.items?.length) {
		lines.push('', '<b>Состав заказа:</b>');
		cart.items.forEach((item, index) => {
			const qty = item.quantity || 1;
			const price = item.price || 0;
			const sum = price * qty;
			lines.push(
				`${index + 1}. ${escapeHtml(item.title)} — ${qty} шт., ${sum} BYN`
			);
		});
		lines.push('', `<b>Итого:</b> ${escapeHtml(cart.total)} BYN`);
	}

	return lines.filter(Boolean).join('\n');
}

function buildProductMessage({ fields }) {
	const lines = ['<b>📦 Заявка на товар</b>', ''];
	lines.push(line('Товар', fields.product || '—'));
	lines.push(line('Цена', fields.price || '—'));
	lines.push(line('Имя', fields.name));
	lines.push(line('Телефон', fields.phone));
	return lines.filter(Boolean).join('\n');
}

function buildCustomMessage({ fields }) {
	const lines = ['<b>✏️ Заявка на изготовление</b>', ''];
	lines.push(line('Описание', fields.message));
	return lines.filter(Boolean).join('\n');
}

function buildMessage(payload) {
	switch (payload.type) {
		case 'checkout':
			return buildCheckoutMessage(payload);
		case 'product':
			return buildProductMessage(payload);
		case 'custom':
		default:
			return buildCustomMessage(payload);
	}
}

async function telegramRequest(method, body, isFormData = false) {
	const { botToken, chatId } = getTelegramConfig();

	if (!botToken) {
		throw new Error('TELEGRAM_BOT_TOKEN is not configured');
	}
	if (!chatId) {
		throw new Error('TELEGRAM_CHAT_ID is not configured');
	}

	const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
		method: 'POST',
		headers: isFormData ? body.getHeaders?.() : { 'Content-Type': 'application/json' },
		body: isFormData ? body : JSON.stringify(body),
	});

	const data = await response.json();
	if (!data.ok) {
		throw new Error(data.description || `Telegram API error (${method})`);
	}

	return data;
}

export async function sendTelegramMessage(text) {
	const { chatId } = getTelegramConfig();

	return telegramRequest('sendMessage', {
		chat_id: chatId,
		text,
		parse_mode: 'HTML',
		disable_web_page_preview: true,
	});
}

export async function sendTelegramPhoto(buffer, filename, caption = '') {
	const { botToken, chatId } = getTelegramConfig();

	if (!botToken || !chatId) {
		throw new Error('Telegram credentials are not configured');
	}

	const formData = new FormData();
	formData.append('chat_id', chatId);
	formData.append('photo', new Blob([buffer]), filename || 'photo.jpg');
	if (caption) {
		formData.append('caption', caption.slice(0, 1024));
		formData.append('parse_mode', 'HTML');
	}

	const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
		method: 'POST',
		body: formData,
	});

	const data = await response.json();
	if (!data.ok) {
		throw new Error(data.description || 'Telegram sendPhoto failed');
	}

	return data;
}

export async function sendOrderToTelegram(payload) {
	const text = buildMessage(payload);

	if (payload.type === 'product') {
		if (payload.productImageBuffer) {
			try {
				await sendTelegramPhoto(payload.productImageBuffer, 'product.jpg', text);
			} catch (photoError) {
				console.warn('Product photo send failed, sending text only:', photoError.message);
				await sendTelegramMessage(text);
			}
		} else {
			await sendTelegramMessage(text);
		}
		return;
	}

	await sendTelegramMessage(text);

	const cartImages = payload.cartImages || [];
	for (let index = 0; index < cartImages.length; index += 1) {
		const { buffer, title } = cartImages[index];
		const caption = `${index + 1}. ${title}`.slice(0, 1024);

		try {
			await sendTelegramPhoto(buffer, `cart-item-${index + 1}.jpg`, caption);
		} catch (error) {
			console.warn('Cart photo send failed:', title, error.message);
		}
	}

	if (payload.type === 'checkout') {
		return;
	}

	const files = payload.files || [];
	for (let index = 0; index < files.length; index += 1) {
		const file = files[index];
		const caption = index === 0 && files.length === 1 ? 'Фото к заявке' : '';
		await sendTelegramPhoto(file.buffer, file.originalname || `photo-${index + 1}.jpg`, caption);
	}
}

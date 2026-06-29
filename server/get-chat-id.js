import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
	console.error('Add TELEGRAM_BOT_TOKEN to .env first.');
	process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
const data = await response.json();

if (!data.ok) {
	console.error('Telegram error:', data.description);
	process.exit(1);
}

const chats = new Map();

for (const update of data.result || []) {
	const message = update.message || update.edited_message;
	if (!message?.chat) continue;

	const chat = message.chat;
	const key = chat.id;
	chats.set(key, {
		id: chat.id,
		type: chat.type,
		title: chat.title,
		username: chat.username,
		first_name: chat.first_name,
		last_name: chat.last_name,
	});
}

if (!chats.size) {
	console.log('No messages yet. Open your bot in Telegram, send /start, then run this script again.');
	process.exit(0);
}

console.log('Use one of these values as TELEGRAM_CHAT_ID in .env:\n');
for (const chat of chats.values()) {
	const label = chat.title || chat.username || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || 'chat';
	console.log(`- ${chat.id} (${chat.type}: ${label})`);
}

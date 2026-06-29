import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOrderRouter } from './order-router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const port = Number(process.env.PORT || 3000);

const app = express();
app.use('/api', createOrderRouter());
app.use(express.static(distDir));

app.listen(port, () => {
	console.log(`MNOGOGRANNIK server: http://localhost:${port}`);
	if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
		console.warn('Warning: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
	}
});

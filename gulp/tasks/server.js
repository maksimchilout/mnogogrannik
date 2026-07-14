import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createOrderRouter } from '../../server/order-router.js';

const API_PORT = 3001;

export const server = (done) => {
	const api = express();
	// Подключаем роутер так, чтобы изменения server/*.js подхватывались после перезапуска gulp
	api.use('/api', createOrderRouter());

	const apiServer = api.listen(API_PORT, '127.0.0.1', () => {
		console.log(`Order API: http://127.0.0.1:${API_PORT}/api/order`);

		app.plugins.browsersync.init({
			server: {
				baseDir: `${app.path.build.html}`,
				middleware: [
					createProxyMiddleware('/api', {
						target: `http://127.0.0.1:${API_PORT}`,
						changeOrigin: true,
					}),
				],
			},
			notify: false,
			port: 3000,
		});

		done();
	});

	apiServer.on('error', (error) => {
		if (error.code === 'EADDRINUSE') {
			console.error(`Port ${API_PORT} is busy. Stop the old process and restart npm run dev.`);
		}
		throw error;
	});
};

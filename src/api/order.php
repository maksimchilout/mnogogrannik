<?php
/**
 * API заявок для обычного PHP-хостинга (Beget, Timeweb, REG.RU и т.п.).
 * Фронт шлёт POST multipart на /api/order.php (и /api/order через .htaccess)
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	header('Access-Control-Allow-Methods: POST, OPTIONS');
	header('Access-Control-Allow-Headers: Content-Type');
	http_response_code(204);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(array('ok' => false, 'error' => 'Method not allowed'));
	exit;
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
	http_response_code(500);
	echo json_encode(array(
		'ok' => false,
		'error' => 'Создайте api/config.php из config.example.php и укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID',
	));
	exit;
}

$config = require $configPath;
$botToken = trim((string)(isset($config['TELEGRAM_BOT_TOKEN']) ? $config['TELEGRAM_BOT_TOKEN'] : ''));
$chatId = trim((string)(isset($config['TELEGRAM_CHAT_ID']) ? $config['TELEGRAM_CHAT_ID'] : ''));

if ($botToken === '' || $chatId === '' || strpos($botToken, 'PASTE_') !== false) {
	http_response_code(500);
	echo json_encode(array('ok' => false, 'error' => 'Telegram credentials are not configured'));
	exit;
}

function respond($ok, $error = '', $code = 200) {
	http_response_code($code);
	echo json_encode($ok ? array('ok' => true) : array('ok' => false, 'error' => $error));
	exit;
}

function tg_substr($value, $length) {
	$value = (string)$value;
	if (function_exists('mb_substr')) {
		return mb_substr($value, 0, $length);
	}
	return substr($value, 0, $length);
}

function escape_html($value) {
	return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function line($label, $value) {
	if ($value === null || $value === '') {
		return '';
	}
	return '<b>' . escape_html($label) . ':</b> ' . escape_html($value);
}

function parse_json_field($value, $fallback = null) {
	if ($value === null || $value === '') {
		return $fallback;
	}
	$data = json_decode((string)$value, true);
	return is_array($data) ? $data : $fallback;
}

function filter_lines($lines) {
	$result = array();
	foreach ($lines as $line) {
		if ($line !== '') {
			$result[] = $line;
		}
	}
	return implode("\n", $result);
}

function build_message($type, $fields, $cart) {
	$type = strtolower(trim((string)$type));

	if ($type === 'subscribe') {
		return filter_lines(array(
			'<b>📰 Рассылка новостей и акций</b>',
			'',
			line('Пометка', isset($fields['note']) ? $fields['note'] : 'Рассылка новостей и акций'),
			line('Email', isset($fields['email']) ? $fields['email'] : ''),
		));
	}

	if ($type === 'product') {
		return filter_lines(array(
			'<b>📦 Заявка на товар</b>',
			'',
			line('Товар', isset($fields['product']) ? $fields['product'] : '—'),
			line('Цена', isset($fields['price']) ? $fields['price'] : '—'),
			line('Имя', isset($fields['name']) ? $fields['name'] : ''),
			line('Телефон', isset($fields['phone']) ? $fields['phone'] : ''),
		));
	}

	if ($type === 'checkout') {
		$lines = array('<b>🛒 Новый заказ с сайта</b>', '');
		$lines[] = line('Имя', isset($fields['name']) ? $fields['name'] : '');
		$lines[] = line('Телефон', isset($fields['phone']) ? $fields['phone'] : '');
		$lines[] = line('Адрес', isset($fields['address']) ? $fields['address'] : '');
		$lines[] = line('Комментарий', isset($fields['comment']) ? $fields['comment'] : '');

		if (!empty($cart['items']) && is_array($cart['items'])) {
			$lines[] = '';
			$lines[] = '<b>Состав заказа:</b>';
			foreach ($cart['items'] as $index => $item) {
				$qty = (int)(isset($item['quantity']) ? $item['quantity'] : 1);
				$price = (float)(isset($item['price']) ? $item['price'] : 0);
				$sum = $price * $qty;
				$title = escape_html(isset($item['title']) ? $item['title'] : 'Товар');
				$lines[] = ($index + 1) . ". {$title} — {$qty} шт., {$sum} BYN";
			}
			$lines[] = '';
			$lines[] = '<b>Итого:</b> ' . escape_html(isset($cart['total']) ? $cart['total'] : '') . ' BYN';
		}

		return filter_lines($lines);
	}

	return filter_lines(array(
		'<b>✏️ Заявка на изготовление</b>',
		'',
		line('Описание', isset($fields['message']) ? $fields['message'] : ''),
		line('Имя', isset($fields['name']) ? $fields['name'] : ''),
		line('Телефон', isset($fields['phone']) ? $fields['phone'] : ''),
		line('Email', isset($fields['email']) ? $fields['email'] : ''),
	));
}

function telegram_api($botToken, $method, $fields, $files = array()) {
	$url = "https://api.telegram.org/bot{$botToken}/{$method}";

	$postFields = $fields;
	foreach ($files as $key => $file) {
		$postFields[$key] = new CURLFile(
			$file['tmp_name'],
			!empty($file['type']) ? $file['type'] : 'application/octet-stream',
			!empty($file['name']) ? $file['name'] : 'file.jpg'
		);
	}

	$ch = curl_init($url);
	curl_setopt_array($ch, array(
		CURLOPT_POST => true,
		CURLOPT_POSTFIELDS => $postFields,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_CONNECTTIMEOUT => 15,
		CURLOPT_TIMEOUT => 60,
	));

	$raw = curl_exec($ch);
	$error = curl_error($ch);
	$code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	if ($raw === false) {
		throw new RuntimeException($error ? $error : 'Telegram request failed');
	}

	$data = json_decode($raw, true);
	if (!is_array($data) || empty($data['ok'])) {
		$desc = is_array($data) && !empty($data['description']) ? $data['description'] : "HTTP {$code}";
		throw new RuntimeException($desc);
	}

	return $data;
}

function send_message($botToken, $chatId, $text) {
	telegram_api($botToken, 'sendMessage', array(
		'chat_id' => $chatId,
		'text' => $text,
		'parse_mode' => 'HTML',
		'disable_web_page_preview' => 'true',
	));
}

function send_photo_from_url($botToken, $chatId, $imageUrl, $caption = '') {
	$tmp = tempnam(sys_get_temp_dir(), 'tgimg_');
	if ($tmp === false) {
		return false;
	}

	$ch = curl_init($imageUrl);
	$fp = fopen($tmp, 'wb');
	curl_setopt_array($ch, array(
		CURLOPT_FILE => $fp,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_CONNECTTIMEOUT => 10,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_USERAGENT => 'mnogogrannik-order-api/1.0',
	));
	$ok = curl_exec($ch);
	$code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);
	fclose($fp);

	if (!$ok || $code >= 400 || !is_file($tmp) || filesize($tmp) < 32) {
		@unlink($tmp);
		return false;
	}

	$fields = array('chat_id' => $chatId);
	if ($caption !== '') {
		$fields['caption'] = tg_substr($caption, 1024);
		$fields['parse_mode'] = 'HTML';
	}

	try {
		telegram_api($botToken, 'sendPhoto', $fields, array(
			'photo' => array(
				'tmp_name' => $tmp,
				'type' => 'image/jpeg',
				'name' => 'photo.jpg',
			),
		));
		@unlink($tmp);
		return true;
	} catch (Exception $e) {
		@unlink($tmp);
		return false;
	}
}

function send_photo_upload($botToken, $chatId, $file, $caption = '') {
	$error = isset($file['error']) ? $file['error'] : UPLOAD_ERR_NO_FILE;
	if ($error !== UPLOAD_ERR_OK) {
		return;
	}

	$fields = array('chat_id' => $chatId);
	if ($caption !== '') {
		$fields['caption'] = tg_substr($caption, 1024);
		$fields['parse_mode'] = 'HTML';
	}

	telegram_api($botToken, 'sendPhoto', $fields, array(
		'photo' => array(
			'tmp_name' => $file['tmp_name'],
			'type' => isset($file['type']) ? $file['type'] : 'image/jpeg',
			'name' => isset($file['name']) ? $file['name'] : 'photo.jpg',
		),
	));
}

try {
	if (!function_exists('curl_init')) {
		respond(false, 'На хостинге нужно включить PHP curl', 500);
	}

	$type = isset($_POST['type']) ? (string)$_POST['type'] : 'custom';
	$fields = parse_json_field(isset($_POST['fields']) ? $_POST['fields'] : null, array());
	if (!is_array($fields)) {
		$fields = array();
	}
	$cart = parse_json_field(isset($_POST['cart']) ? $_POST['cart'] : null, null);
	$productImageUrl = '';
	if (isset($_POST['productImageUrl'])) {
		$productImageUrl = trim((string)$_POST['productImageUrl']);
	} elseif (isset($fields['productImage'])) {
		$productImageUrl = trim((string)$fields['productImage']);
	}

	if ($type === 'subscribe') {
		$email = isset($fields['email']) ? trim((string)$fields['email']) : '';
		if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
			respond(false, 'Введите корректный email', 400);
		}
		$fields['email'] = $email;
	}

	if ($type === 'product') {
		$productId = isset($fields['productId']) ? trim((string)$fields['productId']) : '';
		$product = isset($fields['product']) ? trim((string)$fields['product']) : '';
		if ($productId === '' || $product === '') {
			respond(false, 'Не выбран товар. Откройте карточку товара и попробуйте снова.', 400);
		}
	}

	$text = build_message($type, $fields, $cart);

	if ($type === 'product') {
		$sentPhoto = false;
		if ($productImageUrl !== '') {
			$sentPhoto = send_photo_from_url($botToken, $chatId, $productImageUrl, $text);
		}
		if (!$sentPhoto) {
			send_message($botToken, $chatId, $text);
		}
		respond(true);
	}

	send_message($botToken, $chatId, $text);

	if ($type === 'checkout' && !empty($cart['items']) && is_array($cart['items'])) {
		foreach ($cart['items'] as $index => $item) {
			$image = isset($item['image']) ? trim((string)$item['image']) : '';
			if ($image === '') {
				continue;
			}
			$title = isset($item['title']) ? $item['title'] : 'Товар';
			$caption = tg_substr(($index + 1) . '. ' . $title, 1024);
			send_photo_from_url($botToken, $chatId, $image, $caption);
		}
		respond(true);
	}

	if ($type !== 'product' && $type !== 'subscribe' && $type !== 'checkout' && !empty($_FILES['files'])) {
		$files = $_FILES['files'];
		$normalized = array();

		if (is_array($files['name'])) {
			$count = count($files['name']);
			for ($i = 0; $i < $count; $i++) {
				$normalized[] = array(
					'name' => $files['name'][$i],
					'type' => $files['type'][$i],
					'tmp_name' => $files['tmp_name'][$i],
					'error' => $files['error'][$i],
					'size' => $files['size'][$i],
				);
			}
		} else {
			$normalized[] = $files;
		}

		foreach ($normalized as $file) {
			$caption = (count($normalized) === 1) ? 'Фото к заявке' : '';
			try {
				send_photo_upload($botToken, $chatId, $file, $caption);
			} catch (Exception $e) {
				// текст уже ушёл
			}
		}
	}

	respond(true);
} catch (Exception $e) {
	$msg = $e->getMessage();
	respond(false, $msg ? $msg : 'Order send failed', 500);
}

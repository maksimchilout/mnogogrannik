function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function parseFrontmatter(raw) {
	const source = String(raw || '').replace(/^\uFEFF/, '');
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) {
		return { data: {}, body: source.trim() };
	}

	const data = {};
	for (const line of match[1].split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const sep = trimmed.indexOf(':');
		if (sep === -1) continue;
		const key = trimmed.slice(0, sep).trim();
		let value = trimmed.slice(sep + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		data[key] = value;
	}

	return { data, body: match[2].trim() };
}

function renderInline(text) {
	const placeholders = [];
	const stash = (html) => {
		const token = `@@INL${placeholders.length}@@`;
		placeholders.push(html);
		return token;
	};

	let value = String(text || '');
	value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
		stash(`<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
	);
	value = value.replace(/\*\*([^*]+)\*\*/g, (_, inner) => stash(`<strong>${escapeHtml(inner)}</strong>`));
	value = escapeHtml(value);
	value = value.replace(/@@INL(\d+)@@/g, (_, index) => placeholders[Number(index)] || '');
	return value;
}

function isTableSeparator(line) {
	return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
	return line
		.replace(/^\s*\|/, '')
		.replace(/\|\s*$/, '')
		.split('|')
		.map((cell) => cell.trim());
}

function renderTable(rows) {
	if (rows.length < 2) return '';
	const head = splitTableRow(rows[0]);
	const body = rows.slice(2).map(splitTableRow);
	const thead = `<thead><tr>${head.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr></thead>`;
	const tbody = `<tbody>${body
		.map((cells) => `<tr>${cells.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
		.join('')}</tbody>`;
	return `<div class="blog-article__table-wrap"><table class="blog-article__table">${thead}${tbody}</table></div>`;
}

function renderList(items, ordered) {
	const tag = ordered ? 'ol' : 'ul';
	const lis = items
		.map((item) => `<li>${renderInline(item)}</li>`)
		.join('');
	return `<${tag}>${lis}</${tag}>`;
}

export function renderMarkdown(markdown) {
	const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
	const html = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) {
			i += 1;
			continue;
		}

		if (/^#{1,6}\s+/.test(line)) {
			const level = line.match(/^#+/)[0].length;
			const text = line.replace(/^#{1,6}\s+/, '');
			html.push(`<h${level}>${renderInline(text)}</h${level}>`);
			i += 1;
			continue;
		}

		if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
			const rows = [line, lines[i + 1]];
			i += 2;
			while (i < lines.length && lines[i].includes('|')) {
				rows.push(lines[i]);
				i += 1;
			}
			html.push(renderTable(rows));
			continue;
		}

		const ulMatch = line.match(/^\s*[-*]\s+(.+)/);
		if (ulMatch) {
			const items = [];
			while (i < lines.length) {
				const itemMatch = lines[i].match(/^\s*[-*]\s+(.+)/);
				if (!itemMatch) break;
				items.push(itemMatch[1]);
				i += 1;
			}
			html.push(renderList(items, false));
			continue;
		}

		const olMatch = line.match(/^\s*\d+\.\s+(.+)/);
		if (olMatch) {
			const items = [];
			while (i < lines.length) {
				const itemMatch = lines[i].match(/^\s*\d+\.\s+(.+)/);
				if (!itemMatch) break;
				items.push(itemMatch[1]);
				i += 1;
			}
			html.push(renderList(items, true));
			continue;
		}

		const para = [line];
		i += 1;
		while (
			i < lines.length &&
			lines[i].trim() &&
			!/^#{1,6}\s+/.test(lines[i]) &&
			!/^\s*[-*]\s+/.test(lines[i]) &&
			!/^\s*\d+\.\s+/.test(lines[i]) &&
			!(lines[i].includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
		) {
			para.push(lines[i]);
			i += 1;
		}
		html.push(`<p>${renderInline(para.join(' '))}</p>`);
	}

	return html.join('\n');
}

export function firstParagraph(markdown) {
	const text = String(markdown || '')
		.replace(/^#\s+.+$/m, '')
		.trim();
	const block = text.split(/\n\s*\n/)[0] || text;
	return block.replace(/\s+/g, ' ').trim();
}

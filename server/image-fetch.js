export async function fetchImageBuffer(url) {
	const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.status} (${url})`);
	}

	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

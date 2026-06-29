let activeSnapshot = null;

export function setProductOrderSnapshot(data) {
	if (!data) {
		activeSnapshot = null;
		return;
	}

	activeSnapshot = {
		productId: String(data.productId ?? ''),
		product: String(data.product ?? ''),
		price: String(data.price ?? ''),
		productImage: String(data.productImage ?? ''),
	};
}

export function getProductOrderSnapshot() {
	return activeSnapshot ? { ...activeSnapshot } : null;
}

export function clearProductOrderSnapshot() {
	activeSnapshot = null;
}

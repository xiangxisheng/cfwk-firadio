
export function generateRandom(digits: number, charList: string = '0123456789'): string {
	if (digits <= 0) {
		// Handle non-positive digits
		return '';
	}

	const charListLength = charList.length;
	if (charListLength === 0) {
		// Handle empty charList
		throw new Error('charList cannot be empty');
	}

	// Calculate the maximum chunk size based on precision limits
	const chunkSize = Math.floor(Math.log10(Number.MAX_SAFE_INTEGER) / Math.log10(charListLength));
	const chunks: string[] = [];

	while (digits > 0) {
		const currentChunkSize = Math.min(digits, chunkSize);
		const randomChunk: string[] = [];
		let randomValue = Math.floor(Math.random() * Math.pow(charListLength, currentChunkSize));

		for (let i = 0; i < currentChunkSize; i++) {
			randomChunk.push(charList[randomValue % charListLength]);
			randomValue = Math.floor(randomValue / charListLength);
		}

		chunks.push(randomChunk.reverse().join('')); // Reverse to get the correct order
		digits -= currentChunkSize;
	}

	return chunks.join('');
}

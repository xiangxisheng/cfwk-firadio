const modules: Record<string, any> = {};

async function cf_crypto_encode(name: string, content: string): Promise<string> {
	const myDigest = await crypto.subtle.digest(
		{
			name,
		},
		new TextEncoder().encode(content)
	);
	return [...new Uint8Array(myDigest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function node_crypto_encode(name: string, content: string) {
	const moduleName = 'crypto';
	modules.crypto = modules.crypto ? modules.crypto : require(moduleName);
	const hash = modules.crypto.createHash(name);
	hash.update(content);
	return hash.digest('hex');
}

export async function md5(content: string): Promise<string> {
	try {
		return await cf_crypto_encode('MD5', content);
	} catch (e) {}
	return node_crypto_encode('MD5', content);
}

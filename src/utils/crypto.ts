
export async function md5(content: string): Promise<string> {
	const myDigest = await crypto.subtle.digest(
		{
			name: 'MD5',
		},
		new TextEncoder().encode(content)
	);
	return [...new Uint8Array(myDigest)]
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')
}


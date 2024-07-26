// 生成CRC32查找表
const generateCrc32Table = () => {
	let table = new Array(256);
	for (let i = 0; i < 256; i++) {
		let crc = i;
		for (let j = 0; j < 8; j++) {
			if (crc & 1) {
				crc = (crc >>> 1) ^ 0xEDB88320;
			} else {
				crc = crc >>> 1;
			}
		}
		table[i] = crc;
	}
	return table;
};

const crc32Table = generateCrc32Table();

// 计算CRC32
const crc32 = (input: string) => {
	let crc = 0xFFFFFFFF;
	for (let i = 0; i < input.length; i++) {
		let byte = input.charCodeAt(i);
		crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xFF];
	}
	return (crc ^ 0xFFFFFFFF) >>> 0;
};

// 将字符串转换为字节数组
const stringToByteArray = (str: string) => {
	let byteArray = [];
	for (let i = 0; i < str.length; i++) {
		byteArray.push(str.charCodeAt(i) & 0xFF);
	}
	return byteArray;
};

const test = () => {
	// 测试CRC32计算
	const testString = "Hello, World!";
	const crcValue = crc32(testString);
	console.log(`CRC32 of "${testString}" is: ${crcValue.toString(16).toUpperCase()}`);
};

export {
	crc32 as default
};

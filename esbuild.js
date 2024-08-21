(async () => {
	const serverProcesses = [];
	const esbuild = require('esbuild');
	const { fork } = require('child_process');
	const config = {
		entryPoints: ['./src/server.ts'],
		bundle: true,
		minify: true,
		sourcemap: true,
		platform: 'node',
		outfile: 'build/server.js',
		plugins: [
			{
				name: 'rebuild-notify',
				setup(build) {
					build.onEnd((result) => {
						console.log(`build ended with ${result.errors.length} errors`);
						// HERE: somehow restart the server from here, e.g., by sending a signal that you trap and react to inside the server.
						if (result.errors.length === 0) {
							for (const process of serverProcesses) {
								process.kill();
							}
							serverProcesses.push(fork('build/server.js'));
						}
					});
				},
			},
		],
	};
	const ctx = await esbuild.context(config);
	await ctx.watch();
})();

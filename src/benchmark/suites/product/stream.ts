import * as path from 'path';
import * as bencho from 'bencho';

import * as fastGlob from 'fast-glob';

import * as utils from '../../utils';

type GlobImplementation = 'fast-glob';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	constructor(private readonly _cwd: string, private readonly _pattern: string) {}

	public async measureFastGlob(): Promise<void> {
		const options: fastGlob.Options = {
			cwd: this._cwd,
			unique: false,
			followSymbolicLinks: false
		};

		const action = new Promise<string[]>((resolve, reject) => {
			const entries: string[] = [];

			const stream = fastGlob.stream(this._pattern, options);

			stream.once('error', (error) => reject(error));
			stream.on('data', (entry: string) => entries.push(entry));
			stream.once('end', () => resolve(entries));
		});

		await this._measure(() => action);
	}

	private async _measure(func: GlobImplFunction): Promise<void> {
		const timeStart = utils.timeStart();

		const matches = await func();

		console.dir(matches, { colors: true });

		const count = matches.length;
		const memory = utils.getMemory();
		const time = utils.timeEnd(timeStart);

		bencho.memory('memory', memory);
		bencho.time('time', time);
		bencho.value('count', count);
	}
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
	const args = process.argv.slice(2);

	const cwd = path.join(process.cwd(), args[0]);
	const pattern = args[1];
	const impl = args[2] as GlobImplementation;

	const glob = new Glob(cwd, pattern);

	switch (impl) {
		case 'fast-glob':
			await glob.measureFastGlob();
			break;

		default:
			throw new TypeError(`Unknown glob implementation: ${impl}`);
	}
})();

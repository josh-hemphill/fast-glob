import * as path from 'path';
import * as bencho from 'bencho';

import * as nodeGlob from 'glob';
import * as fastGlob from 'fast-glob';
import { fdir as GlobBuilder, PathsOutput } from 'fdir';

import * as utils from '../../utils';

type GlobImplementation = 'node-glob' | 'fast-glob' | 'fdir';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => Promise<unknown[]>;

class Glob {
	constructor(private readonly _cwd: string, private readonly _pattern: string) {}

	public async measureNodeGlob(): Promise<void> {
		const options: nodeGlob.IOptions = {
			cwd: this._cwd,
			nosort: true,
			nounique: true,
			nodir: true
		};

		const action = new Promise<string[]>((resolve, reject) => {
			nodeGlob(this._pattern, options, (error, matches) => {
				if (error !== null) {
					return reject(error);
				}

				resolve(matches);
			});
		});

		await this._measure(() => action);
	}

	public async measureFastGlob(): Promise<void> {
		const options: fastGlob.Options = {
			cwd: this._cwd,
			unique: false,
			followSymbolicLinks: false
		};

		await this._measure(() => fastGlob(this._pattern, options));
	}

	public async measureFdir(): Promise<void> {
		const fdir = new GlobBuilder()
			.glob(this._pattern)
			.crawl(this._cwd);

		await this._measure(async () => {
			const matches = await fdir.withPromise();

			return matches as PathsOutput;
		});
	}

	private async _measure(func: GlobImplFunction): Promise<void> {
		const timeStart = utils.timeStart();

		const matches = await func();

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
		case 'node-glob':
			await glob.measureNodeGlob();
			break;

		case 'fast-glob':
			await glob.measureFastGlob();
			break;

		case 'fdir':
			await glob.measureFdir();
			break;

		default:
			throw new TypeError(`Unknown glob implementation: ${impl}`);
	}
})();

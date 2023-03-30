import * as path from 'path';
import * as bencho from 'bencho';

import * as fastGlobPrevious from 'fast-glob';
import * as fastGlobCurrent from '../../..';

import * as utils from '../../utils';

type GlobImplementation = 'previous' | 'current';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => unknown[];

class Glob {
	private readonly _options: fastGlobCurrent.Options;

	constructor(private readonly _pattern: string, options: fastGlobCurrent.Options) {
		this._options = {
			unique: false,
			followSymbolicLinks: false,
			...options
		};
	}

	public measurePreviousVersion(): void {
		this._measure(() => fastGlobPrevious.sync(this._pattern, this._options));
	}

	public measureCurrentVersion(): void {
		this._measure(() => fastGlobCurrent.sync(this._pattern, this._options));
	}

	private _measure(func: GlobImplFunction): void {
		const timeStart = utils.timeStart();

		const matches = func();

		const count = matches.length;
		const memory = utils.getMemory();
		const time = utils.timeEnd(timeStart);

		bencho.memory('memory', memory);
		bencho.time('time', time);
		bencho.value('count', count);
	}
}

const args = process.argv.slice(2);

const cwd = path.join(process.cwd(), args[0]);
const pattern = args[1];
const impl = args[2] as GlobImplementation;
const options = JSON.parse(args[3] ?? '{}');

const glob = new Glob(pattern, {
	cwd,
	...options
});

switch (impl) {
	case 'current':
		glob.measureCurrentVersion();
		break;

	case 'previous':
		glob.measurePreviousVersion();
		break;

	default:
		throw new TypeError(`Unknown glob implementation: ${impl}`);
}

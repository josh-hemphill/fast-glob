import * as path from 'path';
import * as bencho from 'bencho';

import * as nodeGlob from 'glob';
import * as fastGlob from 'fast-glob';
import { fdir as GlobBuilder, PathsOutput } from 'fdir';

import * as utils from '../../utils';

type GlobImplementation = 'node-glob' | 'fast-glob' | 'fdir';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GlobImplFunction = (...args: any[]) => unknown[];

class Glob {
	constructor(private readonly _cwd: string, private readonly _pattern: string) {}

	public measureNodeGlob(): void {
		const options: nodeGlob.IOptions = {
			cwd: this._cwd,
			nosort: true,
			nounique: true,
			nodir: true
		};

		this._measure(() => nodeGlob.sync(this._pattern, options));
	}

	public measureFastGlob(): void {
		const options: fastGlob.Options = {
			cwd: this._cwd,
			unique: false,
			followSymbolicLinks: false
		};

		this._measure(() => fastGlob.sync(this._pattern, options));
	}

	public measureFdir(): void {
		const fdir = new GlobBuilder()
			.glob(this._pattern)
			.crawl(this._cwd);

		this._measure(() => fdir.sync() as PathsOutput);
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

const glob = new Glob(cwd, pattern);

switch (impl) {
	case 'node-glob':
		glob.measureNodeGlob();
		break;

	case 'fast-glob':
		glob.measureFastGlob();
		break;

	case 'fdir':
		glob.measureFdir();
		break;

	default:
		throw new TypeError(`Unknown glob implementation: ${impl}`);
}

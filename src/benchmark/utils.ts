import { performance } from 'perf_hooks';
import { SuiteMeasures } from './runner';

import stdev = require('compute-stdev'); // eslint-disable-line @typescript-eslint/no-require-imports

export function timeStart(): number {
	return performance.now();
}

export function timeEnd(start: number): number {
	return performance.now() - start;
}

export function getMemory(): number {
	return process.memoryUsage().heapUsed;
}

export function formatMeasures(matches: number, time: number, memory: number): string {
	const measures: SuiteMeasures = { matches, time, memory };

	return JSON.stringify(measures);
}

export function getAverageValue(values: number[]): number {
	return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getStdev(values: number[]): number {
	return stdev(values);
}

export function getEnvironmentAsString(name: string, value: string): string {
	const environment = process.env[name];

	return environment === undefined ? value : environment;
}

export function getEnvironmentAsInteger(name: string, value: number): number {
	const environment = process.env[name];

	return environment === undefined ? value : parseInt(environment, 10);
}

export function getEnvironmentAsObject(name: string, value: object): object {
	const environment = process.env[name];

	return environment === undefined ? value : JSON.parse(environment) as object;
}

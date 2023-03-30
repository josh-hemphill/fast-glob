import { performance } from 'perf_hooks';

export function timeStart(): number {
	return performance.now();
}

export function timeEnd(start: number): number {
	return performance.now() - start;
}

export function getMemory(): number {
	return process.memoryUsage().heapUsed;
}

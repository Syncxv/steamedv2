import { Logger } from "@utils/Logger";
import { traceFunction } from "@utils/Tracer";
import { proxyLazy } from "@utils/lazy";
import { WebpackInstance } from "@webpack/types";

export let wreq: WebpackInstance;
export let cache: WebpackInstance["c"];

export type FilterFn = (mod: any) => boolean;
export type CallbackFn = (mod: any, id: number) => void;

export const subscriptions = new Map<FilterFn, CallbackFn>();
export const listeners = new Set<CallbackFn>();

const logger = new Logger("Webpack");

function extractPrivateCache(wreq: WebpackInstance) {
	let cache: any;
	const sym = Symbol("wpgrabber.extract");

	Object.defineProperty(Object.prototype, sym, {
		get() {
			cache = this;
			return { exports: {} };
		},
		set() {},
		configurable: true,
	});

	wreq(sym as any);
	delete Object.prototype[sym];
	if (cache) delete cache[sym];

	return cache as WebpackInstance["c"];
}

Object.defineProperty(Function.prototype, "m", {
	set(v) {
		const source = this.toString();
		if (
			source.includes("exports") &&
			(source.includes("false") || source.includes("!1")) &&
			!(
				Array.isArray(v) &&
				v?.some((m) => m.toString().includes("CHROME_WEBSTORE_EXTENSION_ID"))
			) // react devtools
		) {
			wreq = this;
			wreq.c ??= extractPrivateCache(wreq);
			cache = wreq.c;

			// debugger;
			delete (Function.prototype as any).m;
			this.m = v;
		} else {
			// huh not webpack_require
			Object.defineProperty(this, "m", {
				value: v,
				configurable: true,
				writable: true,
				enumerable: true,
			});
		}
	},
	configurable: true,
});

export const filters = {
	byProps:
		(...props): FilterFn =>
		(m) =>
			props.every((p) => m[p] !== void 0),
	byDisplayName:
		(displayName): FilterFn =>
		(m) =>
			m.displayName === displayName,
	byName:
		(name): FilterFn =>
		(m) =>
			m.name === name,
	byCode:
		(...codes): FilterFn =>
		(m) => {
			if (typeof m !== "function") return false;
			const code = Function.prototype.toString.call(m);
			return codes.every((c) => {
				if (typeof c === "string") return code.includes(c);
				if (c instanceof RegExp) {
					const matches = c.test(code);
					c.lastIndex = 0;
					return matches;
				}
				throw new Error(
					"findByCode: Expected one or more RegExp or string, got " + typeof c
				);
			});
		},
};

/**
 * Find the first module that matches the filter
 */
export const find = traceFunction(
	"find",
	function find(filter: FilterFn, getDefault = true, isWaitFor = false) {
		if (typeof filter !== "function")
			throw new Error(
				"Invalid filter. Expected a function got " + typeof filter
			);

		for (const key in cache) {
			const mod = cache[key];
			if (!mod?.exports) continue;

			if (filter(mod.exports)) {
				return isWaitFor ? [mod.exports, Number(key)] : mod.exports;
			}

			if (typeof mod.exports !== "object") continue;

			if (mod.exports.default && filter(mod.exports.default)) {
				const found = getDefault ? mod.exports.default : mod.exports;
				return isWaitFor ? [found, Number(key)] : found;
			}

			// the length check makes search about 20% faster
			for (const nestedMod in mod.exports)
				if (nestedMod.length <= 3) {
					const nested = mod.exports[nestedMod];
					if (nested && filter(nested)) {
						return isWaitFor ? [nested, Number(key)] : nested;
					}
				}
		}

		if (!isWaitFor) {
			const err = new Error("Didn't find module matching this filter");
			if (IS_DEV) {
				logger.error(err);
				logger.error(filter);
				// if (!devToolsOpen)
				// 	// Strict behaviour in DevBuilds to fail early and make sure the issue is found
				// 	throw err;
			} else {
				logger.warn(err);
			}
		}

		return isWaitFor ? [null, null] : null;
	}
);

/**
 * find but lazy
 */
export function findLazy(filter: FilterFn, getDefault = true) {
	return proxyLazy(() => find(filter, getDefault));
}

export function findAll(filter: FilterFn, getDefault = true) {
	if (typeof filter !== "function")
		throw new Error("Invalid filter. Expected a function got " + typeof filter);

	const ret = [] as any[];
	for (const key in cache) {
		const mod = cache[key];
		if (!mod?.exports) continue;

		if (filter(mod.exports)) ret.push(mod.exports);
		else if (typeof mod.exports !== "object") continue;

		if (mod.exports.default && filter(mod.exports.default))
			ret.push(getDefault ? mod.exports.default : mod.exports);
		else
			for (const nestedMod in mod.exports)
				if (nestedMod.length <= 3) {
					const nested = mod.exports[nestedMod];
					if (nested && filter(nested)) ret.push(nested);
				}
	}

	return ret;
}

export function findByProps(...props: string[]) {
	return find(filters.byProps(...props));
}

/**
 * findByProps but lazy
 */
export function findByPropsLazy(...props: string[]) {
	return findLazy(filters.byProps(...props));
}

/**
 * Find a function by its code
 */
export function findByCode(...code: string[]) {
	return find(filters.byCode(...code));
}

/**
 * findByCode but lazy
 */
export function findByCodeLazy(...code: string[]) {
	return findLazy(filters.byCode(...code));
}

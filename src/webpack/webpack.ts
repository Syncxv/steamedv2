import { WebpackInstance } from "@webpack/types";

export let wreq: WebpackInstance;
export let cache: WebpackInstance["c"];

export type FilterFn = (mod: any) => boolean;
export type CallbackFn = (mod: any, id: number) => void;

export const subscriptions = new Map<FilterFn, CallbackFn>();
export const listeners = new Set<CallbackFn>();

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

export function find(filter: FilterFn) {
	const values = Object.values(cache);
	for (const { exports } of values) {
		if (exports && filter(exports)) return exports;
		if (exports?.default && filter(exports.default)) return exports.default;
		if (typeof exports === "object" && exports !== window) {
			// Mangled exports
			for (const key in exports) {
				if (key.length > 3 || !exports[key]) continue;
				if (filter(exports[key])) return exports[key];
			}
		}
	}
	return null;
}

export function findAll(filter: FilterFn) {
	const results: WebpackInstance["c"][] = [];
	const values = Object.values(cache);
	for (const { exports } of values) {
		if (exports && filter(exports)) results.push(exports);
		else if (exports?.default && filter(exports.default))
			results.push(exports.default);
		if (typeof exports === "object" && exports !== window) {
			// Mangled exports
			for (const key in exports) {
				if (key.length > 3 || !exports[key]) continue;
				if (filter(exports[key])) {
					results.push(exports[key]);
					break;
				}
			}
		}
	}
	return results;
}

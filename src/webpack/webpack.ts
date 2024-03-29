import { proxyLazy } from "@utils/lazy";
import { Logger } from "@utils/Logger";
import { traceFunction } from "@utils/Tracer";
import { WebpackInstance } from "@webpack/types";

export let wreq: WebpackInstance;
export let _cache: WebpackInstance["c"];
export let _cache2: WebpackInstance["c2"];

export let cache;

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
                v?.some((m) =>
                    m.toString().includes("CHROME_WEBSTORE_EXTENSION_ID"),
                )
            ) // react devtools
        ) {
            wreq = this;
            wreq.c ??= extractPrivateCache(wreq);
            _cache = wreq.c;

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

// for some reason there are 2 webpacks. like 2 requires and 2 caches.
// now i have to keep track of both :|
Object.defineProperty(Function.prototype, "t", {
    set(v) {
        if (
            v &&
            v.toString &&
            v.toString().includes("__esModule") &&
            !this.amdO
        ) {
            console.log(":O", v, this);

            wreq.c2 ??= extractPrivateCache(this);
            _cache2 = wreq.c2;

            cache = new Proxy(
                { _cache, _cache2 },
                {
                    get(_, key) {
                        return _cache[key] || _cache2[key];
                    },

                    // for loop stuff
                    ownKeys(target) {
                        const keys1 = Reflect.ownKeys(target._cache);
                        const keys2 = Reflect.ownKeys(target._cache2);

                        // Combine the keys, giving priority to keys in _cache
                        const uniqueKeys = new Set([...keys2, ...keys1]);
                        return Array.from(uniqueKeys);
                    },
                    getOwnPropertyDescriptor(target, key) {
                        let desc = Reflect.getOwnPropertyDescriptor(
                            target._cache,
                            key,
                        );
                        if (!desc) {
                            desc = Reflect.getOwnPropertyDescriptor(
                                target._cache2,
                                key,
                            );
                        }
                        if (desc) desc.enumerable = true;
                        return desc;
                    },
                },
            );

            delete (Function.prototype as any).t;
            this.t = v;
        } else {
            Object.defineProperty(this, "t", {
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
        (...props: string[]): FilterFn =>
        (m) =>
            props.every((p) => m[p] !== void 0),
    byDisplayName:
        (displayName: string): FilterFn =>
        (m) =>
            m.displayName === displayName,
    byName:
        (name: string): FilterFn =>
        (m) =>
            m.name === name,
    byCode:
        (...codes: RegExp[] | string[]): FilterFn =>
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
                    "findByCode: Expected one or more RegExp or string, got " +
                        typeof c,
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
                "Invalid filter. Expected a function got " + typeof filter,
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
    },
);

/**
 * find but lazy
 */
export function findLazy(filter: FilterFn, getDefault = true) {
    return proxyLazy(() => find(filter, getDefault));
}

export function findAll(filter: FilterFn, getDefault = true) {
    if (typeof filter !== "function")
        throw new Error(
            "Invalid filter. Expected a function got " + typeof filter,
        );

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

/**
 * Wait for a module that matches the provided filter to be registered,
 * then call the callback with the module as the first argument
 */
export function waitFor(
    filter: string | string[] | FilterFn,
    callback: CallbackFn,
) {
    if (typeof filter === "string") filter = filters.byProps(filter);
    else if (Array.isArray(filter)) filter = filters.byProps(...filter);
    else if (typeof filter !== "function")
        throw new Error(
            "filter must be a string, string[] or function, got " +
                typeof filter,
        );

    const [existing, id] = find(filter!, true, true);
    if (existing) return void callback(existing, id);

    subscriptions.set(filter, callback);
}

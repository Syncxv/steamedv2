/**
 * Recursively merges defaults into an object and returns the same object
 * @param obj Object
 * @param defaults Defaults
 * @returns obj
 */
export function mergeDefaults<T>(obj: T, defaults: T): T {
	for (const key in defaults) {
		const v = defaults[key];
		if (typeof v === "object" && !Array.isArray(v)) {
			obj[key] ??= {} as any;
			mergeDefaults(obj[key], v);
		} else {
			obj[key] ??= v;
		}
	}
	return obj;
}

export function generateUuid(prefix = "", suffix = "") {
	const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		}
	);
	return prefix + uuid + suffix;
}

export const waitForCondition = (condition: () => any, cb: () => void) => {
	if (condition()) return cb();
	return requestAnimationFrame(() => waitForCondition(condition, cb));
};

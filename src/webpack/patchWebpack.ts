import { Logger } from "@utils/Logger";
import { WEBPACK_CHUNK } from "@utils/constants";

const logger = new Logger("WebpackInterceptor", "#8caaee");

let webpackChunk: any[];

if (window[WEBPACK_CHUNK]) {
	logger.info(
		`Patching ${WEBPACK_CHUNK}.push (was already existant, likely from cache!)`
	);
	patchPush();
} else {
	Object.defineProperty(window, WEBPACK_CHUNK, {
		get: () => webpackChunk,
		set: (v: any[]) => {
			if (v?.push !== Array.prototype.push) {
				logger.info(`Patching ${WEBPACK_CHUNK}.push`, v.length);
				patchPush();
				// @ts-ignore
				delete window[WEBPACK_CHUNK];
				window[WEBPACK_CHUNK] = v;
			}
			webpackChunk = v;
		},
		configurable: true,
	});
}

function patchPush() {
	function handlePush(chunk: any) {
		try {
			console.log(chunk);

			const modules = chunk[1];
			const { subscriptions, listeners } = Steamed.Webpack;
			// const { patches } = Steamed.Plugins;
		} catch (err) {}

		return handlePush.original.call(window[WEBPACK_CHUNK], chunk);
	}

	handlePush.original = window[WEBPACK_CHUNK].push;
	Object.defineProperty(window[WEBPACK_CHUNK], "push", {
		get: () => handlePush,
		set: (v) => (handlePush.original = v),
		configurable: true,
	});
}

import { WEBPACK_CHUNK } from "@utils/constants";
import { Logger } from "@utils/Logger";
import { canonicalizeReplacement } from "@utils/patches";
import { traceFunction } from "@utils/Tracer";
import { PatchReplacement } from "@utils/types";

const logger = new Logger("WebpackInterceptor", "#8caaee");

let webpackChunk: any[];

if (window[WEBPACK_CHUNK]) {
    logger.info(
        `Patching ${WEBPACK_CHUNK}.push (was already existant, likely from cache!)`,
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

// all coppied from vencord :P
function patchPush() {
    function handlePush(chunk: any) {
        try {
            const modules = chunk[1];
            const { subscriptions, listeners } = Steamed.Webpack;
            const { patches } = Steamed.Plugins;

            for (const id in modules) {
                let mod = modules[id];

                let code: string = mod.toString();

                const originalMod = mod;
                const patchedBy = new Set();

                const factory = (modules[id] = function (
                    module,
                    exports,
                    require,
                ) {
                    try {
                        mod(module, exports, require);
                    } catch (err) {
                        if (mod === originalMod) throw err;

                        logger.error("Error in patched chunk", err);
                        return void originalMod(module, exports, require);
                    }

                    const numberId = Number(id);

                    for (const callback of listeners) {
                        try {
                            callback(exports, numberId);
                        } catch (err) {
                            logger.error("Error in webpack listener", err);
                        }
                    }

                    for (const [filter, callback] of subscriptions) {
                        try {
                            if (filter(exports)) {
                                subscriptions.delete(filter);
                                callback(exports, numberId);
                            } else if (typeof exports === "object") {
                                if (
                                    exports.default &&
                                    filter(exports.default)
                                ) {
                                    subscriptions.delete(filter);
                                    callback(exports.default, numberId);
                                }

                                for (const nested in exports)
                                    if (nested.length <= 3) {
                                        if (
                                            exports[nested] &&
                                            filter(exports[nested])
                                        ) {
                                            subscriptions.delete(filter);
                                            callback(exports[nested], numberId);
                                        }
                                    }
                            }
                        } catch (err) {
                            logger.error(
                                "Error while firing callback for webpack chunk",
                                err,
                            );
                        }
                    }
                }) as any as {
                    toString: () => string;
                    original: any;
                    (...args: any[]): void;
                };

                // for some reason throws some error on which calling .toString() leads to infinite recursion
                // when you force load all chunks???
                try {
                    factory.toString = () => mod.toString();
                    factory.original = originalMod;
                } catch {}

                for (let i = 0; i < patches.length; i++) {
                    const patch = patches[i];
                    const executePatch = traceFunction(
                        `patch by ${patch.plugin}`,
                        (match: string | RegExp, replace: string) =>
                            code.replace(match, replace),
                    );
                    if (patch.predicate && !patch.predicate()) continue;

                    if (code.includes(patch.find)) {
                        patchedBy.add(patch.plugin);

                        for (const replacement of patch.replacement as PatchReplacement[]) {
                            if (
                                replacement.predicate &&
                                !replacement.predicate()
                            )
                                continue;

                            const lastMod = mod;
                            const lastCode = code;

                            canonicalizeReplacement(replacement, patch.plugin!);

                            try {
                                const newCode = executePatch(
                                    replacement.match,
                                    replacement.replace as string,
                                );
                                if (newCode === code && !patch.noWarn) {
                                    logger.warn(
                                        `Patch by ${patch.plugin} had no effect (Module id is ${id}): ${replacement.match}`,
                                    );
                                    if (IS_DEV) {
                                        logger.debug(
                                            "Function Source:\n",
                                            code,
                                        );
                                    }
                                } else {
                                    code = newCode;
                                    mod = (0, eval)(
                                        `// Webpack Module ${id} - Patched by ${[
                                            ...patchedBy,
                                        ].join(
                                            ", ",
                                        )}\n${newCode}\n//# sourceURL=WebpackModule${id}`,
                                    );
                                }
                            } catch (err) {
                                logger.error(
                                    `Patch by ${patch.plugin} errored (Module id is ${id}): ${replacement.match}\n`,
                                    err,
                                );

                                if (IS_DEV) {
                                    const changeSize =
                                        code.length - lastCode.length;
                                    const match = lastCode.match(
                                        replacement.match,
                                    )!;

                                    // Use 200 surrounding characters of context
                                    const start = Math.max(
                                        0,
                                        match.index! - 200,
                                    );
                                    const end = Math.min(
                                        lastCode.length,
                                        match.index! + match[0].length + 200,
                                    );
                                    // (changeSize may be negative)
                                    const endPatched = end + changeSize;

                                    const context = lastCode.slice(start, end);
                                    const patchedContext = code.slice(
                                        start,
                                        endPatched,
                                    );

                                    // inline require to avoid including it in !IS_DEV builds
                                    const diff = (
                                        require("diff") as typeof import("diff")
                                    ).diffWordsWithSpace(
                                        context,
                                        patchedContext,
                                    );
                                    let fmt = "%c %s ";
                                    const elements = [] as string[];
                                    for (const d of diff) {
                                        const color = d.removed
                                            ? "red"
                                            : d.added
                                            ? "lime"
                                            : "grey";
                                        fmt += "%c%s";
                                        elements.push(
                                            "color:" + color,
                                            d.value,
                                        );
                                    }

                                    logger.errorCustomFmt(
                                        ...Logger.makeTitle("white", "Before"),
                                        context,
                                    );
                                    logger.errorCustomFmt(
                                        ...Logger.makeTitle("white", "After"),
                                        patchedContext,
                                    );
                                    const [titleFmt, ...titleElements] =
                                        Logger.makeTitle("white", "Diff");
                                    logger.errorCustomFmt(
                                        titleFmt + fmt,
                                        ...titleElements,
                                        ...elements,
                                    );
                                }
                                code = lastCode;
                                mod = lastMod;
                                patchedBy.delete(patch.plugin);
                            }
                        }
                    }
                }
            }
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

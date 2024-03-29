import { React } from "@webpack/common";

import { SettingsItem } from "./types";

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

export const transformSettings = (setting: SettingsItem) => {
    if (typeof setting.content === "function")
        setting.content = <setting.content />;
    if (typeof setting.icon === "function") setting.icon = <setting.icon />;
    if (!setting.route)
        setting.route = `/settings/${setting.title.toLowerCase()}`;
    return setting;
};

export const createElement = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.firstChild!;
};

export const insertCss = (css: string, _document = window.document) => {
    const id = Math.floor(Date.now() + Math.random() * 100000).toString();
    const style = createElement(`<style id="${id}"> ${css} </style>`);
    _document.head.appendChild(style);
    return { doc: _document, id };
};

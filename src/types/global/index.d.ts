import { FriendsUIApp } from "./friendsUiApp";
import { PopupManager } from "./popup";

declare global {
	export var Steamed: typeof import("../../Steamed");
	export var g_PopupManager: PopupManager;
	export var g_FriendsUIApp: FriendsUIApp;
	interface Window {
		webpackChunkfriendsui: {
			push(chunk: any): any;
			pop(): any;
		};
		[k: PropertyKey]: any;
	}
}
export interface WebpackArray {
	push([[[id]], {}]: [
		[[id: string]],
		{},
		(require: WebpackRequire) => void
	]): WebpackRequire;
}

export interface WebpackRequire extends Function {
	(id: number | string): any; // Just an example
	m: { [key: number]: RawModule };
}

export type RawModule = (what: any, exports: any, n: WebpackRequire) => any;

export * from "./popup";

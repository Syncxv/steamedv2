export interface Manifest {
	name: string;
	description: string;
	authors: Author[];
	required?: boolean;
	enabledByDefault?: boolean;
}

export interface Author {
	accountId: BigInt;
	name: string;
}

export interface Patch {
	find: string;
	predicate?: () => boolean;
	replacement: PatchReplacement[] | PatchReplacement;
	plugin?: string;
	noWarn?: boolean;
}

export type ReplaceFn = (match: string, ...groups: string[]) => string;

export interface PatchReplacement {
	match: string | RegExp;
	replace: string | ReplaceFn;
	predicate?(): boolean;
}

export interface Plugin {
	manifest: Manifest;
	patches: Patch[];
	[key: string]: any;
}

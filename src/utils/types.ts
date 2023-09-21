export interface Manifest {
	name: string;
	description: string;
	authors: Author[];
}

export interface Author {
	accountId: BigInt;
	name: string;
}

export interface Patch {
	find: string;
	predicate?: () => boolean;
	replacement: Replacement[];
}

export type ReplaceFn = (match: string, ...groups: string[]) => string;

export interface Replacement {
	match: string | RegExp;
	replace: string | ReplaceFn;
	predicate?(): boolean;
}

export type whatMiniCssJ = { miniCss: Function; j: Function };
export interface WebpackInstance {
	(id: number): any;
	E: Function;
	F: { j: Function };
	O: Function & whatMiniCssJ;
	a: Function;
	amdD: Function;
	amdO: unknown;

	c: {
		[id: number]: {
			id: number | string;
			loaded: boolean;
			exports: any;
		};
	};
	c2: this["c"];
	d: Function;
	/**
	 * Loads chunks by their ID.
	 */

	e: (chunkId: number) => any;
	f: whatMiniCssJ;

	g: typeof globalThis & { [key: string]: any };
	l: Function;

	m: { [id: number]: Function };

	n: Function;
	nmd: Function;
	o: Function;
	p: string;
	r: Function;
	s: null;

	t: Function;
	u: Function;
	// eslint-disable-next-line semi
}

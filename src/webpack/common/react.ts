import { findByPropsLazy, waitFor } from "../index";

export let React: typeof import("react");
export let useState: typeof React.useState;
export let useEffect: typeof React.useEffect;
export let useMemo: typeof React.useMemo;
export let useRef: typeof React.useRef;
export let useCallback: typeof React.useCallback;

export let ReactDOM: typeof import("react-dom") &
	typeof import("react-dom/client") = findByPropsLazy("createPortal", "render");

waitFor("useState", (m) => {
	React = m;
	({ useEffect, useState, useMemo, useRef, useCallback } = React);
});

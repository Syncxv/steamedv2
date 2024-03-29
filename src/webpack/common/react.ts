import { findByPropsLazy, waitFor } from "../index";

export let React: typeof import("react");
export let useState: typeof React.useState;
export let useEffect: typeof React.useEffect;
export let useMemo: typeof React.useMemo;
export let useRef: typeof React.useRef;
export let useCallback: typeof React.useCallback;
export let useReducer: typeof React.useReducer;

export const ReactDOM: typeof import("react-dom") &
    typeof import("react-dom/client") = findByPropsLazy(
        "createPortal",
        "render",
    );

waitFor("useState", (m) => {
    React = m;
    window.React = m;
    ({ useEffect, useState, useMemo, useRef, useCallback, useReducer } = React);
});

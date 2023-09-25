import { findLazy, waitFor } from "@webpack";

export const MessageClass = findLazy((m) =>
	m?.prototype?.constructor.toString().includes("eErrorSendingObservable")
);

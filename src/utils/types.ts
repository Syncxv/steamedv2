import React from "react";
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
    plugin: string;
    noWarn?: boolean;
}

export type PluginPatch = Omit<Patch, "plugin">;

export type ReplaceFn = (match: string, ...groups: string[]) => string;

export interface PatchReplacement {
    match: string | RegExp;
    replace: string | ReplaceFn;
    predicate?(): boolean;
}

export interface PluginDef {
    manifest: Manifest;
    patches?: PluginPatch[];
    start?: () => void;
    stop?: () => void;
    commands?: Command[];
    [key: string]: any;
}

export interface Plugin extends PluginDef {
    patches: Patch[];
}

export interface SettingsItem {
    visible: boolean;
    title: string;
    icon: React.ReactElement | (() => JSX.Element);
    route: string;
    content: React.ReactElement | (() => JSX.Element);
}

export interface CommandReturn {
    result: string;
    send?: boolean;
}
export interface Command {
    name: string;
    description: string;
    execute: (
        args: string[],
        thisObj: any,
    ) => Promise<CommandReturn | void> | CommandReturn | void;
}

import fs from "node:fs";
import os from "node:os";
import process from "node:process";

export const isWsl = () => {
    if (process.platform !== "linux") {
        return false;
    }

    if (os.release().toLowerCase().includes("microsoft")) {
        if (isDocker()) {
            return false;
        }

        return true;
    }

    try {
        return fs
            .readFileSync("/proc/version", "utf8")
            .toLowerCase()
            .includes("microsoft")
            ? !isDocker()
            : false;
    } catch {
        return false;
    }
};

let isDockerCached;

function hasDockerEnv() {
    try {
        fs.statSync("/.dockerenv");
        return true;
    } catch {
        return false;
    }
}

function hasDockerCGroup() {
    try {
        return fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
    } catch {
        return false;
    }
}

export default function isDocker() {
    // TODO: Use `??=` when targeting Node.js 16.
    if (isDockerCached === undefined) {
        isDockerCached = hasDockerEnv() || hasDockerCGroup();
    }

    return isDockerCached;
}


function steamClientToInterface() {
    let res = "";
    for (const [key, value] of Object.entries((window as any).SteamClient)) {
        res += `${key}: `;
        let innerRes = "{\n";
        if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            value !== null
        ) {
            for (const key of Object.keys(value)) {
                innerRes += `${key}: Function\n`;
            }
            innerRes += "}";
        }
        res += innerRes;
    }

    return res;
}

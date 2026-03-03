/**
 * スプレッドシートのURLからspreadsheetIdを取得する
 * @remarks URL例: `https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit?gid={gid#gid={gid}`
 * @param sheetUrl スプレッドシートのURL
 * @returns spreadsheetId
 */
export function getSpreadsheetId(sheetUrl: string): string {
    const sheetUrlObj = new URL(sheetUrl);
    /** @return [spreadsheets, d, {spreadSheetId}, ...]: string[] */
    const parts = sheetUrlObj.pathname.split('/');
    const dIndex = parts.indexOf('d');

    // dが見つからなかったか末尾だった場合はエラー
    if (dIndex === -1 || dIndex + 1 >= parts.length) {
        throw new Error("spreadsheetIdを取得できませんでした。");
    }

    const spreadsheetId = parts[dIndex + 1];
    if (!spreadsheetId) {
        throw new Error("spreadsheetIdを取得できませんでした。");
    }

    return spreadsheetId;
}

/**
 * スプレッドシートのURLからgidを取得する
 * @remarks 
 * @param sheetUrl スプレッドシートを開いてるときのURL
 * @returns gid（sheetId）
 */
export function getGid(sheetUrl: string): number {
    const sheetUrlObj = new URL(sheetUrl);

    // gidはurlのクエリ文字列かhash
    const queryGid = sheetUrlObj.searchParams.get("gid");
    let rawGid: string | null = queryGid;
    if (rawGid === null && sheetUrlObj.hash) {
        const hashParams = new URLSearchParams(sheetUrlObj.hash.slice(1));
        rawGid = hashParams.get("gid");
    }

    if (rawGid === null) {
        throw new Error("gidを取得できませんでした");
    }

    const gid = Number(rawGid);
    if (!Number.isInteger(gid) || gid < 0) {
        throw new Error("gidを取得できませんでした");
    }

    return gid;
}


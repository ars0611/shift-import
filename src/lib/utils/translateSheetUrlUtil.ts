/**
 * スプレッドシートのURLからspreadsheetIdを取得する
 * @remarks URL例: `https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit?gid={gid#gid={gid}`
 * @param sheetUrl スプレッドシートのURL
 * @returns spreadsheetId
 */
export function getSpreadsheetId(sheetUrl: string): string {
    const sheetUrlObj: URL = new URL(sheetUrl);
    // [spreadsheets, d, {spreadSheetId}, ...]: string[]
    const parts: string[] = sheetUrlObj.pathname.split('/');
    const dIndex: number = parts.indexOf('d');
    // dが見つからなかったか末尾だった場合はエラー
    if (dIndex === -1 || dIndex + 1 >= parts.length) {
        throw new Error("spreadsheetIdを取得できませんでした。");
    }
    const spreadsheetId: string = parts[dIndex + 1];
    if (!spreadsheetId) {
        throw new Error("spreadsheetIdを取得できませんでした。");
    }
    return spreadsheetId as string;
}

/**
 * スプレッドシートのURLからgidを取得する
 * @remarks 
 * @param sheetUrl スプレッドシートを開いてるときのURL
 * @returns gid（sheetId）
 */
export function getGid(sheetUrl: string): number {
    const sheetUrlObj: URL = new URL(sheetUrl);
    // gidはurlのクエリ文字列かhash
    let gid: number | null = Number(sheetUrlObj.searchParams.get("gid"));
    if (!gid && sheetUrlObj.hash) {
        const hashText: string = sheetUrlObj.hash.slice(1);
        const gidFromHash: string | null = new URLSearchParams(hashText).get("gid");
        if (gidFromHash) {
            gid = Number(gidFromHash);
        }
    }
    // gidが見つからなかった場合エラー
    if (!Number.isInteger(gid) || gid < 0) {
        throw new Error("gidを取得できませんでした。");
    }
    return gid as number;
}


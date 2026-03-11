import type { LoadSheetResponse } from "@/types/message";
import { toRuntimeErrorMessage } from "./runtimeClient";

/**
 * background.tsにスプレッドシートの読み込みの開始を依頼する
 * @param ranges `[日付range, 出勤range, 退勤range]`
 * @returns スプレッドシートの読み込みの結果を表すレスポンス
 * @remarks `chrome.runtime.sendMessage` で `{ type: "LOAD_SHEET" }` を送信し、background.tsからの応答を `LoadSheetResponse`として扱う
 */
export async function requestLoadSheet(ranges: Array<string>): Promise<LoadSheetResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "LOAD_SHEET", ranges });
        return res;
    } catch (e) {
        return {
            ok: false,
            connected: false,
            error: toRuntimeErrorMessage(e, "シート読み込みリクエストの送信に失敗しました。"),
            sheetData: {
                spreadSheetId: "",
                valueRanges: []
            }
        };
    }
}

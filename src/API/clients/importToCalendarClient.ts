import { ImportToCalendarResponse } from "@/types/message";
import { BatchGetResponse } from "@/types/sheet";
import { toRuntimeErrorMessage } from "./runtimeClient";

/**
 * background.tsに予定の作成の開始を依頼する
 * @returns :ImportToCalendarResponse backgroundから返ってくるメッセージ
 * @remarks `chrome.runtime.sendMessage` で `{ type: "IMPORT_TO_CALENDAR" }` を送信し、background.tsからの応答を `ImportToCalendarResponse`として扱う
 */
export async function requestImportToCalendar(sheetData: BatchGetResponse): Promise<ImportToCalendarResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "IMPORT_TO_CALENDAR", sheetData });
        return res;
    } catch (e) {
        return {
            ok: false,
            connected: false,
            error: toRuntimeErrorMessage(e, "カレンダー取り込みリクエストの送信に失敗しました。"),
            deletedCount: 0,
            createdCount: 0
        };
    }
}


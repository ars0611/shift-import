import { checkGoogleAuth, connectGoogleAuth, getAccessToken } from "@/lib/services/authService";
import { getTitle, getValues } from "@/lib/services/loadSheetService";
import { getCurrentTabUrl } from "@/lib/services/tabService";
import { getGid, getSpreadsheetId } from "@/lib/utils/translateSheetUrlUtil";
import type { ExtensionMessage } from "@/types/message";
/**
 * @remarks runtimeメッセージを受け取り、認証チェックや認証を実行する
 * @remarks `sendMessage` を非同期で呼ぶため, trueを返す（よくわからんがdocumentにそう書いてた）
 */
export default defineBackground(() => {
    /**
     * popupからのメッセージを処理する
     * 
     * @param message 受信メッセージ
     * @param sender 送信元の情報
     * @param sendResponse 呼び出し元に応答
     * @returns 非同期応答のため, true
     */
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
        (async () => {
            try {
                // UI非表示でGoogle認証済みかチェックする処理
                if (message.type === "AUTH_CHECK") {
                    const connected = await checkGoogleAuth();
                    sendResponse({ ok: true, connected, error: connected ? undefined : "認証に失敗しました" });
                    return;

                    // Google認証済みかチェックし、未認証であれば認証ページへ遷移させる処理
                } else if (message.type === "AUTH_CONNECT") {
                    const connected = await connectGoogleAuth();
                    sendResponse({ ok: true, connected, error: connected ? undefined : "認証に失敗しました" });
                    return;

                    // スプレッドシートを読み込む処理
                } else if (message.type === "LOAD_SHEET") {
                    // sheetsAPIを叩くのに必要なOAuth2認証トークンを取得
                    const token = await getAccessToken();
                    // 開いているタブのURLを取得
                    const url: string = await getCurrentTabUrl();
                    const spreadsheetId: string = getSpreadsheetId(url);
                    const gid: number = getGid(url);
                    const title: string = await getTitle(token, spreadsheetId, gid);
                    const sheetData = await getValues(token, spreadsheetId, title, message.ranges);
                    const connected = !!sheetData;
                    sendResponse({ ok: true, connected, error: connected ? undefined : "シートの読み込みに失敗しました", sheetData });
                    return;
                }

                // 嘘のメッセージが来たらエラー
                sendResponse({ ok: false, connected: false, error: "無効なメッセージです" })
            } catch (e) {
                sendResponse({ ok: false, connected: false, error: e instanceof Error ? e.message : String(e) });
            }
        })();
        return true;
    });
})

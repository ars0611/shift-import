import type { AuthResponse } from "@/types/message";
import { toRuntimeErrorMessage } from "./runtimeClient";
/**
 * background.tsに認証チェックを依頼する
 * @returns 認証状態を表すレスポンス
 * @remarks `chrome.runtime.sendMessage` で `{ type: "AUTH_CHECK" }` を送信し、background.tsからの応答を `AuthResponse`として扱う
 */
export async function requestAuthCheck(): Promise<AuthResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "AUTH_CHECK" });
        return res;
    } catch (e) {
        return {
            ok: false,
            connected: false,
            error: toRuntimeErrorMessage(e, "認証状態の確認に失敗しました。")
        };
    }
}
/**
 * background.tsに認証の開始を依頼する
 * @returns 認証実行の結果を表すレスポンス
 * @remarks `chrome.runtime.sendMessage` で `{ type: "AUTH_CONNECT" }` を送信し、background.tsからの応答を `AuthResponse`として扱う
 */
export async function requestAuthConnect(): Promise<AuthResponse> {
    try {
        const res = await chrome.runtime.sendMessage({ type: "AUTH_CONNECT" });
        return res;
    } catch (e) {
        return {
            ok: false,
            connected: false,
            error: toRuntimeErrorMessage(e, "認証リクエストの送信に失敗しました。")
        };
    }
}

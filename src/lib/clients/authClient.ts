import type { AuthResponse } from "@/types/message";
/**
 * background.tsに認証チェックを依頼する
 * @remarks `chrome.runtime.sendMessage` で `{ type: "AUTH_CHECK" }` を送信し、backgroud.tsからの応答を `AuthResponse`として扱う
 * @returns 認証状態を表すレスポンス
 */
export async function requestAuthCheck(): Promise<AuthResponse> {
    const res = await chrome.runtime.sendMessage({ type: "AUTH_CHECK" });
    return res as AuthResponse;
}
/**
 * background.tsに認証の開始を依頼する
 * @remarks `chrome.runtime.sendMessage` で `{ type: "AUTH_CONNECT" }` を送信し、backgroud.tsからの応答を `AuthResponse`として扱う
 * @returns 認証実行の結果を表すレスポンス
 */
export async function requestAuthConnect(): Promise<AuthResponse> {
    const res = await chrome.runtime.sendMessage({ type: "AUTH_CONNECT" });
    return res as AuthResponse;
}

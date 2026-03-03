/**
 * 認証済みかチェック
 * @remarks `chrome.identity.getAuthToken`は良い感じにキャッシュしてくれるから気軽に呼んで良い
 * @remarks 認証のUIは表示しない（{ interactive: false }）
 * @returns 認証済みでトークン取得出来たら true, それ以外 false
 * @see https://developer.chrome.com/docs/extensions/mv2/reference/identity?hl=ja
 */
export async function checkGoogleAuth(): Promise<boolean> {
    try {
        const result = await chrome.identity.getAuthToken({ interactive: false });
        return !!result;
    } catch (e) {
        return false;
    }
}

/**
 * 認証済みかチェックし、認証済みでなかったら認証させる
 * @remarks `chrome.identity.getAuthToken`は良い感じにキャッシュしてくれるから気軽に呼んで良い
 * @remarks 認証のUIを表示する（{ interactive: true }）
 * @returns 認証済みか、認証できたら true, それ以外 false
 * @see https://developer.chrome.com/docs/extensions/mv2/reference/identity?hl=ja
*/
export async function connectGoogleAuth(): Promise<boolean> {
    try {
        const result = await chrome.identity.getAuthToken({ interactive: true });
        return !!result
    } catch (e) {
        return false;
    }
}

/**
 * 認証トークンを取得する
 * @remarks `chrome.identity.getAuthToken`は良い感じにキャッシュしてくれるから気軽に呼んで良い
 * @returns access token
 * @throws エラー時に Error
 * @see https://developer.chrome.com/docs/extensions/mv2/reference/identity?hl=ja
 */
export async function getAccessToken(): Promise<string> {
    try {
        const result = await chrome.identity.getAuthToken({ interactive: true });
        const accessToken: string = result.token ?? '';
        if (!accessToken) {
            throw new Error("Google認証トークンが取得できませんでした");
        }
        return accessToken;
    } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        throw new Error(`Google認証トークンの取得に失敗しました。: ${reason}`);
    }
}

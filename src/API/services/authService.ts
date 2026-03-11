/**
 * 認証済みかチェック
 * @returns 認証済みでトークン取得出来たら true, それ以外 false
 * @see https://developer.chrome.com/docs/extensions/mv2/reference/identity?hl=ja
 * @remarks `chrome.identity.getAuthToken`は良い感じにキャッシュしてくれるから気軽に呼んで良い
 * @remarks 認証のUIは表示しない（{ interactive: false }）
*/
export async function checkGoogleAuth(): Promise<boolean> {
        const result = await chrome.identity.getAuthToken({ interactive: false });
        return !!result;
}

/**
 * 認証済みかチェックし、認証済みでなかったら認証させる
 * @returns 認証済みか、認証できたら true, それ以外 false
 * @see https://developer.chrome.com/docs/extensions/mv2/reference/identity?hl=ja
 * @remarks `chrome.identity.getAuthToken`は良い感じにキャッシュしてくれるから気軽に呼んで良い
 * @remarks 認証のUIを表示する（{ interactive: true }）
*/
export async function connectGoogleAuth(): Promise<boolean> {
        const result = await chrome.identity.getAuthToken({ interactive: true });
        return !!result
}

/**
 * 認証トークンを取得する
 * @throws エラー時に Error
 * @returns access token
 * @see https://developer.chrome.com/docs/extensions/mv2/reference/identity?hl=ja
 * @remarks `chrome.identity.getAuthToken`は良い感じにキャッシュしてくれるから気軽に呼んで良い
 */
export async function getAccessToken(): Promise<string> {
        const result = await chrome.identity.getAuthToken({ interactive: true });
        const accessToken: string = result.token ?? '';
        if (!accessToken) {
            throw new Error("Google認証トークンが取得できませんでした");
        }
        return accessToken;
}

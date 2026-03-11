/**
 * 現在（ポップアップ閲覧時）のタブのURLを取得する
 * @returns 現在のタブのurl
 * @throws タブ取得、もしくはタブのURL取得に失敗したときエラー
 * @see https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ja
 */
export async function getCurrentTabUrl(): Promise<string> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab) {
        throw new Error("現在のタブを取得できませんでした");
    }

    if (!tab.url) {
        throw new Error("現在のタブのURLを取得できませんでした");
    }

    return tab.url;
}

/**
 * 現在（ポップアップ閲覧時）のタブのIDを取得する
 * @returns 現在のタブのID
 * @throws タブ取得、もしくはタブのID取得に失敗したときエラー
 * @see https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ja
 */
export async function getCurrentTabId(): Promise<number> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab) {
        throw new Error("現在のタブを取得できませんでした");
    }

    if (tab.id == null) {
        throw new Error("現在のタブのIDを取得できませんでした");
    }

    return tab.id;
}


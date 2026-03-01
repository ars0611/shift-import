/**
 * 現在（ポップアップ閲覧時）のタブのURLを取得する
 * @returns 現在のタブのurl
 * @throws タブ取得、もしくはタブのURL取得に失敗したときエラー
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

    return tab.url as string;
}

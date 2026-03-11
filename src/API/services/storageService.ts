/**
 * `chrome.storage.sync`から指定したキーの数値を取得する。
 * @param keys 保存値を取得するキー
 * @returns 取得した数値（未設定時は 0）
 * @remarks キーごとの値。未設定の場合は 0 を返す。
 * @remarks `res[key]`で各キーに対する値を得る
 */
export async function getNumberFromSyncStorage(keys: Array<string>): Promise<Record<string, number>> {
    const res = await chrome.storage.sync.get(keys);
    return Object.fromEntries(
        keys.map((key) => [key, Number(res[key] ?? 0)]),
    );
}

type setNumberToSyncStorageProps = {
    key: string,
    value: number
}

/**
 * `chrome.storage.sync`に指定したキーで数値を保存する。
 * @param key 保存先のキー
 * @param value 保存する数値
 * @returns 保存完了後に解決される Promise
 * @remarks 既存値がある場合は上書きします。
*/
export async function setNumberToSyncStorage({ key, value }: setNumberToSyncStorageProps): Promise<void> {
    await chrome.storage.sync.set({ [key]: value })
}

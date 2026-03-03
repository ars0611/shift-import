import { BatchGetResponse, SheetData, SpreadsheetMetaResponse } from "@/types/sheet";

type GetTitleByGidProps = {
    data: SpreadsheetMetaResponse,
    gid: number
}

/**
 * type SpreadsheetMetaResponse のjsonを用いてgidからシートタイトルを取得する
 * @param data json
 * @param gid urlから取得したgid
 * @returns gidに一致するシートのタイトル
 * @throws dataに存在しないgidだった場合、一致するシートがないのでエラー
 */
export function getTitleByGid({ data, gid }: GetTitleByGidProps): string {
    // data.sheet.propertiesの要素のsheetIdにgidと一致するものがあるか探す
    const hit = (data.sheets ?? []).find(
        sheet => sheet.properties?.sheetId === gid && typeof sheet.properties.title === "string"
    );

    if (!hit?.properties?.title) {
        throw new Error(`gid=${gid} に一致するシートタイトルが見つかりませんでした`);
    }

    return hit.properties.title;
}

/**
 * batchgetで得たセル値を二次元配列に整形する
 * @param data json
 * @returns 二次元配列（例: `[[A8:A35の各セルの値], [Z8:Z35の各セルの値], [AA8:AA35の各セルの値]]`）
 */
export function parseBatchGetResponse(data: BatchGetResponse): SheetData {
    const cols = data.valueRanges.map(v => v.values?.[0] ?? [] as Array<number | string>);
    return cols;
}

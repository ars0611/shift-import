import { BatchGetResponse, SpreadsheetMetaResponse } from "@/types/sheet";

/**
 * sheets API（values:batchGet）で複数レンジ取得し、レンジ順に配列を結合して二次元配列を返す
 * ただし、レンジ一つ一つは1列に限る（例: A8:A35）
 * @param accessToken OAuthアクセストークン
 * @param spreadsheetId 対象のスプレッドシートID
 * @param title シート名（例: `2026年1月`）
 * @param ranges レンジの配列（例: `["A8:A35", "Z8:Z35", "AA8:AA35"]`）
 * @returns 二次元配列（例: `[[A8:A35の各セルの値], [Z8:Z35の各セルの値], [AA8:AA35の各セルの値]]`）
 * @throws API呼び出し失敗時のエラー
 */
export async function getValues(accessToken: string, spreadsheetId: string, title: string, ranges: string[]) {
    const encodedSpreadsheetId: string = encodeURIComponent(spreadsheetId);
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodedSpreadsheetId}/values:batchGet`);
    for (const range of ranges) {
        url.searchParams.append("ranges", `${title}!${range}`);
    }
    url.searchParams.set("majorDimension", "COLUMNS");
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`スプレッドシートの読み込みに失敗しました: ${res.status} ${text}`);
    }

    const data: BatchGetResponse = await res.json();
    const cols = data.valueRanges.map(v => v.values ?? []);
    return cols;
}

/**
 * スプレッドシートIDとシートIDからシート名を取得する
 * @param accessToken OAuthアクセストークン
 * @param spreadsheetId 対象のスプレッドシートID
 * @param gid gid（sheetId）
 * @returns シート名
 */
export async function getTitle(accessToken: string, spreadsheetId: string, gid: number): Promise<string> {
    const encodedSpreadsheetId: string = encodeURIComponent(spreadsheetId);
    const url: URL = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodedSpreadsheetId}?fields=sheets.properties(sheetId,title)`)
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`シートタイトルの取得に失敗しました: ${res.status} ${text}`);
    }

    const data: SpreadsheetMetaResponse = await res.json();
    const hit = (data.sheets ?? []).find(
        sheet => sheet.properties?.sheetId === gid && typeof sheet.properties.title === "string"
    );

    if (!hit?.properties?.title) {
        throw new Error(`gid=${gid} に一致するシートタイトルが見つかりませんでした`);
    }
    return hit.properties.title;
}

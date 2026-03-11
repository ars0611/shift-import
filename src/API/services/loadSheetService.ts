import { BatchGetResponse, SpreadsheetMetaResponse } from "@/types/sheet";

type fetchValuesProps = {
    accessToken: string,
    spreadsheetId: string,
    title: string,
    ranges: string[]
}

/**
 * sheets API（values:batchGet）で複数レンジのセル値を取得する
 * @param accessToken OAuthアクセストークン
 * @param spreadsheetId 対象のスプレッドシートID
 * @param title シート名（例: `2026年1月`）
 * @param ranges レンジの配列（例: `["A8:A35", "Z8:Z35", "AA8:AA35"]`）
 * @throws API呼び出し失敗時のエラー
 * @returns json
 * @remarks レンジ1つ1つは1列に限る（例: A8:A35）
 * @see https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet?hl=ja
 */
export async function fetchValues({ accessToken, spreadsheetId, title, ranges }: fetchValuesProps): Promise<BatchGetResponse> {
    // リクエスト用のURLを組み立てる
    const encodedSpreadsheetId = encodeURIComponent(spreadsheetId);
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodedSpreadsheetId}/values:batchGet`);
    for (const range of ranges) {
        url.searchParams.append("ranges", `${title}!${range}`);
    }
    url.searchParams.set("majorDimension", "COLUMNS");

    // sheets APIでbatchGetを実行
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`スプレッドシートの読み込みに失敗しました: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data;
}

type fetchTitlesAndSpreadsheetIdProps = {
    accessToken: string,
    spreadsheetId: string
}

/**
 * sheets API(field mask)でスプレッドシートIDとシートIDからシート名とgidのペアを取得する
 * @param accessToken OAuthアクセストークン
 * @param spreadsheetId 対象のスプレッドシートID
 * @throws リクエスト失敗時にエラー
 * @returns json
 * @see https://developers.google.com/workspace/sheets/api/guides/field-masks?hl=ja
 */
export async function fetchTitlesAndSpreadsheetId({ accessToken, spreadsheetId }: fetchTitlesAndSpreadsheetIdProps): Promise<SpreadsheetMetaResponse> {
    // リクエスト用のURLを組み立てる
    const encodedSpreadsheetId = encodeURIComponent(spreadsheetId);
    const url: URL = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodedSpreadsheetId}?fields=sheets.properties(sheetId,title)`)

    // sheets APIでフィールドマスクを利用した読み取り
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
    return data;
}

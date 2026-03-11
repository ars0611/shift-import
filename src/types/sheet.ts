/** batchgetした際のレスポンス */
export type BatchGetResponse = {
    spreadSheetId: string,
    valueRanges: Array<{
        range: string,
        majorDimension: string,
        values: (string | number)[][]
    }>
};

/** field maskでgetした際のレスポンス */
export type SpreadsheetMetaResponse = {
    sheets?: Array<{
        properties?: {
            sheetId?: number;
            title?: string;
        };
    }>;
};

/** batchgetで得たセル値をrangeごとに配列化したもの */
export type SheetData = Array<Array<string | number>>;

/**フォームで指定したセル範囲の配列 */
export type BatchGetRanges = Array<string>


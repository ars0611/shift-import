import { BatchGetRanges, BatchGetResponse } from "@/types/sheet"
import { extractMonthFromRange, parseMonthDay } from "./sheetMetaUtil"

type validateSheetRangeFormProps = {
    dateStart: string | null,
    dateEnd: string | null,
    clockInStart: string | null,
    clockInEnd: string | null,
    clockOutStart: string | null,
    clockOutEnd: string | null
}

type validationResult = {
    ok: boolean,
    error?: string
}

/**
 * 半角英数字以外が文字列中に混ざってないかを判定する
 * @param str 判定対象の文字列
 * @returns 半角英数字以外が混じってたらfalse, 混じってないならtrue
 */
function isAlphanumeric(str: string | null): boolean {
    if (!str) { return false }
    return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * 文字がアルファベットがどうか判定する
 * @param ch 判定対象の文字
 * @returns アルファベットならtrue, そうでないならfalse
 */
function isAlphabet(ch: string | null): boolean {
    if (!ch) { return false; }
    return /^[a-zA-Z]*$/.test(ch);
}

/**
 * 文字列が数字かどうか判定する
 * @param str 判定対象の文字列
 * @returns 数字ならtrue, そうでないならfalse
 */
function isNumber(str: string | null) {
    if (str === null) { return false; }
    return /^[0-9]*$/.test(str);
}

/**
 * 各セル指定について有効な書式になっているか判定する
 * @param str 判定対象のセル
 * @returns 無効なセル指定ならfalse、有効ならtrue
 */
function checkCell(input: string | null): boolean {
    // 半角英数字以外が混じった入力値は無効
    if (!input || !isAlphanumeric(input)) { return false; }

    // 先頭から入力値を見て、列指定がないか列指定のみ（行指定の数字がない）場合は無効
    let i = 0;
    while (i < input.length && (isAlphabet(input[i]))) { i++; }
    if (i === 0 || i === input.length) { return false; }

    // 途中から入力値を見て、行指定中にアルファベットがあった場合は無効
    while (i < input.length && (isNumber(input[i]))) { i++; }
    if (i !== input.length) { return false; }

    return true;
}

/**
 * セル指定の入力値から列指定と行指定を得る
 * @param input 取得対象のセル指定入力値（有効値）
 * @returns [列指定のアルファベット 行指定の数字]
 * @remarks 引数はcheckCellで有効であることが保証されていることを前提とする
 */
function getColAndRow(input: string): [string, number] {
    // 前半のアルファベットと後半の数字を前から走査して分割する
    let i = 0;
    while (i < input.length && (isAlphabet(input[i]))) { i++; }
    const col = input.slice(0, i);
    const row = input.slice(i);
    return [col, Number(row)];
}

/**
 * ユーザーのセル指定入力値についてバリデーションをする
 * @param dateStart 日付セル開始位置
 * @param dateEnd 日付セル終了位置
 * @param clockInStart 出勤セル開始位置
 * @param clockInEnd 出勤セル終了位置
 * @param clockOutStart 退勤セル開始位置
 * @param clockOutEnd 退勤セル終了位置
 * @returns バリデーションの結果
*/
export function validateSheetRangeForm({ dateStart, dateEnd, clockInStart, clockInEnd, clockOutStart, clockOutEnd }: validateSheetRangeFormProps): validationResult {
    // 未入力チェック
    if (!dateStart || !dateEnd || !clockInStart || !clockInEnd || !clockOutStart || !clockOutEnd) {
        return { ok: false, error: "入力値が不足しています。" };
    }

    // セル指定の書式チェック
    if (!checkCell(dateStart) || !checkCell(dateEnd) || !checkCell(clockInStart) || !checkCell(clockInEnd) || !checkCell(clockOutStart) || !checkCell(clockOutEnd)) {
        return { ok: false, error: "セル指定が無効です。" };
    }

    // 整合性チェック
    const errorMessages: Array<string> = [];
    const [dateStartCol, dateStartRow] = getColAndRow(dateStart);
    const [dateEndCol, dateEndRow] = getColAndRow(dateEnd);
    const [clockInStartCol, clockInStartRow] = getColAndRow(clockInStart);
    const [clockInEndCol, clockInEndRow] = getColAndRow(clockInEnd);
    const [clockOutStartCol, clockOutStartRow] = getColAndRow(clockOutStart);
    const [clockOutEndCol, clockOutEndRow] = getColAndRow(clockOutEnd);

    if (dateStartCol !== dateEndCol) {
        errorMessages.push("日付の開始列と終了列が一致していません。");
    }
    if (clockInStartCol !== clockInEndCol) {
        errorMessages.push("出勤の開始列と終了列が一致していません。");
    }
    if (clockOutStartCol !== clockOutEndCol) {
        errorMessages.push("退勤の開始列と終了列が一致していません。");
    }
    if (!(dateStartRow === clockInStartRow && clockInStartRow === clockOutStartRow)) {
        errorMessages.push("開始行が日付・出勤・退勤で一致していません。");
    }
    if (!(dateEndRow === clockInEndRow && clockInEndRow === clockOutEndRow)) {
        errorMessages.push("終了行が日付・出勤・退勤で一致していません。");
    }
    if (dateStartRow > dateEndRow || clockInStartRow > clockInEndRow || clockOutStartRow > clockOutEndRow) {
        errorMessages.push("開始行は終了行以下である必要があります。");
    }

    // バリデーション結果を返す
    if (errorMessages.length > 0) {
        return { ok: false, error: errorMessages.join('\n') };
    };

    return { ok: true };
}

/**
 * backgroud.ts側で行うセル範囲指定のバリデーション
 * @param ranges backgroudで受け取ったセル範囲指定 (例: `["A8:A38", "Z8:Z38", "AA8:AA38"]`)
 * @returns バリデーション結果
 */
export function validateRangesForBatchGet(ranges: BatchGetRanges): validationResult {
    if (ranges.length !== 3) {
        return { ok: false, error: "入力値が不足しています。" };
    }
    const [dateStart, dateEnd] = ranges[0].split(':');
    const [clockInStart, clockInEnd] = ranges[1].split(':');
    const [clockOutStart, clockOutEnd] = ranges[2].split(':');
    return validateSheetRangeForm({ dateStart, dateEnd, clockInStart, clockInEnd, clockOutStart, clockOutEnd });
}

/**
 * batchgetで得たレスポンスに対するバリデーション
 * @param response batchgetのレスポンス
 * @returns バリデーション結果
 */
export function validateBatchGetResponse(response: BatchGetResponse): validationResult {
    // 日付、出勤、退勤の3つのセル値が必要
    if (response.valueRanges.length !== 3) {
        return { ok: false, error: "列数について、レスポンスが不正です。" };
    }

    // rangeで指定したシートから月を得る
    const expectedMonth = extractMonthFromRange(response.valueRanges[0].range);
    if (!expectedMonth) {
        return { ok: false, error: "シートの月について、レスポンスが不正です。" };
    }

    // レスポンスから各列のセル値の配列を得る
    const dateCol: Array<string | number> = (response.valueRanges[0].values?.[0] ?? []);
    const clockInCol: Array<string | number> = (response.valueRanges[1].values?.[0] ?? []);
    const clockOutCol: Array<string | number> = (response.valueRanges[2].values?.[0] ?? []);

    // 日付列がすべて mm月dd日であることを確認
    for (const v of dateCol) {
        if (typeof v !== "string") {
            return { ok: false, error: "日付列に不正な値があります。" };
        }
        const mmdd = parseMonthDay(v);
        if (!mmdd) {
            return { ok: false, error: `日付の形式が不正です: ${v}` };
        }

        // セルの月がタイトルの月と一致することを確認
        if (mmdd.month !== expectedMonth) {
            return { ok: false, error: `対象月以外の日付があります: ${v}` };
        }
    }

    // 出勤列がすべて空文字か数字で、数字の場合有効な時刻であることを確認
    for (const v of clockInCol) {
        if (v === null || v === '') { continue; }
        const vNum = Number(v);
        if (Number.isNaN(vNum) || vNum < 0 || 24 <= vNum) {
            return { ok: false, error: `出勤時刻が不正です: ${v}` };
        }
    }

    // 退勤列がすべて空文字か数字で、数字の場合有効な時刻であることを確認
    for (const v of clockOutCol) {
        if (v === null || v === '') { continue; }
        const vNum = Number(v);
        if (Number.isNaN(vNum) || vNum < 0 || 24 <= vNum) {
            return { ok: false, error: `退勤時刻が不正です: ${v}` };
        }
    }

    return { ok: true };
}

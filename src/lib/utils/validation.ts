import { StringTuple } from "@/types/common"

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
 * @param str string 判定対象の文字列
 * @returns boolean 半角英数字以外が混じってたらfalse, 混じってないならtrue
 */
function isAlphanumeric(str: string | null): boolean {
    if (!str) { return false }
    return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * 文字がアルファベットがどうか判定する
 * @param ch string 判定対象の文字
 * @returns boolean アルファベットならtrue, そうでないならfalse
 */
function isAlphabet(ch: string | null): boolean {
    if (!ch) { return false; }
    return /^[a-zA-Z]*$/.test(ch);
}

/**
 * 文字列が数字かどうか判定する
 * @param str string 判定対象の文字列
 * @returns boolen 数字ならtrue, そうでないならfalse
 */
function isNumber(str: string | null) {
    if (str === null) { return false; }
    return /^[0-9]*$/.test(str);
}

/**
 * 各セル指定について有効な書式になっているか判定する
 * @param str string 判定対象のセル
 * @returns boolean 無効なセル指定ならfalse、有効ならtrue
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
 * @remarks 引数はcheckCellで有効であることが保証されていることを前提とする
 * @param input stirng 取得対象のセル指定入力値（有効値）
 * @returns `[col, raw]: [string, number]` [列指定のアルファベット 行指定の数字]
 */
function getColAndRow(input: string): [string, number] {
    let i = 0;
    while (i < input.length && (isAlphabet(input[i]))) { i++; }
    const col = input.slice(0, i);
    const row = input.slice(i);
    return [col, Number(row)];
}

/**
 * ユーザーのセル指定入力値についてバリデーションをする
 * @param dateStart:string 日付セル開始位置
 * @param dateEnd :string 日付セル終了位置
 * @param clockInStart :string 出勤セル開始位置
 * @param clockInEnd :string 出勤セル終了位置
 * @param clockOutStart :string 退勤セル開始位置
 * @param clockOutEnd :string 退勤セル終了位置
 * @returns `{ok, error}`: validationResult バリデーションの結果
*/
export function validateSheetRangeForm({
    dateStart,
    dateEnd,
    clockInStart,
    clockInEnd,
    clockOutStart,
    clockOutEnd }: validateSheetRangeFormProps) {
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


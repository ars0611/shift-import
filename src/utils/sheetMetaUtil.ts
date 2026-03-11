import { Ymd, YmdhmTuple } from "@/types/common";
import { BatchGetResponse, SheetData, SpreadsheetMetaResponse } from "@/types/sheet";

type GetTitleByGidProps = {
    sheetJson: SpreadsheetMetaResponse,
    gid: number
}

/**
 * `type SpreadsheetMetaResponse`のjsonを用いてgidからシートタイトルを取得する
 * @param sheetJson json
 * @param gid urlから取得したgid
 * @returns gidに一致するシートのタイトル
 * @throws dataに存在しないgidだった場合、一致するシートがないのでエラー
 */
export function getTitleByGid({ sheetJson, gid }: GetTitleByGidProps): string {
    // data.sheet.propertiesの要素のsheetIdにgidと一致するものがあるか探す
    const hit = (sheetJson.sheets ?? []).find(
        sheet => sheet.properties?.sheetId === gid && typeof sheet.properties.title === "string"
    );

    if (!hit?.properties?.title) {
        throw new Error(`gid=${gid} に一致するシートタイトルが見つかりませんでした`);
    }

    return hit.properties.title;
}

/**
 * セルに入力された時刻をhh:mm形式に整形する（24h）
 * @remarks セルの入力値が正しい前提で使用
 * @param cell セルに入力された時刻
 * @returns セル値の時刻を整形する（例: 10.5 -> 10:30）
 */
export function toTimeLabel(cell: string | number): string {
    // 入力値が空の場合
    if (cell === '') { return ''; }

    // numberにキャスト
    if (typeof cell === "string") {
        const parsed = Number(cell);
        if (Number.isNaN(parsed)) { return ''; }
        cell = parsed;
    }

    // 分に直してから時刻を再計算
    const totalMinutes = cell * 60;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    // 分を0埋めして返す
    return `${hour}:${String(minute).padStart(2, '0')}`;
}

/**
 * batchgetで得たセル値を二次元配列に整形する
 * @param sheetJson json
 * @returns 二次元配列（例: `[[A8:A35の各セルの値], [Z8:Z35の各セルの値], [AA8:AA35の各セルの値]]`）
 */
export function parseBatchGetResponse(sheetJson: BatchGetResponse): SheetData {
    const cols = sheetJson.valueRanges.map(v => v.values?.[0] ?? [] as Array<number | string>);
    return cols;
}

/**
 * batchgetのレスポンスのrangeから月を取得する
 * @param range （例: `"'2026年3月'!A8:A35月"`）
 * @returns `month` 不正な値であれば`null`
 */
export function extractMonthFromRange(range: string): number | null {
    const bangIdx = range.indexOf("!");
    const title = bangIdx >= 0 ? range.slice(0, bangIdx) : range;
    const monthPos = title.indexOf("月");
    // mm月が見つからなかった場合
    if (monthPos < 0) { return null; }

    // 2桁の場合も考慮して'月'のindexからmmを探す
    let i = monthPos - 1;
    while (i >= 0 && title[i] >= '0' && title[i] <= '9') { i--; }
    const month = Number(title.slice(i + 1, monthPos));

    return (!Number.isNaN(month) && month >= 1 && month <= 12) ? month : null;
}

/**
 * batchgetのレスポンスのrangeから年を取得する
 * @param range （例: `"'2026年3月'!A8:A35月"`）
 * @returns `year` 不正な値であれば`null`
 */
export function extractYearFromRange(range: string): number | null {
    const bangIdx = range.indexOf('!');
    const title = bangIdx >= 0 ? range.slice(0, bangIdx) : range;
    const yearPos = title.indexOf('年');
    // yyyy年が見つからなかった場合
    if (yearPos < 0) { return null; }
    const year = Number(title.slice(1, yearPos));

    return (!Number.isNaN(year) ? year : null);
}

/**
 * セルに入力されたmm月dd日から mm, ddを得る
 * @param cell セルに入力されたmm月dd日
 * @returns `month, day` 不正な値であれば`null`
 */
export function parseMonthDay(cell: string): { month: number, day: number } | null {
    const monthPos = cell.indexOf("月");
    const dayPos = cell.indexOf("日");
    if (monthPos <= 0 || dayPos <= monthPos + 1 || dayPos !== cell.length - 1) return null;

    const month = Number(cell.slice(0, monthPos));
    const day = Number(cell.slice(monthPos + 1, dayPos));
    if (Number.isNaN(month) || Number.isNaN(day)) return null;

    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    return { month, day };
}


/**
 * batchgetレスポンスから日付列の初日と最終日を得る
 * @param batchGetResponse バリデーション済みのbatchgetレスポンス
 * @return `timeMin, timeMax` batchgetで得た日付列の初日と最終日
 */
export function getTimeMinMaxFromBatchGetResponse(batchGetResponse: BatchGetResponse): { timeMin: Ymd, timeMax: Ymd } {
    // 日付列はvalueRangesの最初の要素の想定
    const dateValueRange = batchGetResponse.valueRanges[0];
    const year = extractYearFromRange(dateValueRange.range);

    // バリデーション済みなので通り得ない気もするがチェック
    if (year === null) {
        throw new Error("年を取得できませんでした。");
    }

    // 日付列の最初の要素と最後の要素から初日と最終日が得られる
    const firstMonthDay = parseMonthDay(dateValueRange.values[0][0] as string);
    const lastMonthDay = parseMonthDay(dateValueRange.values[0][dateValueRange.values[0].length - 1] as string);

    // バリデーション済みなので通り得ない気もするがチェック
    if (!firstMonthDay || !lastMonthDay) {
        throw new Error("日付セルから月日を取得できませんでした");
    }

    return {
        timeMin: {
            yyyy: year,
            mm: firstMonthDay.month,
            dd: firstMonthDay.day
        },
        timeMax: {
            yyyy: year,
            mm: lastMonthDay.month,
            dd: lastMonthDay.day
        }
    }
}

/**
 * batchgetレスポンスからシフトの日時を得る
 * @param batchGetResponse バリデーション済みのbatchgetレスポンス
 * @return 予定の開始/終了日時の配列
 */
export function getEventTimesFromBatchGetResponse(batchGetResponse: BatchGetResponse): Array<YmdhmTuple> {
    const dateValueRange = batchGetResponse.valueRanges[0];
    const clockInValueRange = batchGetResponse.valueRanges[1];
    const clockOutValueRange = batchGetResponse.valueRanges[2];

    // バリデーション済みなので通り得ない気もするがチェック
    const year = extractYearFromRange(dateValueRange.range);
    if (year === null) {
        throw new Error("年を取得できませんでした。");
    }

    const dateCells = dateValueRange.values?.[0] ?? [];
    const clockInCells = clockInValueRange.values?.[0] ?? [];
    const clockOutCells = clockOutValueRange.values?.[0] ?? [];

    // 最も短い配列に合わせて各日のシフトを見ていく
    const rowCount = Math.min(dateCells.length, clockInCells.length, clockOutCells.length);
    const eventTimes: Array<YmdhmTuple> = [];
    for (let i = 0; i < rowCount; i++) {
        // 勤務なし行はスキップ
        if ((clockInCells[i] === "" || clockInCells[i] === null) && (clockOutCells[i] === "" || clockOutCells[i] === null)) { continue; }

        const monthDay = parseMonthDay(dateCells[i] as string);
        // バリデーション済みなので通り得ない気もするがチェック
        if (monthDay === null) {
            throw new Error("日付を取得できませんでした。");
        }

        // 各セルの入力値は10.5などの時間単位のfloatなので、10:30形式にしてからhour, minuteを得る
        // Todo: toTimeLabelを介するのは冗長なので、10.5 -> hh:mmの{hh, mm}を返す関数を実装する
        const clockInLabel = toTimeLabel(clockInCells[i]);
        const clockOutLabel = toTimeLabel(clockOutCells[i]);
        const [clockInHour, clockInMinute] = clockInLabel.split(':').map(Number);
        const [clockOutHour, clockOutMinute] = clockOutLabel.split(':').map(Number);

        eventTimes.push([
            {
                year,
                month: monthDay.month,
                day: monthDay.day,
                hour: clockInHour,
                minute: clockInMinute
            },
            {
                year,
                month: monthDay.month,
                day: monthDay.day,
                hour: clockOutHour,
                minute: clockOutMinute
            }
        ])
    }

    return eventTimes;
}

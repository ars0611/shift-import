import { CalendarEventIdSourcePair, CalendarEventItem, CalendarEventsListResponse } from "@/types/calendar";
import { Ymd, Ymdhm, YmdhmTuple, YmdTuple } from "@/types/common";

/**  メインのカレンダーに予定作成/削除する*/
const calendarId = "primary";
/** 日本のタイムゾーン */
const jstOffset = "+09:00";

/**
 * 日時の0埋めで使用（ここだけ）
 * @param value :number | string 0埋めしたい数
 * @return :string 2桁まで0埋め
*/
function pad2(value: number | string): string {
    return String(value).padStart(2, "0");
}

type fetchEventsInRange = {
    accessToken: string,
    timeMin: Ymd,
    timeMax: Ymd
}

/**
 * timeMinからtimeMaxの期間の予定を取得し、idとsourceのペアの配列を返す
 * @param accessToken OAuthアクセストークン
 * @param timeMin :Ymd 取得したい期間のはじめ
 * @param timeMax :Ymd 取得したい期間の終わり
 * @throws 取得に失敗したら投げる
 * @returns 指定した期間の予定のIdと予定のプロパティの配列を得る
 * @see https://developers.google.com/workspace/calendar/api/v3/reference/events/list?hl=ja
 */
export async function fetchEventsInRange({ accessToken, timeMin, timeMax }: fetchEventsInRange): Promise<Array<CalendarEventIdSourcePair>> {

    // リクエスト用のURLを組み立てる
    const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?`);
    url.searchParams.append("timeMin", `${timeMin.yyyy}-${pad2(timeMin.mm)}-${pad2(timeMin.dd)}T00:00:00${jstOffset}`);
    url.searchParams.append("timeMax", `${timeMax.yyyy}-${pad2(timeMax.mm)}-${pad2(timeMax.dd)}T13:00:00${jstOffset}`);
    url.searchParams.append("singleEvents", "true");

    // CalendarAPIでEvents: listを取得
    const res = await fetch(
        url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error(`既存の予定の取得に失敗しました: ${res.status}`);
    }

    // idとsourceだけ取り出して返す
    const data: CalendarEventsListResponse = await res.json();
    return (data.items ?? []).map((item: CalendarEventItem): CalendarEventIdSourcePair => ({
        id: item.id,
        source: item.extendedProperties?.private?.source
    }))
}

type DeleteEventProps = {
    accessToken: string,
    eventId: string,
}

/**
 * 指定のeventIdの予定をカレンダーから削除する
 * @param accessToken OAuthアクセストークン
 * @param eventId 
 * @throws 削除失敗時にエラー
 * @returns `void`
 * @see https://developers.google.com/workspace/calendar/api/v3/reference/events/delete?hl=ja&_gl=1*1a39jwu*_up*MQ..*_ga*MzIyMDE3NDAyLjE3NzI4OTIxMTc.*_ga_SM8HXJ53K2*czE3NzI4OTIxMTYkbzEkZzAkdDE3NzI4OTIxMTYkajYwJGwwJGgw
 */
export async function deleteEvent({ accessToken, eventId }: DeleteEventProps): Promise<void> {
    // リクエスト用のurl
    const url =
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}` +
        `/events/${eventId}`;

    // CalendarAPIでEvents: deleteを実行
    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
    });

    // 存在する予定なのに削除できなかった場合
    if (!res.ok && res.status !== 404) {
        throw new Error(`予定の削除に失敗しました: ${res.status}`);
    }

    return;
}

type deleteEventsProps = {
    accessToken: string,
    eventIds: Array<string>

}

/**
 * 複数の予定を削除し、削除件数を返す。
 * @param accsessToken 
 * @param eventIds 削除したいeventIdの配列
 * @returns 削除した予定の件数を返す
 */
export async function deleteEvents({ accessToken, eventIds }: deleteEventsProps): Promise<number> {
    let successCount = 0;
    // rateLimit回避のために数件ずつ実行
    for (let i = 0; i < eventIds.length; i += 4) {
        const chunk = eventIds.slice(i, i + 4);
        const results = await Promise.allSettled(chunk.map((eventId) => deleteEvent({ accessToken, eventId })));
        results.map((result) => {
            if (result.status === "fulfilled") {
                successCount += 1;
            }
        })
    }

    return successCount;
}

type CreateEventProps = {
    accessToken: string,
    startDateTime: Ymdhm,
    endDateTime: Ymdhm
}

/**
 * 指定の開始/終了時刻で予定を作成する
 * @param accessToken OAuthアクセストークン
 * @param startDateTime 予定開始時刻
 * @param endDateTime 予定終了時刻
 * @throws 作成失敗時にエラー
 * @returns `void`
 */
export async function createEvent({ accessToken, startDateTime, endDateTime }: CreateEventProps): Promise<void> {
    // リクエスト用のプロパティ
    const event = {
        summary: "バイト",
        start: { dateTime: `${startDateTime.year}-${pad2(startDateTime.month)}-${pad2(startDateTime.day)}T${pad2(startDateTime.hour)}:${pad2(startDateTime.minute)}:00${jstOffset}` },
        end: { dateTime: `${endDateTime.year}-${pad2(endDateTime.month)}-${pad2(endDateTime.day)}T${pad2(endDateTime.hour)}:${pad2(endDateTime.minute)}:00${jstOffset}` },
        // 一括削除で必要なタグ
        extendedProperties: { private: { source: "shift-import" } }
    }
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`

    // CalendarAPIでEvents: insertを実行
    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(event),
    });

    // リクエスト失敗時
    if (!res.ok) {
        throw new Error(`予定の作成に失敗しました: ${res.status}`);
    }

    return;
}

type createEventsProps = {
    accessToken: string,
    eventTimes: Array<YmdhmTuple>
}

/**
 * 複数の予定を作成し、作成件数を返す。
 * @param accsessToken
 * @param eventTimes 作成したい予定の開始/終了時刻の配列
 * @returns 作成した予定の件数を返す
 */
export async function createEvents({ accessToken, eventTimes }: createEventsProps): Promise<number> {
    let successCount = 0;
    // rateLimit回避のために数件ずつ実行
    for (let i = 0; i < eventTimes.length; i += 4) {
        const chunk = eventTimes.slice(i, i + 4);
        const results = await Promise.allSettled(chunk.map((eventTime) => createEvent({ accessToken, startDateTime: eventTime[0], endDateTime: eventTime[1] })))
        results.map((result) => {
            if (result.status === "fulfilled") {
                successCount += 1
            }
        })
    }

    return successCount;
}

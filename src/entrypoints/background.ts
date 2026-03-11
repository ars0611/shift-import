import { checkGoogleAuth, connectGoogleAuth, getAccessToken } from "@/API/services/authService";
import { createEvents, deleteEvents, fetchEventsInRange } from "@/API/services/importToCalendarService";
import { fetchTitlesAndSpreadsheetId, fetchValues } from "@/API/services/loadSheetService";
import { getNumberFromSyncStorage, setNumberToSyncStorage } from "@/API/services/storageService";
import { getCurrentTabId, getCurrentTabUrl } from "@/API/services/tabService";
import { getShiftImportEventIds } from "@/utils/calendarUtil";
import { calculateEstimatedMonthlyWage } from "@/utils/calculateWageUtil";
import { getNextYearMonth } from "@/utils/commonUtil";
import { extractMonthFromRange, extractYearFromRange, getTimeMinMaxFromBatchGetResponse, getEventTimesFromBatchGetResponse, getTitleByGid } from "@/utils/sheetMetaUtil";
import { getGid, getSpreadsheetId } from "@/utils/translateSheetUrlUtil";
import { validateBatchGetResponse, validateRangesForBatchGet } from "@/utils/validation";
import type { ExtensionMessage } from "@/types/message";

/**
 * @remarks runtimeメッセージを受け取り、各種処理を実行するサービスワーカー。API叩くのはここでやる。
 * @remarks `sendMessage` を非同期で呼ぶため, trueを返す
 * @see https://developer.chrome.com/docs/extensions/develop/concepts/messaging?hl=ja
 */

export default defineBackground(() => {
    /**
     * popupからのメッセージを処理する
     * @param message 受信メッセージ
     * @param sender 送信元の情報
     * @param sendResponse 呼び出し元に応答
     * @returns 非同期応答のため, true
     */
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
        (async () => {
            try {
                if (message.type === "AUTH_CHECK") {
                    // UI非表示でGoogle認証済みかチェックする処理
                    const connected = await checkGoogleAuth();
                    sendResponse({ ok: true, connected, error: connected ? undefined : "認証に失敗しました" });
                    return;

                } else if (message.type === "AUTH_CONNECT") {
                    // Google認証済みかチェックし、未認証であれば認証ページへ遷移させる処理
                    const connected = await connectGoogleAuth();
                    sendResponse({ ok: true, connected, error: connected ? undefined : "認証に失敗しました" });
                    return;

                } else if (message.type === "LOAD_SHEET") {
                    // スプレッドシートを読み込む処理
                    // batchgetで扱うrangesのバリデーション
                    const ranges = message.ranges;
                    const validateRangesForBatchGetRes = validateRangesForBatchGet(ranges);
                    if (!validateRangesForBatchGetRes.ok) {
                        throw new Error(validateRangesForBatchGetRes.error)
                    }

                    // sheetsAPIを叩くのに必要なOAuth2認証トークンを取得
                    const accessToken = await getAccessToken();
                    // sheetsAPIを叩くのに必要なパラメータを取得
                    const currentTabUrl = await getCurrentTabUrl();
                    const spreadsheetId = getSpreadsheetId(currentTabUrl);
                    const gid = getGid(currentTabUrl);
                    const sheetJson = await fetchTitlesAndSpreadsheetId({ accessToken, spreadsheetId });
                    const title: string = getTitleByGid({ sheetJson, gid });

                    // batchGetで得たレスポンスに対してバリデーション
                    const sheetDataByBatchget = await fetchValues({ accessToken, spreadsheetId, title, ranges });
                    const validateBatchGetResponseRes = validateBatchGetResponse(sheetDataByBatchget);
                    if (!validateBatchGetResponseRes.ok) {
                        throw new Error(validateBatchGetResponseRes.error);
                    }

                    // popupにbatchGetのレスポンスを返す
                    sendResponse({ ok: true, connected: true, sheetData: sheetDataByBatchget });
                    return;

                } else if (message.type === "OPEN_MODAL") {
                    // モーダルを開く処理
                    const tabId = await getCurrentTabId();
                    // content側にsendMessage
                    const res = await chrome.tabs.sendMessage(tabId, message);
                    sendResponse({ ok: res.ok });
                    return;

                } else if (message.type === "CLOSE_MODAL") {
                    // モーダルを閉じる処理
                    const tabId = await getCurrentTabId();
                    // content側にsendMessage
                    const res = await chrome.tabs.sendMessage(tabId, message);
                    sendResponse({ ok: res.ok });
                    return;

                } else if (message.type === "IMPORT_TO_CALENDAR") {
                    // カレンダーに予定を取り込む処理
                    // calendarAPIを叩くのに必要なOAuth2認証トークンを取得
                    const accessToken = await getAccessToken();

                    // BatchGetResponseのままメッセージでsheetDataを渡される。
                    const batchGetResponse = message.sheetData;
                    // 一応不正な形式で渡されてないかチェック
                    const validateBatchGetResponseRes = validateBatchGetResponse(batchGetResponse);
                    if (!validateBatchGetResponseRes.ok) {
                        throw new Error(validateBatchGetResponseRes.error);
                    }

                    // batchgetResponseの日付列初日と最終日を得る
                    const { timeMin, timeMax } = getTimeMinMaxFromBatchGetResponse(batchGetResponse);
                    const eventTimes = getEventTimesFromBatchGetResponse(batchGetResponse);
                    // 登録したい期間と被る予定を得る
                    const events = await fetchEventsInRange({ accessToken, timeMin, timeMax });
                    // 得た予定のうち、shift-importで作られた予定のIDのみ得る
                    const eventIds = getShiftImportEventIds(events);

                    // 取り込み直前に、翌月キーで予想月収をsync storageに保存する
                    // batchGetResponseのrangeから読み取ったシフトの年月を得る
                    const dateRange = batchGetResponse.valueRanges[0]?.range ?? "";
                    const year = extractYearFromRange(dateRange);
                    const month = extractMonthFromRange(dateRange);
                    if (year === null || month === null) {
                        throw new Error("年または月の取得に失敗しました。");
                    }

                    // 予想月収は翌月をキーとして保存
                    const { year: nextYear, month: nextMonth } = getNextYearMonth({ year, month });
                    const wageStorageKey = buildMonthlyWageStorageKey({ kind: "expected", year: nextYear, month: nextMonth });

                    // 登録済みの交通費/時給をもとに計算
                    const storageValues = await getNumberFromSyncStorage(["hourlyWage", "transportationFee"]);
                    const totalWage = calculateEstimatedMonthlyWage({ batchGetResponse, hourlyWage: storageValues["hourlyWage"], transportationFee: storageValues["transportationFee"], });
                    // sync storageに登録
                    await setNumberToSyncStorage({ key: wageStorageKey, value: totalWage });

                    // 2度目以降の取り込みでは予定が重複して作られてしまうので、過去作成した予定をいったんすべて消す
                    // Todo: ゆくゆくは差分だけ消せるようにしたい
                    const deletedCount = await deleteEvents({ accessToken, eventIds });
                    const createdCount = await createEvents({ accessToken, eventTimes });
                    sendResponse({ ok: true, connected: true, deletedCount, createdCount });
                    return;

                } else if (message.type === "SET_NUMBER_TO_SYNCSTORAGE") {
                    // ブラウザの同期ストレージに値を格納する処理
                    await setNumberToSyncStorage({ key: message.key, value: message.value })
                    sendResponse({ ok: true, values: { [message.key]: message.value } });
                    return;

                } else if (message.type === "GET_NUMBER_FROM_SYNCSTORAGE") {
                    // ブラウザの同期ストレージから値を取得する処理
                    const res = await getNumberFromSyncStorage(message.keys);
                    sendResponse({ ok: true, values: res });
                    return;
                }

                // 嘘のメッセージが来たらエラー
                throw new Error("無効なメッセージです");
            } catch (e) {
                // 例外処理
                sendResponse({ ok: false, connected: false, error: e instanceof Error ? e.message : String(e) });
            }
        })();

        return true;
    });
})

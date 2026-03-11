/** yyyy/mm/ddを管理する */
export type Ymd = {
    yyyy: number,
    mm: number,
    dd: number
}

/**yyyy/mm/dd/hh/mmを管理する */
export type Ymdhm = {
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number
}

export type ClickHandler = () => unknown | Promise<unknown>;

// 各種タプル
export type YmdhmTuple = [Ymdhm, Ymdhm]
export type YmdTuple = [Ymd, Ymd];

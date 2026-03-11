/**
 * runtime.sendMessage の例外を UI で扱えるエラー文言へ正規化する。
 * @param error `throw new error`で投げられたエラー
 * @param message `throw new error`でエラーメッセージを取れなかった場合の返り値
 * @returns エラーメッセージ
 */
export function toRuntimeErrorMessage(error: unknown,message: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return message;
}


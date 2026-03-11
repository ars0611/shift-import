import { Loader } from "lucide-react";

type LoadingInlineProps = {
    text?: string;
};

/**
 * ローディング表示の共通UI。
 * @param text 表示文言。未指定時は「読み込み中...」
 * @returns インラインで使えるローディング表示
 */
export function LoadingInline({ text = "読み込み中..." }: LoadingInlineProps) {
    return (
        <span className="inline-flex items-center gap-1">
            <Loader className="h-4 w-4 animate-spin" />
            {text}
        </span>
    );
}

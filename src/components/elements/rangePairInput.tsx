type RangePairInputProps = {
    label: string,
    startName: string,
    endName: string,
    startPlaceholder: string,
    endPlaceholder: string,
    startDefaultValue: string,
    endDefaultValue: string
}
/**
 * 読み込むセルの範囲を入力するUIを表示する
 * @param label string
 * @param startName string
 * @param endName string
 * @param startPlaceholder string
 * @param endPlaceholder string 
 * @param startDefaultValue string
 * @param endDefaultValue
 * @returns セルの範囲指定入力UI
 */
export function RangePairInput({
    label,
    startName,
    endName,
    startPlaceholder,
    endPlaceholder,
    startDefaultValue,
    endDefaultValue
}: RangePairInputProps) {
    return (
        <label className="flex gap-3 mb-2">
            <span className="text-sm font-medium">{label}</span>
            <div className="flex items-center">
                <input
                    className="w-24 h-6 px-2 border-[1.5px] border-gray-500 bg-gray-100 rounded"
                    name={startName}
                    placeholder={startPlaceholder}
                    defaultValue={startDefaultValue}
                    required
                />
                <span>：</span>
                <input
                    className="w-24 h-6 px-2 border-[1.5px] border-gray-500 bg-gray-100 rounded"
                    name={endName}
                    placeholder={endPlaceholder}
                    defaultValue={endDefaultValue}
                    required
                />
            </div>
        </label>
    )
}

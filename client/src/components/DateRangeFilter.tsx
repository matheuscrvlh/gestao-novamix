import { DATE_PRESETS, getPresetRange, type DatePreset } from '../lib/date'

type DateRangeFilterProps = {
    inicio: string
    fim: string
    onChangeInicio: (value: string) => void
    onChangeFim: (value: string) => void
}

export default function DateRangeFilter({ inicio, fim, onChangeInicio, onChangeFim }: DateRangeFilterProps) {
    const inputClass =
        'rounded-lg border border-gray-base/30 bg-white px-3 py-2 text-sm text-gray-text dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
    const baseButtonClass = 'px-4 py-2 rounded-lg text-sm font-medium transition border'
    const activeButtonClass = 'bg-orange-base text-white border-orange-base'
    const inactiveButtonClass =
        'bg-white text-gray-text border-gray-base/30 hover:border-orange-base dark:bg-dark-surface dark:text-dark-text dark:border-dark-border'

    function aplicarPreset(preset: DatePreset) {
        const { inicio: novoInicio, fim: novoFim } = getPresetRange(preset)
        onChangeInicio(novoInicio)
        onChangeFim(novoFim)
    }

    return (
        <div className='flex flex-wrap items-center gap-4'>
            <div className='flex flex-wrap gap-2'>
                {DATE_PRESETS.map(({ id, label }) => {
                    const presetRange = getPresetRange(id)
                    const ativo = inicio === presetRange.inicio && fim === presetRange.fim

                    return (
                        <button
                            key={id}
                            type='button'
                            className={`${baseButtonClass} ${ativo ? activeButtonClass : inactiveButtonClass}`}
                            onClick={() => aplicarPreset(id)}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>

            <div className='flex items-center gap-2'>
                <input
                    type='date'
                    value={inicio}
                    onChange={(e) => onChangeInicio(e.target.value)}
                    className={inputClass}
                />
                <span className='text-sm text-gray-dark dark:text-dark-text-muted'>até</span>
                <input
                    type='date'
                    value={fim}
                    onChange={(e) => onChangeFim(e.target.value)}
                    className={inputClass}
                />
            </div>
        </div>
    )
}

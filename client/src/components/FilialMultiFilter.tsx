import { useState, type FocusEvent } from 'react'
import { FILIAIS } from '../constants/filiais'
import { CheckIcon, ChevronDownIcon } from './icons'

type FilialMultiFilterProps = {
    branches: number[]
    selected: number[]
    onChange: (value: number[]) => void
}

export default function FilialMultiFilter({ branches, selected, onChange }: FilialMultiFilterProps) {
    const [open, setOpen] = useState(false)

    const todasSelecionadas = branches.every((id) => selected.includes(id))

    function toggle(id: number) {
        if (selected.includes(id)) {
            const restante = selected.filter((sid) => sid !== id)
            onChange(restante.length > 0 ? restante : branches)
            return
        }
        onChange([...selected, id])
    }

    function fecharSeForaDoContainer(event: FocusEvent<HTMLDivElement>) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpen(false)
        }
    }

    const rotulo = todasSelecionadas
        ? 'Todas as filiais'
        : selected.length === 1
          ? (FILIAIS[selected[0]] ?? `Filial ${selected[0]}`)
          : `${selected.length} filiais selecionadas`

    return (
        <div className='relative' onBlur={fecharSeForaDoContainer}>
            <button
                type='button'
                onClick={() => setOpen((v) => !v)}
                className='flex w-full items-center justify-between gap-3 rounded-lg border border-gray-base/30 bg-white px-4 py-2 text-sm font-medium text-gray-text transition hover:border-orange-base dark:border-dark-border dark:bg-dark-surface dark:text-dark-text'
            >
                <span className='truncate'>{rotulo}</span>
                <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className='absolute z-10 mt-2 w-full min-w-56 overflow-hidden rounded-lg border border-gray-base/30 bg-white shadow-lg dark:border-dark-border dark:bg-dark-surface'>
                    {branches.length > 1 && (
                        <button
                            type='button'
                            onClick={() => onChange(branches)}
                            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium transition ${
                                todasSelecionadas
                                    ? 'bg-orange-base/10 text-orange-base'
                                    : 'text-gray-text hover:bg-gray dark:text-dark-text dark:hover:bg-dark-surface-2'
                            }`}
                        >
                            Todas
                            {todasSelecionadas && <CheckIcon className='h-4 w-4 shrink-0' />}
                        </button>
                    )}
                    {branches.map((id) => {
                        const ativo = selected.includes(id)
                        return (
                            <button
                                key={id}
                                type='button'
                                onClick={() => toggle(id)}
                                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium transition ${
                                    ativo
                                        ? 'bg-orange-base/10 text-orange-base'
                                        : 'text-gray-text hover:bg-gray dark:text-dark-text dark:hover:bg-dark-surface-2'
                                }`}
                            >
                                {FILIAIS[id] ?? `Filial ${id}`}
                                {ativo && <CheckIcon className='h-4 w-4 shrink-0' />}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

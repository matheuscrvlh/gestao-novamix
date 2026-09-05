import { useEffect, useState, type ReactNode } from 'react'
import { CloseIcon, FilterIcon } from './icons'

type FiltersMenuProps = {
    children: ReactNode
}

export default function FiltersMenu({ children }: FiltersMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        const originalHtml = document.documentElement.style.overflow
        const originalBody = document.body.style.overflow
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
        return () => {
            document.documentElement.style.overflow = originalHtml
            document.body.style.overflow = originalBody
        }
    }, [isOpen])

    function fechar() {
        setIsOpen(false)
    }

    return (
        <div className='mb-8'>
            <button
                type='button'
                onClick={() => setIsOpen(true)}
                className='flex items-center gap-2 rounded-lg border border-gray-base/30 bg-white px-4 py-2 text-sm font-medium text-gray-text shadow-sm transition hover:border-orange-base dark:border-dark-border dark:bg-dark-surface dark:text-dark-text'
            >
                <FilterIcon className='h-4 w-4' />
                Filtros
            </button>

            <div
                className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
                    isOpen ? 'pointer-events-auto opacity-50' : 'pointer-events-none opacity-0'
                }`}
                onClick={fechar}
            />

            <aside
                className={`fixed top-0 right-0 z-50 flex h-dvh w-96 max-w-[90vw] flex-col gap-6 overflow-y-auto border-l border-gray-base/30 bg-white p-6 shadow-lg transition-transform duration-300 ease-in-out dark:border-dark-border dark:bg-dark-surface ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className='flex items-center justify-between'>
                    <span className='text-sm font-semibold text-gray-text dark:text-dark-text'>Filtros</span>
                    <button
                        type='button'
                        onClick={fechar}
                        className='rounded-md p-1 text-gray-dark hover:text-orange-base dark:text-dark-text-muted dark:hover:text-orange-light'
                        aria-label='Fechar filtros'
                    >
                        <CloseIcon className='h-5 w-5' />
                    </button>
                </div>

                {children}
            </aside>
        </div>
    )
}

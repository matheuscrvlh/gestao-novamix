import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Logo from './Logo'
import { CloseIcon, LogOutIcon, MenuIcon } from './icons'

type SidebarProps = {
    isAdmin: boolean
}

const HUB_URL = 'https://hub.lojanovamix.com.br'

const linkBaseClass = 'block w-full rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors'
const linkActiveClass = 'bg-orange-base text-white'
const linkInactiveClass =
    'text-gray-text hover:bg-orange-base/10 hover:text-orange-base dark:text-dark-text dark:hover:bg-orange-base/10 dark:hover:text-orange-light'

const PAGINAS: { to: string; label: string }[] = [
    { to: '/metas', label: 'Metas' },
    { to: '/estoque', label: 'Estoque e produtos' },
    { to: '/promocoes', label: 'Promoções' },
]

export default function Sidebar({}: SidebarProps) {
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
        <>
            <button
                type='button'
                onClick={() => setIsOpen((v) => !v)}
                className='fixed top-4 left-4 z-50 rounded-md bg-orange-base p-2 text-white shadow-lg transition-colors hover:bg-orange-light lg:hidden'
                aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
                {isOpen ? <CloseIcon className='h-6 w-6' /> : <MenuIcon className='h-6 w-6' />}
            </button>

            <div
                className={`fixed inset-0 z-30 bg-black transition-opacity duration-300 lg:hidden ${
                    isOpen ? 'pointer-events-auto opacity-50' : 'pointer-events-none opacity-0'
                }`}
                onClick={fechar}
            />

            <aside
                className={`fixed top-0 left-0 z-40 flex h-dvh w-64 flex-col border-r border-gray-base/30 bg-white shadow-sm transition-transform duration-300 ease-in-out dark:border-dark-border dark:bg-dark-surface lg:z-auto lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <Logo compact />

                <nav className='mt-8 flex flex-1 flex-col gap-2 overflow-y-auto px-4'>
                    <NavLink
                        to='/'
                        end
                        onClick={fechar}
                        className={({ isActive }) => `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`}
                    >
                        Dashboard
                    </NavLink>

                    {PAGINAS.map((pagina) => (
                        <NavLink
                            key={pagina.to}
                            to={pagina.to}
                            onClick={fechar}
                            className={({ isActive }) => `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`}
                        >
                            {pagina.label}
                        </NavLink>
                    ))}
                </nav>

                <a
                    href={HUB_URL}
                    className='mx-4 mb-6 flex items-center justify-center gap-2 rounded-lg bg-red-light px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-base'
                >
                    <LogOutIcon className='h-4 w-4' />
                    Voltar ao hub
                </a>
            </aside>
        </>
    )
}

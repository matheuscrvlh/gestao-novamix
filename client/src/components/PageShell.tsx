import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Footer from './Footer'

type PageShellProps = {
    isAdmin: boolean
    loadingMe: boolean
    meError: string | null
    autorizado: boolean
    tituloAcessoRestrito?: string
    titulo: string
    subtitulo: string
    filtros?: ReactNode
    children: ReactNode
}

export default function PageShell({
    isAdmin,
    loadingMe,
    meError,
    autorizado,
    tituloAcessoRestrito = 'Acesso restrito a administradores.',
    titulo,
    subtitulo,
    filtros,
    children,
}: PageShellProps) {
    if (loadingMe) {
        return (
            <div className='flex w-full min-h-screen bg-gray dark:bg-dark-bg'>
                <Sidebar isAdmin={false} />
                <main className='flex-1 min-w-0 flex items-center justify-center lg:ml-64'>
                    <span className='text-sm text-gray-dark dark:text-dark-text-muted'>Carregando...</span>
                </main>
            </div>
        )
    }

    if (meError) {
        return (
            <div className='flex w-full min-h-screen bg-gray dark:bg-dark-bg'>
                <Sidebar isAdmin={false} />
                <main className='flex-1 min-w-0 flex items-center justify-center lg:ml-64'>
                    <span className='text-sm text-red-base'>{meError}</span>
                </main>
            </div>
        )
    }

    if (!autorizado) {
        return (
            <div className='flex w-full min-h-screen bg-gray dark:bg-dark-bg'>
                <Sidebar isAdmin={false} />
                <main className='flex-1 min-w-0 flex items-center justify-center lg:ml-64'>
                    <span className='text-sm font-medium text-red-base'>{tituloAcessoRestrito}</span>
                </main>
            </div>
        )
    }

    return (
        <div className='flex w-full min-h-screen bg-gray dark:bg-dark-bg'>
            <Sidebar isAdmin={isAdmin} />

            <main className='flex-1 min-w-0 flex flex-col lg:ml-64'>
                <section className='flex-1 w-full max-w-6xl mx-auto px-6 pt-20 pb-10 lg:pt-10'>
                    <h1 className='text-2xl font-semibold text-gray-text dark:text-dark-text mb-1'>{titulo}</h1>
                    <p className='text-sm text-gray-dark dark:text-dark-text-muted mb-6'>{subtitulo}</p>

                    {filtros}

                    {children}
                </section>

                <div className='pb-6'>
                    <Footer />
                </div>
            </main>
        </div>
    )
}

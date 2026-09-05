export default function Footer() {
    return (
        <footer className='pt-4 text-center text-xs text-gray-dark dark:text-dark-text-muted'>
            Desenvolvido por{' '}
            <a
                href='https://www.mthcode.com.br/'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-gray-text transition hover:text-orange-base dark:text-dark-text dark:hover:text-orange-light'
            >
                MTHCODE
            </a>{' '}
            e{' '}
            <a
                href='https://www.marlonalves.dev/'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-gray-text transition hover:text-orange-base dark:text-dark-text dark:hover:text-orange-light'
            >
                MarlonAlves
            </a>
        </footer>
    )
}

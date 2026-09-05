type SpinnerProps = {
    className?: string
}

export default function Spinner({ className = 'h-4 w-4' }: SpinnerProps) {
    return (
        <span
            role='status'
            aria-label='Carregando'
            className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-middle text-gray-dark dark:text-dark-text-muted ${className}`}
        />
    )
}

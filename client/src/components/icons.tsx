type IconProps = {
    className?: string
}

export function MenuIcon({ className }: IconProps) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
        >
            <line x1='4' y1='6' x2='20' y2='6' />
            <line x1='4' y1='12' x2='20' y2='12' />
            <line x1='4' y1='18' x2='20' y2='18' />
        </svg>
    )
}

export function CloseIcon({ className }: IconProps) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
        >
            <line x1='6' y1='6' x2='18' y2='18' />
            <line x1='18' y1='6' x2='6' y2='18' />
        </svg>
    )
}

export function FilterIcon({ className }: IconProps) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
        >
            <polygon points='4 4 20 4 14 12 14 19 10 21 10 12 4 4' />
        </svg>
    )
}

export function ChevronDownIcon({ className }: IconProps) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
        >
            <polyline points='6 9 12 15 18 9' />
        </svg>
    )
}

export function CheckIcon({ className }: IconProps) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
        >
            <polyline points='20 6 9 17 4 12' />
        </svg>
    )
}

export function LogOutIcon({ className }: IconProps) {
    return (
        <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
            className={className}
        >
            <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
            <polyline points='16 17 21 12 16 7' />
            <line x1='21' y1='12' x2='9' y2='12' />
        </svg>
    )
}

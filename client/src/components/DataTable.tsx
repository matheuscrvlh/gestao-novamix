import Spinner from './Spinner'

type Column<T> = {
    key: string
    label: string
    align?: 'left' | 'right'
    render: (row: T) => string
    destaque?: (row: T) => boolean
}

type DataTableProps<T> = {
    titulo?: string
    columns: Column<T>[]
    rows: T[]
    loading?: boolean
    erro?: string | null
    rodape?: string
}

export default function DataTable<T>({
    titulo,
    columns,
    rows,
    loading,
    erro,
    rodape,
}: DataTableProps<T>) {
    return (
        <div className='rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6 shadow-sm'>
            {titulo && <span className='text-sm font-medium text-gray-text dark:text-dark-text'>{titulo}</span>}

            {erro && (
                <div className='mt-3 rounded-lg px-4 py-3 text-sm font-medium bg-red-light/10 text-red-base'>
                    {erro}
                </div>
            )}

            {!erro && loading && (
                <div className={`${titulo ? 'mt-4' : ''} flex items-center justify-center py-6`}>
                    <Spinner className='h-5 w-5' />
                </div>
            )}

            {!erro && !loading && rows.length === 0 && (
                <div className='mt-3 text-sm text-gray-dark dark:text-dark-text-muted'>Sem dados.</div>
            )}

            {!erro && !loading && rows.length > 0 && (
                <div className={`${titulo ? 'mt-4' : ''} min-w-0 overflow-x-auto`}>
                    <table className='w-full min-w-max border-collapse text-sm'>
                        <thead>
                            <tr className='border-b border-gray-base/30 dark:border-dark-border'>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted ${
                                            col.align === 'right' ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-base/20 dark:divide-dark-border'>
                            {rows.map((row, index) => (
                                <tr key={index} className='hover:bg-gray/50 dark:hover:bg-dark-surface-2/50'>
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`whitespace-nowrap px-3 py-2 text-gray-text dark:text-dark-text ${
                                                col.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                                            } ${col.destaque?.(row) ? 'font-semibold text-red-base' : ''}`}
                                        >
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {rodape && <p className='mt-3 text-xs text-gray-dark dark:text-dark-text-muted'>{rodape}</p>}
        </div>
    )
}

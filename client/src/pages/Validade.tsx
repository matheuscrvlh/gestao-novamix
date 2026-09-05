import { useState } from 'react'
import PageShell from '../components/PageShell'
import DataTable from '../components/DataTable'
import { useMe } from '../hooks/useMe'
import { useApiResource } from '../hooks/useApiResource'
import { nomeFilial } from '../constants/filiais'
import { formatCurrency, formatNumber, formatDate } from '../lib/format'
import type { ValidadeRow } from '../types/gestao'

const DIAS_DESTAQUE = 7

function diasAte(dataISO: string) {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const data = new Date(`${dataISO}T00:00:00`)
    return Math.round((data.getTime() - hoje.getTime()) / 86400000)
}

export default function Validade() {
    const { me, loading: loadingMe, error: meError } = useMe()
    const habilitado = me !== null

    const [dias, setDias] = useState('30')

    const validade = useApiResource<ValidadeRow[]>('/gestao/validade', { dias }, habilitado)
    const linhas = validade.data ?? []

    const selectClass =
        'rounded-lg border border-gray-base/30 bg-white px-3 py-2 text-sm text-gray-text dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'

    return (
        <PageShell
            isAdmin={me?.isAdmin ?? false}
            loadingMe={loadingMe}
            meError={meError}
            autorizado={me !== null}
            titulo='Validade'
            subtitulo='Produtos com vencimento próximo, por loja.'
            filtros={
                <div className='mb-8 flex flex-col gap-2'>
                    <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                        Janela
                    </span>
                    <select className={`${selectClass} w-fit`} value={dias} onChange={(e) => setDias(e.target.value)}>
                        <option value='7'>Próximos 7 dias</option>
                        <option value='15'>Próximos 15 dias</option>
                        <option value='30'>Próximos 30 dias</option>
                        <option value='60'>Próximos 60 dias</option>
                        <option value='90'>Próximos 90 dias</option>
                    </select>
                </div>
            }
        >
            <DataTable
                columns={[
                    { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                    { key: 'produto', label: 'Produto', render: (r) => r.DESCRICAOPRODUTO.trim() },
                    {
                        key: 'validade',
                        label: 'Vence em',
                        align: 'right',
                        render: (r) => `${formatDate(r.DTVALIDADE.slice(0, 10))} (${diasAte(r.DTVALIDADE.slice(0, 10))}d)`,
                        destaque: (r) => diasAte(r.DTVALIDADE.slice(0, 10)) <= DIAS_DESTAQUE,
                    },
                    { key: 'qtd', label: 'Qtd', align: 'right', render: (r) => formatNumber(r.QTDPRODUTO) },
                    {
                        key: 'valor',
                        label: 'Valor estimado',
                        align: 'right',
                        render: (r) => formatCurrency(r.VALOR_ESTIMADO),
                    },
                ]}
                rows={linhas}
                loading={validade.loading}
                erro={validade.erro}
                rodape={`${linhas.length} lote${linhas.length === 1 ? '' : 's'} — em vermelho, vencendo em até ${DIAS_DESTAQUE} dias.`}
            />
        </PageShell>
    )
}

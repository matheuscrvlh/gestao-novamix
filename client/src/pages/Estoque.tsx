import { useState } from 'react'
import PageShell from '../components/PageShell'
import DataTable from '../components/DataTable'
import DateRangeFilter from '../components/DateRangeFilter'
import { useMe } from '../hooks/useMe'
import { useApiResource } from '../hooks/useApiResource'
import { nomeFilial } from '../constants/filiais'
import { formatCurrency, formatNumber, formatDate } from '../lib/format'
import { getPresetRange } from '../lib/date'
import type { EstoqueResumoResponse } from '../types/gestao'

export default function Estoque() {
    const { me, loading: loadingMe, error: meError } = useMe()
    const habilitado = me !== null

    const [inicio, setInicio] = useState(() => getPresetRange('mes').inicio)
    const [fim, setFim] = useState(() => getPresetRange('mes').fim)
    const [diasParado, setDiasParado] = useState('60')

    const estoque = useApiResource<EstoqueResumoResponse>(
        '/gestao/estoque-resumo',
        { inicio, fim, dias: diasParado },
        habilitado
    )

    const transferencias = estoque.data?.transferencias ?? []
    const negativo = estoque.data?.negativo ?? []
    const parado = estoque.data?.parado ?? []

    const selectClass =
        'rounded-lg border border-gray-base/30 bg-white px-3 py-2 text-sm text-gray-text dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'

    return (
        <PageShell
            isAdmin={me?.isAdmin ?? false}
            loadingMe={loadingMe}
            meError={meError}
            autorizado={me !== null}
            titulo='Estoque'
            subtitulo='Transferências entre lojas, estoque negativo e produtos parados.'
            filtros={
                <div className='mb-8 flex flex-wrap items-end gap-4'>
                    <DateRangeFilter inicio={inicio} fim={fim} onChangeInicio={setInicio} onChangeFim={setFim} />
                    <div className='flex flex-col gap-2'>
                        <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                            Parado há mais de
                        </span>
                        <select className={selectClass} value={diasParado} onChange={(e) => setDiasParado(e.target.value)}>
                            <option value='30'>30 dias</option>
                            <option value='60'>60 dias</option>
                            <option value='90'>90 dias</option>
                            <option value='120'>120 dias</option>
                        </select>
                    </div>
                </div>
            }
        >
            <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mb-4'>Transferências entre lojas</h2>
            <DataTable
                columns={[
                    { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                    { key: 'enviado', label: 'Enviado', align: 'right', render: (r) => formatCurrency(r.VALOR_ENVIADO) },
                    { key: 'recebido', label: 'Recebido', align: 'right', render: (r) => formatCurrency(r.VALOR_RECEBIDO) },
                ]}
                rows={transferencias}
                loading={estoque.loading}
                erro={estoque.erro}
                rodape='Período selecionado no filtro acima.'
            />

            <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mt-8 mb-4'>Estoque negativo</h2>
            <DataTable
                columns={[
                    { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                    { key: 'produto', label: 'Produto', render: (r) => r.DESCRICAOPRODUTO.trim() },
                    { key: 'qtd', label: 'Qtd', align: 'right', render: (r) => formatNumber(r.QTDATUALESTOQUE) },
                ]}
                rows={negativo}
                loading={estoque.loading}
                erro={estoque.erro}
                rodape='Saldo de estoque abaixo de zero — geralmente indica erro de lançamento ou balanço pendente.'
            />

            <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mt-8 mb-4'>Estoque parado</h2>
            <DataTable
                columns={[
                    { key: 'loja', label: 'Loja', render: (r) => nomeFilial(r.IDEMPRESA) },
                    { key: 'produto', label: 'Produto', render: (r) => r.DESCRICAOPRODUTO.trim() },
                    { key: 'qtd', label: 'Qtd', align: 'right', render: (r) => formatNumber(r.QTDATUALESTOQUE) },
                    { key: 'valor', label: 'Valor parado', align: 'right', render: (r) => formatCurrency(r.VALATUALESTOQUE) },
                    {
                        key: 'ultimaVenda',
                        label: 'Última venda',
                        align: 'right',
                        render: (r) => (r.DTULTIMAVENDA ? formatDate(r.DTULTIMAVENDA.slice(0, 10)) : 'Nunca vendeu'),
                    },
                ]}
                rows={parado}
                loading={estoque.loading}
                erro={estoque.erro}
                rodape='Top 50 por valor parado, sem venda no período selecionado ao lado.'
            />
        </PageShell>
    )
}

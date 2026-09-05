import { useState } from 'react'
import PageShell from '../components/PageShell'
import DataTable from '../components/DataTable'
import DateRangeFilter from '../components/DateRangeFilter'
import Spinner from '../components/Spinner'
import { useMe } from '../hooks/useMe'
import { useApiResource } from '../hooks/useApiResource'
import { nomeFilial } from '../constants/filiais'
import { formatCurrency, formatDate, formatNumber, formatPercent } from '../lib/format'
import { getPresetRange } from '../lib/date'
import type { PromocaoRow, StatusPromocao, PromocaoDetalheResponse } from '../types/gestao'

const STATUS_LABEL: Record<StatusPromocao, string> = {
    ativa: 'Ativa',
    futura: 'Futura',
    encerrada: 'Encerrada',
}

const cardClass =
    'rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6 shadow-sm'

export default function Promocoes() {
    const { me, loading: loadingMe, error: meError } = useMe()
    const habilitado = me !== null

    const [inicio, setInicio] = useState(() => getPresetRange('mes').inicio)
    const [fim, setFim] = useState(() => getPresetRange('mes').fim)
    const [promocaoSelecionada, setPromocaoSelecionada] = useState<number | null>(null)

    const promocoes = useApiResource<PromocaoRow[]>('/gestao/promocoes', { inicio, fim }, habilitado)
    const linhas = promocoes.data ?? []

    const detalhe = useApiResource<PromocaoDetalheResponse>(
        promocaoSelecionada ? `/gestao/promocoes/${promocaoSelecionada}` : '/gestao/promocoes/0',
        {},
        habilitado && promocaoSelecionada !== null
    )

    return (
        <PageShell
            isAdmin={me?.isAdmin ?? false}
            loadingMe={loadingMe}
            meError={meError}
            autorizado={me !== null}
            titulo='Promoções'
            subtitulo='Promoções ativas, futuras e encerradas no período.'
            filtros={
                <div className='mb-8'>
                    <DateRangeFilter
                        inicio={inicio}
                        fim={fim}
                        onChangeInicio={(v) => {
                            setInicio(v)
                            setPromocaoSelecionada(null)
                        }}
                        onChangeFim={(v) => {
                            setFim(v)
                            setPromocaoSelecionada(null)
                        }}
                    />
                </div>
            }
        >
            {promocaoSelecionada === null ? (
                <div className={cardClass}>
                    {promocoes.erro ? (
                        <span className='text-sm text-red-base'>{promocoes.erro}</span>
                    ) : promocoes.loading ? (
                        <div className='flex justify-center py-6'>
                            <Spinner className='h-5 w-5' />
                        </div>
                    ) : linhas.length === 0 ? (
                        <p className='text-sm text-gray-dark dark:text-dark-text-muted'>Nenhuma promoção no período.</p>
                    ) : (
                        <ul className='divide-y divide-gray-base/20 dark:divide-dark-border'>
                            {linhas.map((p) => (
                                <li key={p.IDPROMOCAO}>
                                    <button
                                        type='button'
                                        onClick={() => setPromocaoSelecionada(p.IDPROMOCAO)}
                                        className='flex w-full flex-wrap items-center justify-between gap-2 py-2.5 text-left text-sm hover:text-orange-base'
                                    >
                                        <span className='flex items-center gap-2'>
                                            <span
                                                className={`font-semibold ${p.STATUS === 'ativa' ? 'text-red-base' : 'text-gray-dark dark:text-dark-text-muted'}`}
                                            >
                                                {STATUS_LABEL[p.STATUS]}
                                            </span>
                                            <span className='text-gray-text dark:text-dark-text'>{p.DESCRPROMOCAO}</span>
                                        </span>
                                        <span className='shrink-0 text-xs text-gray-dark dark:text-dark-text-muted'>
                                            {formatDate(p.DTINIPROMOCAO.slice(0, 10))} – {formatDate(p.DTFIMPROMOCAO.slice(0, 10))} ·{' '}
                                            {p.QTD_PRODUTOS} produtos · {p.QTD_LOJAS} loja{p.QTD_LOJAS === 1 ? '' : 's'}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <>
                    <button
                        type='button'
                        onClick={() => setPromocaoSelecionada(null)}
                        className='mb-4 text-sm font-medium text-orange-base hover:text-orange-light'
                    >
                        ← Voltar às promoções
                    </button>

                    {detalhe.erro ? (
                        <span className='text-sm text-red-base'>{detalhe.erro}</span>
                    ) : detalhe.loading || !detalhe.data ? (
                        <div className='flex justify-center py-10'>
                            <Spinner className='h-6 w-6' />
                        </div>
                    ) : (
                        <>
                            <div className={cardClass}>
                                <span className='text-lg font-semibold text-gray-text dark:text-dark-text'>
                                    {detalhe.data.DESCRPROMOCAO}
                                </span>
                                <p className='mt-1 text-sm text-gray-dark dark:text-dark-text-muted'>
                                    {formatDate(detalhe.data.DTINIPROMOCAO.slice(0, 10))} até{' '}
                                    {formatDate(detalhe.data.DTFIMPROMOCAO.slice(0, 10))} ·{' '}
                                    {detalhe.data.lojas.map((id) => nomeFilial(id)).join(', ')}
                                </p>
                            </div>

                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6'>
                                <div className={cardClass}>
                                    <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                                        Venda média/dia (durante)
                                    </span>
                                    <div className='mt-2 text-xl font-semibold text-gray-text dark:text-dark-text'>
                                        {detalhe.data.analitico.mediaDiariaDurante != null
                                            ? formatCurrency(detalhe.data.analitico.mediaDiariaDurante)
                                            : '—'}
                                    </div>
                                </div>
                                <div className={cardClass}>
                                    <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                                        Venda média/dia (antes)
                                    </span>
                                    <div className='mt-2 text-xl font-semibold text-gray-text dark:text-dark-text'>
                                        {detalhe.data.analitico.mediaDiariaAntes != null
                                            ? formatCurrency(detalhe.data.analitico.mediaDiariaAntes)
                                            : '—'}
                                    </div>
                                </div>
                                <div className={cardClass}>
                                    <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                                        Variação de venda
                                    </span>
                                    <div
                                        className={`mt-2 text-xl font-semibold ${
                                            detalhe.data.analitico.liftVendaPct != null && detalhe.data.analitico.liftVendaPct < 0
                                                ? 'text-red-base'
                                                : 'text-gray-text dark:text-dark-text'
                                        }`}
                                    >
                                        {detalhe.data.analitico.liftVendaPct != null
                                            ? `${detalhe.data.analitico.liftVendaPct >= 0 ? '+' : ''}${formatPercent(detalhe.data.analitico.liftVendaPct)}`
                                            : '—'}
                                    </div>
                                </div>
                            </div>

                            <h2 className='text-lg font-semibold text-gray-text dark:text-dark-text mt-8 mb-4'>Produtos da promoção</h2>
                            <DataTable
                                columns={[
                                    { key: 'produto', label: 'Produto', render: (r) => r.DESCRICAOPRODUTO },
                                    { key: 'preco', label: 'Preço promo', align: 'right', render: (r) => formatCurrency(r.VALPRECO) },
                                    { key: 'venda', label: 'Venda no período', align: 'right', render: (r) => formatCurrency(r.VENDA) },
                                    { key: 'qtd', label: 'Qtd vendida', align: 'right', render: (r) => formatNumber(r.QTD_VENDIDA) },
                                    {
                                        key: 'antes',
                                        label: 'Venda média/dia antes',
                                        align: 'right',
                                        render: (r) => formatCurrency(r.VENDA_MEDIA_DIARIA_ANTES),
                                    },
                                ]}
                                rows={detalhe.data.produtos}
                                loading={false}
                                erro={null}
                                rodape='"Antes" compara com um período de mesma duração, imediatamente anterior ao início da promoção.'
                            />
                        </>
                    )}
                </>
            )}
        </PageShell>
    )
}

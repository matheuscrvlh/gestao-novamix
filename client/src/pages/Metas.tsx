import { useState } from 'react'
import PageShell from '../components/PageShell'
import Spinner from '../components/Spinner'
import { useMe } from '../hooks/useMe'
import { useApiResource } from '../hooks/useApiResource'
import { nomeFilial } from '../constants/filiais'
import { formatCurrency, formatPercent } from '../lib/format'
import type { EvolucaoMensalResponse, MetasResponse } from '../types/gestao'

const API_URL = import.meta.env.VITE_API_URL
const IDEMPRESA_GERAL = 100

function mesAtualYYYYMM() {
    const hoje = new Date()
    return `${hoje.getFullYear()}${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

function mesesRecentes(qtd: number) {
    const hoje = new Date()
    const meses: { valor: string; label: string }[] = []
    const nomes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    for (let i = 0; i < qtd; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
        const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`
        meses.push({ valor: yyyymm, label: `${nomes[d.getMonth()]}/${String(d.getFullYear()).slice(2)}` })
    }
    return meses
}

function paraMesEvolucao(mesano: string) {
    return `${mesano.slice(0, 4)}-${mesano.slice(4, 6)}`
}

export default function Metas() {
    const { me, loading: loadingMe, error: meError } = useMe()
    const habilitado = me !== null

    const [mesSelecionado, setMesSelecionado] = useState(mesAtualYYYYMM())
    const [refreshTick, setRefreshTick] = useState(0)
    const [salvando, setSalvando] = useState(false)
    const [erroSalvar, setErroSalvar] = useState<string | null>(null)
    const [formLoja, setFormLoja] = useState<number>(IDEMPRESA_GERAL)
    const [formVenda, setFormVenda] = useState('')
    const [formMargem, setFormMargem] = useState('')

    const metas = useApiResource<MetasResponse>(
        '/gestao/metas',
        { mesano: mesSelecionado, _t: String(refreshTick) },
        habilitado
    )
    const evolucao = useApiResource<EvolucaoMensalResponse>('/gestao/evolucao-mensal', { meses: '6' }, habilitado)

    const branchesDisponiveis = me?.branches ?? []
    const mesEvolucao = paraMesEvolucao(mesSelecionado)

    const linhas = branchesDisponiveis.map((idempresa) => {
        const meta = metas.data?.porLoja.find((m) => m.idempresa === idempresa)
        const realizado =
            evolucao.data?.porLoja.find((r) => r.IDEMPRESA === idempresa && r.MES === mesEvolucao)?.FATURAMENTO ?? 0
        const metaVenda = meta?.meta_venda ?? 0
        const pct = metaVenda > 0 ? realizado / metaVenda : null
        return { idempresa, metaVenda, metaMargem: meta?.meta_margem_pct ?? 0, origem: meta?.origem ?? 'nenhuma', realizado, pct }
    })

    // "Geral" é uma meta única da rede (não por loja) — se várias lojas caem nesse
    // fallback, ela conta só uma vez no total, senão a rede fica com a meta
    // multiplicada por loja que não tem meta própria cadastrada.
    const metasGeraisUnicas = new Set(linhas.filter((l) => l.origem === 'geral').map((l) => l.metaVenda))
    const totalMeta =
        linhas.filter((l) => l.origem === 'especifica').reduce((acc, l) => acc + l.metaVenda, 0) +
        Array.from(metasGeraisUnicas).reduce((acc, v) => acc + v, 0)
    const totalRealizado = linhas.reduce((acc, l) => acc + l.realizado, 0)
    const totalPct = totalMeta > 0 ? totalRealizado / totalMeta : null

    async function salvarMeta() {
        setSalvando(true)
        setErroSalvar(null)
        try {
            const res = await fetch(`${API_URL}/gestao/metas`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idempresa: formLoja,
                    mesano: mesSelecionado,
                    meta_venda: Number(formVenda.replace(',', '.')) || 0,
                    meta_margem_pct: Number(formMargem.replace(',', '.')) || 0,
                }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error ?? 'Erro ao salvar meta.')
            }
            setFormVenda('')
            setFormMargem('')
            setRefreshTick((v) => v + 1)
        } catch (err) {
            setErroSalvar(err instanceof Error ? err.message : 'Erro ao salvar meta.')
        } finally {
            setSalvando(false)
        }
    }

    const cardClass =
        'rounded-xl border border-gray-base/30 bg-white dark:bg-dark-surface dark:border-dark-border p-6 shadow-sm'
    const selectClass =
        'rounded-lg border border-gray-base/30 bg-white px-3 py-2 text-sm text-gray-text dark:bg-dark-surface dark:border-dark-border dark:text-dark-text'
    const inputClass = selectClass

    function corBarra(pct: number | null) {
        if (pct === null) return 'bg-gray-base/50'
        if (pct >= 1) return 'bg-green-600'
        if (pct >= 0.7) return 'bg-orange-base'
        return 'bg-red-base'
    }

    return (
        <PageShell
            isAdmin={me?.isAdmin ?? false}
            loadingMe={loadingMe}
            meError={meError}
            autorizado={me !== null}
            titulo='Metas'
            subtitulo='Faturamento realizado vs meta do mês, por loja.'
            filtros={
                <div className='mb-8 flex flex-col gap-2'>
                    <span className='text-xs font-semibold uppercase tracking-wide text-gray-dark dark:text-dark-text-muted'>
                        Mês
                    </span>
                    <select
                        className={`${selectClass} w-fit`}
                        value={mesSelecionado}
                        onChange={(e) => setMesSelecionado(e.target.value)}
                    >
                        {mesesRecentes(6).map((m) => (
                            <option key={m.valor} value={m.valor}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>
            }
        >
            <div className={`${cardClass} mb-6`}>
                <span className='text-sm font-medium text-gray-text dark:text-dark-text'>Rede</span>
                {metas.loading || evolucao.loading ? (
                    <div className='mt-3'>
                        <Spinner className='h-5 w-5' />
                    </div>
                ) : totalMeta === 0 ? (
                    <p className='mt-2 text-sm text-gray-dark dark:text-dark-text-muted'>
                        Sem meta cadastrada para este mês.
                    </p>
                ) : (
                    <>
                        <div className='mt-2 flex items-baseline justify-between'>
                            <span className='text-xl font-semibold text-gray-text dark:text-dark-text'>
                                {formatCurrency(totalRealizado)}
                            </span>
                            <span className='text-sm text-gray-dark dark:text-dark-text-muted'>
                                meta {formatCurrency(totalMeta)}
                            </span>
                        </div>
                        <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-base/20 dark:bg-dark-surface-2'>
                            <div
                                className={`h-full ${corBarra(totalPct)}`}
                                style={{ width: `${Math.min(100, (totalPct ?? 0) * 100)}%` }}
                            />
                        </div>
                        <span className='mt-1 block text-xs text-gray-dark dark:text-dark-text-muted'>
                            {formatPercent(totalPct ?? 0)} da meta
                        </span>
                    </>
                )}
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {linhas.map((l) => (
                    <div key={l.idempresa} className={cardClass}>
                        <span className='text-sm font-medium text-gray-text dark:text-dark-text'>
                            {nomeFilial(l.idempresa)}
                        </span>
                        {metas.loading || evolucao.loading ? (
                            <div className='mt-3'>
                                <Spinner className='h-5 w-5' />
                            </div>
        ) : l.origem !== 'especifica' ? (
                            <>
                                <p className='mt-2 text-sm text-gray-dark dark:text-dark-text-muted'>
                                    Sem meta própria cadastrada para esta loja.
                                </p>
                                <p className='mt-1 text-xs text-gray-dark dark:text-dark-text-muted'>
                                    Faturamento no mês: {formatCurrency(l.realizado)}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className='mt-2 flex items-baseline justify-between'>
                                    <span className='text-lg font-semibold text-gray-text dark:text-dark-text'>
                                        {formatCurrency(l.realizado)}
                                    </span>
                                    <span className='text-xs text-gray-dark dark:text-dark-text-muted'>
                                        meta {formatCurrency(l.metaVenda)}
                                    </span>
                                </div>
                                <div className='mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-base/20 dark:bg-dark-surface-2'>
                                    <div
                                        className={`h-full ${corBarra(l.pct)}`}
                                        style={{ width: `${Math.min(100, (l.pct ?? 0) * 100)}%` }}
                                    />
                                </div>
                                <span className='mt-1 block text-xs text-gray-dark dark:text-dark-text-muted'>
                                    {formatPercent(l.pct ?? 0)} da meta
                                </span>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {me?.isAdmin && (
                <div className={`${cardClass} mt-8`}>
                    <span className='text-sm font-medium text-gray-text dark:text-dark-text'>
                        Cadastrar/atualizar meta — {mesesRecentes(6).find((m) => m.valor === mesSelecionado)?.label}
                    </span>
                    <div className='mt-4 flex flex-wrap items-end gap-3'>
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs text-gray-dark dark:text-dark-text-muted'>Loja</span>
                            <select
                                className={selectClass}
                                value={formLoja}
                                onChange={(e) => setFormLoja(Number(e.target.value))}
                            >
                                <option value={IDEMPRESA_GERAL}>Geral (rede)</option>
                                {branchesDisponiveis.map((id) => (
                                    <option key={id} value={id}>
                                        {nomeFilial(id)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs text-gray-dark dark:text-dark-text-muted'>Meta de venda (R$)</span>
                            <input
                                type='text'
                                inputMode='decimal'
                                className={inputClass}
                                value={formVenda}
                                onChange={(e) => setFormVenda(e.target.value)}
                                placeholder='0,00'
                            />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-xs text-gray-dark dark:text-dark-text-muted'>Meta de margem (%)</span>
                            <input
                                type='text'
                                inputMode='decimal'
                                className={inputClass}
                                value={formMargem}
                                onChange={(e) => setFormMargem(e.target.value)}
                                placeholder='0'
                            />
                        </div>
                        <button
                            type='button'
                            onClick={salvarMeta}
                            disabled={salvando}
                            className='rounded-lg bg-orange-base px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-light disabled:opacity-50'
                        >
                            {salvando ? 'Salvando…' : 'Salvar'}
                        </button>
                    </div>
                    {erroSalvar && <p className='mt-2 text-sm text-red-base'>{erroSalvar}</p>}
                </div>
            )}
        </PageShell>
    )
}

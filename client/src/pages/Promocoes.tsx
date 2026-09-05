import { useState } from 'react'
import PageShell from '../components/PageShell'
import DataTable from '../components/DataTable'
import DateRangeFilter from '../components/DateRangeFilter'
import { useMe } from '../hooks/useMe'
import { useApiResource } from '../hooks/useApiResource'
import { formatDate } from '../lib/format'
import { getPresetRange } from '../lib/date'
import type { PromocaoRow, StatusPromocao } from '../types/gestao'

const STATUS_LABEL: Record<StatusPromocao, string> = {
    ativa: 'Ativa',
    futura: 'Futura',
    encerrada: 'Encerrada',
}

export default function Promocoes() {
    const { me, loading: loadingMe, error: meError } = useMe()
    const habilitado = me !== null

    const [inicio, setInicio] = useState(() => getPresetRange('mes').inicio)
    const [fim, setFim] = useState(() => getPresetRange('mes').fim)

    const promocoes = useApiResource<PromocaoRow[]>('/gestao/promocoes', { inicio, fim }, habilitado)
    const linhas = promocoes.data ?? []

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
                    <DateRangeFilter inicio={inicio} fim={fim} onChangeInicio={setInicio} onChangeFim={setFim} />
                </div>
            }
        >
            <DataTable
                columns={[
                    { key: 'status', label: 'Status', render: (r) => STATUS_LABEL[r.STATUS], destaque: (r) => r.STATUS === 'ativa' },
                    { key: 'descricao', label: 'Promoção', render: (r) => r.DESCRPROMOCAO },
                    { key: 'inicio', label: 'Início', align: 'right', render: (r) => formatDate(r.DTINIPROMOCAO.slice(0, 10)) },
                    { key: 'fim', label: 'Fim', align: 'right', render: (r) => formatDate(r.DTFIMPROMOCAO.slice(0, 10)) },
                    { key: 'produtos', label: 'Produtos', align: 'right', render: (r) => String(r.QTD_PRODUTOS) },
                    { key: 'lojas', label: 'Lojas', align: 'right', render: (r) => String(r.QTD_LOJAS) },
                ]}
                rows={linhas}
                loading={promocoes.loading}
                erro={promocoes.erro}
            />
        </PageShell>
    )
}

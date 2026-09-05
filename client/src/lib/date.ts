export type DatePreset = 'hoje' | 'ontem' | 'semana' | 'mes'

export const DATE_PRESETS: { id: DatePreset; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'ontem', label: 'Ontem' },
    { id: 'semana', label: 'Essa semana' },
    { id: 'mes', label: 'Esse mês' },
]

function toISODate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function startOfWeek(date: Date) {
    const result = new Date(date)
    const diffToMonday = result.getDay() === 0 ? 6 : result.getDay() - 1
    result.setDate(result.getDate() - diffToMonday)
    return result
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getPresetRange(preset: DatePreset): { inicio: string; fim: string } {
    const hoje = new Date()

    switch (preset) {
        case 'hoje':
            return { inicio: toISODate(hoje), fim: toISODate(hoje) }
        case 'ontem': {
            const ontem = new Date(hoje)
            ontem.setDate(hoje.getDate() - 1)
            return { inicio: toISODate(ontem), fim: toISODate(ontem) }
        }
        case 'semana':
            return { inicio: toISODate(startOfWeek(hoje)), fim: toISODate(hoje) }
        case 'mes':
            return { inicio: toISODate(startOfMonth(hoje)), fim: toISODate(hoje) }
    }
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * "Mês fechado" = mês calendário anterior ao atual (o mês corrente nunca conta,
 * porque ainda está em andamento e o contábil dele é parcial).
 */
export function getUltimoMesFechado(): { inicio: string; fim: string; label: string } {
    const hoje = new Date()
    const fim = endOfMonth(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1))
    const inicio = new Date(fim.getFullYear(), fim.getMonth(), 1)
    return { inicio: toISODate(inicio), fim: toISODate(fim), label: formatMes(toISODate(fim)) }
}

export function getUltimosMesesFechados(qtd: number): { inicio: string; fim: string } {
    const hoje = new Date()
    const fim = endOfMonth(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1))
    const inicio = new Date(fim.getFullYear(), fim.getMonth() - (qtd - 1), 1)
    return { inicio: toISODate(inicio), fim: toISODate(fim) }
}

const NOMES_MES = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
]

export function formatMes(mes: string) {
    const [ano, mesNum] = mes.split('-')
    return `${NOMES_MES[Number(mesNum) - 1]}/${ano.slice(2)}`
}

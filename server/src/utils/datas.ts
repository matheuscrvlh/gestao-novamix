export function primeiroDiaMesesAtras(meses: number) {
    const hoje = new Date()
    const data = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - (meses - 1), 1))
    return data.toISOString().slice(0, 10)
}

export function primeiroDiaDoMes(mes: string) {
    return `${mes}-01`
}

export function primeiroDiaProximoMes(mes: string) {
    const [ano, mesNum] = mes.split('-').map(Number)
    const data = new Date(Date.UTC(ano, mesNum, 1))
    return data.toISOString().slice(0, 10)
}

export function mesAtual() {
    return new Date().toISOString().slice(0, 7)
}

export function hojeISO() {
    return new Date().toISOString().slice(0, 10)
}

export function diasEntreISO(inicioISO: string, fimISO: string) {
    const inicio = new Date(`${inicioISO}T00:00:00Z`)
    const fim = new Date(`${fimISO}T00:00:00Z`)
    return Math.max(1, Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1)
}

export function deslocarDiasISO(dataISO: string, dias: number) {
    const d = new Date(`${dataISO}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + dias)
    return d.toISOString().slice(0, 10)
}

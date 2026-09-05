export const FILIAIS: Record<number, string> = {
    1: 'Prado',
    2: 'Centro',
    3: 'Olaria',
    4: 'Teresópolis',
    99: 'E-commerce',
}

export function nomeFilial(id: number) {
    return FILIAIS[id] ?? `Filial ${id}`
}

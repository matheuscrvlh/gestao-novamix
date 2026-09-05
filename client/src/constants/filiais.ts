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

const FILIAL_ECOMMERCE = 99
const FILIAL_ORIGEM_ECOMMERCE = 1

/**
 * Vendas do vendedor Tray (e-commerce) ficam no estoque físico do Prado (IDEMPRESA=1),
 * mas as queries remapeiam essas linhas para IDEMPRESA=99. Quem enxerga o Prado também
 * enxerga essas linhas no resultado da query, então liberamos o filtro de e-commerce
 * automaticamente pra quem tem acesso à filial 1.
 */
export function comFiltroEcommerce(branches: number[]) {
    if (branches.includes(FILIAL_ORIGEM_ECOMMERCE) && !branches.includes(FILIAL_ECOMMERCE)) {
        return [...branches, FILIAL_ECOMMERCE]
    }
    return branches
}

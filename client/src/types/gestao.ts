export interface MeInfo {
    permission: string
    branches: number[]
    isAdmin: boolean
}

export interface BaseRow {
    IDEMPRESA: number
    NOME_EMPRESA: string
}

export interface EvolucaoLojaRow {
    IDEMPRESA: number
    MES: string
    FATURAMENTO: number
    LUCRO: number
}

export interface EvolucaoRedeRow {
    MES: string
    FATURAMENTO: number
    LUCRO: number
    MARGEM: number
}

export interface EvolucaoMensalResponse {
    porLoja: EvolucaoLojaRow[]
    rede: EvolucaoRedeRow[]
}

export interface TopProdutoRow {
    PRODUTO: string
    FATURAMENTO: number
    QUANTIDADE: number
    LUCRO: number
    NRO_CUPONS: number
    MARGEM: number
}

export interface TopProdutosResponse {
    mes: string
    produtos: TopProdutoRow[]
}

export interface TransferenciaRow {
    IDEMPRESA: number
    VALOR_ENVIADO: number
    VALOR_RECEBIDO: number
}

export interface EstoqueNegativoRow {
    IDEMPRESA: number
    IDSUBPRODUTO: number
    DESCRICAOPRODUTO: string
    IDCODBARPROD: number
    QTDATUALESTOQUE: number
    VALATUALESTOQUE: number
}

export interface EstoqueParadoRow {
    IDEMPRESA: number
    IDSUBPRODUTO: number
    DESCRICAOPRODUTO: string
    IDCODBARPROD: number
    QTDATUALESTOQUE: number
    VALATUALESTOQUE: number
    DTULTIMAVENDA: string | null
}

export interface EstoqueResumoResponse {
    transferencias: TransferenciaRow[]
    negativo: EstoqueNegativoRow[]
    parado: EstoqueParadoRow[]
}

export interface ValidadeRow {
    IDEMPRESA: number
    IDPLANILHA: number
    IDSUBPRODUTO: number
    DESCRICAOPRODUTO: string
    IDCODBARPROD: number
    DTLANCAMENTO: string | null
    DTVALIDADE: string
    QTDPRODUTO: number
    VALOR_ESTIMADO: number
}

export type StatusPromocao = 'ativa' | 'futura' | 'encerrada'

export interface PromocaoRow {
    IDPROMOCAO: number
    DESCRPROMOCAO: string
    DTINIPROMOCAO: string
    DTFIMPROMOCAO: string
    QTD_PRODUTOS: number
    QTD_LOJAS: number
    STATUS: StatusPromocao
}

export interface MetaLojaResolvida {
    idempresa: number
    meta_venda: number
    meta_margem_pct: number
    origem: 'especifica' | 'geral' | 'nenhuma'
}

export interface MetaLojaBruta {
    id: number
    idempresa: number
    mesano: string
    meta_venda: number
    meta_margem_pct: number
}

export interface MetasResponse {
    mesano: string
    porLoja: MetaLojaResolvida[]
    bruto?: MetaLojaBruta[]
}

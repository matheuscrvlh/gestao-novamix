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
    N_CUPONS: number
}

export interface EvolucaoRedeRow {
    MES: string
    FATURAMENTO: number
    LUCRO: number
    N_CUPONS: number
    MARGEM: number
    TICKET_MEDIO: number
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

export interface ProdutoBuscaRow {
    IDSUBPRODUTO: number
    DESCRICAOPRODUTO: string
    IDCODBARPROD: number
    DESCRSECAO: string | null
}

export interface ProdutoCadastro {
    IDSUBPRODUTO: number
    DESCRICAOPRODUTO: string
    FABRICANTE: string | null
    IDCODBARPROD: number
    EMBALAGEMSAIDA: string | null
    PESOLIQUIDO: number | null
    DESCRDIVISAO: string | null
    DESCRSECAO: string | null
    DESCRGRUPO: string | null
    DESCRSUBGRUPO: string | null
}

export interface ProdutoEstoquePrecoRow {
    IDEMPRESA: number
    QTDATUALESTOQUE: number | null
    VALATUALESTOQUE: number | null
    VALPRECOVENDA: number | null
    DTULTIMAVENDA: string | null
}

export interface ProdutoVendaRecenteRow {
    IDEMPRESA: number
    VENDA: number
    LUCRO: number
    QTD_VENDIDA: number
}

export interface ProdutoDetalheResponse {
    cadastro: ProdutoCadastro
    estoquePreco: ProdutoEstoquePrecoRow[]
    vendaRecente: ProdutoVendaRecenteRow[]
}

export interface PromocaoProdutoDesempenho {
    IDSUBPRODUTO: number
    DESCRICAOPRODUTO: string
    IDCODBARPROD: number
    VALPRECO: number
    VALDESCONTO: number
    PERDESCONTO: number
    VENDA: number
    LUCRO: number
    QTD_VENDIDA: number
    VENDA_MEDIA_DIARIA_ANTES: number
    QTD_MEDIA_DIARIA_ANTES: number
}

export interface PromocaoDetalheResponse {
    IDPROMOCAO: number
    DESCRPROMOCAO: string
    DTINIPROMOCAO: string
    DTFIMPROMOCAO: string
    lojas: number[]
    produtos: PromocaoProdutoDesempenho[]
    analitico: {
        mediaDiariaDurante: number | null
        mediaDiariaAntes: number | null
        liftVendaPct: number | null
        diasComparados: number
    }
}

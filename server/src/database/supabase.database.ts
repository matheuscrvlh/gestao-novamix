import { Pool, types } from 'pg'

const OID_INT8 = 20
const OID_NUMERIC = 1700

types.setTypeParser(OID_INT8, (value) => parseInt(value, 10))
types.setTypeParser(OID_NUMERIC, (value) => parseFloat(value))

export const supabasePool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
})

// Este projeto só cria/altera objetos dentro do schema "gestao" — os demais
// schemas do mesmo Supabase (ex: "comercial") são de outros módulos e só
// podem ser lidos, nunca escritos, a partir daqui.
await supabasePool.query(`CREATE SCHEMA IF NOT EXISTS gestao`)

await supabasePool.query(`
    CREATE TABLE IF NOT EXISTS gestao.metas_loja (
        id BIGSERIAL PRIMARY KEY,
        idempresa INTEGER NOT NULL,
        mesano TEXT NOT NULL,
        meta_venda NUMERIC NOT NULL DEFAULT 0,
        meta_margem_pct NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (idempresa, mesano)
    )
`)

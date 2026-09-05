import 'dotenv/config';
import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { gestaoRoutes } from './routes/gestao.routes';
import { connCiss } from './database/ciss.database.ts';
import './database/supabase.database.ts';

const app = fastify();

await app.register(cors, {
    origin: ['https://hub.lojanovamix.com.br', 'http://localhost:5173'],
    credentials: true
});

if(!process.env.SERVER_PORT) {
    throw new Error('Erro ao encontrar SERVER_PORT no .env.')
} else if (!process.env.JWT_SECRET) {
    throw new Error('Erro ao encontrar JWT_SECRET no .env.')
} else if (!process.env.CISS_DATABASE_URL) {
    throw new Error('Erro ao encontrar CISS_DATABASE_URL no .env.')
} else if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('Erro ao encontrar SUPABASE_DATABASE_URL no .env.')
};

app.register(cookie);
app.register(gestaoRoutes);

async function start() {
    await app.listen({ host: '0.0.0.0', port: process.env.SERVER_PORT})
    console.log(`Servidor rodando em ${process.env.SERVER_PORT}`);
    
    const conn = await connCiss()
    await conn.query(`SELECT CURRENT TIMESTAMP FROM SYSIBM.SYSDUMMY1`)
    console.log(`Banco CISS conectado.`);
    await conn.close()
}

start()

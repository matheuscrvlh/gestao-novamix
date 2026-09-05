import ibmdb from 'ibm_db'

const connStr = process.env.CISS_DATABASE_URL

export async function connCiss() {
    try {
        const conn = await ibmdb.open(connStr);
        return conn
    } catch (error) {
        console.log(error)
        throw new Error('Erro ao conectar no banco CISS')
    }
}
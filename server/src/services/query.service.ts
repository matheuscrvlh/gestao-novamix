import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function loadQueryGestao(filename: string) {
    const filePath = path.join(__dirname, '../queries/gestao', filename)
    return fs.readFileSync(filePath, 'utf8')
}

import type { FastifyRequest, FastifyReply } from "fastify"
import { verifyToken } from "../utils/jwt";

export interface AuthUser {
    permissions: { module: string, access: string}[];
    branchs: { id: number }[];
}

declare module 'fastify' {
    interface FastifyRequest {
        user: AuthUser
    }
}

export async function authenticate(req:FastifyRequest, res:FastifyReply) {
    const authHeader = req.headers['authorization'];
    const token = req.cookies.token ?? authHeader?.split(' ')[1];
    
    if(!token) {
        return res.code(401).send({ error: 'Autorização não encontrada.'})
    }

    try {
        req.user = await verifyToken(token)
        console.log(req.user)
    } catch {
        return res.code(401).send({ error: 'Token inválido ou expirado.'})
    }
}

export async function checkPermission(req:FastifyRequest, res:FastifyReply) {
    const { permissions } = req.user
    
    const module = permissions.some(p => p.module === 'gestao')

    if(!module) {
        res.code(401).send({ error: 'Módulo não liberado para esse usuário.'})
        return
    }

    const permission = permissions.find(p => p.module === 'gestao').access
    
    return permission
}

export async function checkBranch(req:FastifyRequest, res:FastifyReply) {
    const { branchs } = req.user

    const branch = branchs.map(b => b.id)

    if(branch.length === 0) {
        res.code(401).send({ error: 'Filial para este usuário não encontrada'})
        return
    }

    return branch
}
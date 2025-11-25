import { getPool } from '../../lib/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return res.status(401).json([]);

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // Somente ADMIN pode ver locais de qualquer cliente
    // (se quiser permitir cliente comum, posso ajustar)
    if (user.perfil !== 'admin') return res.status(403).json([]);

    const clienteId = req.query.cliente;
    if (!clienteId) return res.status(400).json({ error: "missing cliente id" });

    const pool = await getPool();

    const [rows] = await pool.query(
      `SELECT DISTINCT local 
       FROM air_quality 
       WHERE hubspot = ? 
       ORDER BY local ASC`,
      [clienteId]
    );

    return res.json(rows);
  } catch (e) {
    return res.status(401).json([]);
  }
}

import { getPool } from '../../lib/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;
  if (!token) return res.status(401).json([]);

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (user.perfil !== 'admin') return res.status(403).json([]);

    const pool = await getPool();

    const [rows] = await pool.query(
      'SELECT id, nome, sobrenome, email, hubspot FROM Users WHERE hubspot IS NOT NULL'
    );

    return res.json(rows);
  } catch (e) {
    return res.status(401).json([]);
  }
}

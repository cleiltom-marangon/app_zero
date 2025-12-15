import { getPool } from '../../lib/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req, res) {
  console.log('--- /api/locais ---');

  console.log('Headers:', req.headers);

  const cookies = cookie.parse(req.headers.cookie || '');
  console.log('Cookies parsed:', cookies);

  const token = cookies.token;
  console.log('Token exists?', !!token);

  if (!token) {
    console.log('❌ SEM TOKEN → 401');
    return res.status(401).json([]);
  }

  try {
    console.log('JWT_SECRET exists?', !!process.env.JWT_SECRET);

    const user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    console.log('User decoded from token:', user);

    let clienteId = req.query.cliente;
    console.log('Cliente query param:', clienteId);

    if (!clienteId) {
      console.log('❌ SEM CLIENTE → 400');
      return res.status(400).json({ error: 'missing cliente id' });
    }

    if (user.perfil !== 'admin') {
      console.log('Usuário NÃO é admin, forçando cliente do token:', user.hubspot);
      clienteId = user.hubspot;
    } else {
      console.log('Usuário ADMIN');
    }

    const pool = await getPool();
    console.log('DB pool OK');

    const [rows] = await pool.query(
      `SELECT DISTINCT local 
       FROM air_quality 
       WHERE hubspot = ? 
       ORDER BY local ASC`,
      [clienteId]
    );

    console.log('Rows returned:', rows);

    return res.json(rows);
  } catch (e) {
    console.log('❌ ERRO NO TRY:', e.message);
    return res.status(401).json([]);
  }
}

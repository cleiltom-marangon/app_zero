import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'missing' });

  const pool = await getPool();

    const [rows] = await pool.query(
    'SELECT id, nome AS name, email, password, perfil, hubspot FROM Users WHERE email=?',
    [email]
  );

  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'invalid' });

  const ok =
    password === user.password ||
    (await bcrypt.compare(password, user.password));

  if (!ok) return res.status(401).json({ error: 'invalid' });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      perfil: user.perfil,
      hubspot: user.hubspot,
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '8h' }
  );

  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}`
  );

  return res.json({
    id: user.id,
    email: user.email,
    perfil: user.perfil,
    hubspot: user.hubspot,
    name: user.name, 
  });
}

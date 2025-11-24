import { getPool } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

async function getUserFromReq(req){
  const cookies=cookie.parse(req.headers.cookie||'');
  const token=cookies.token;
  if(!token) return null;
  try { return jwt.verify(token,process.env.JWT_SECRET||'dev-secret'); }
  catch(e){ return null; }
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).end();
  const user=await getUserFromReq(req);
  if(!user) return res.status(401).json({error:'unauth'});
  const pool=await getPool();
  const cliente=req.query.cliente;

  if (user.perfil==='admin' && (!cliente || cliente==='')) {
    // admin default: return last reading per client
    const [rows]=await pool.query(`SELECT a.* FROM air_quality a
      JOIN (SELECT cliente, MAX(data_hora) ts FROM air_quality GROUP BY cliente) b
      ON a.cliente=b.cliente AND a.data_hora=b.ts
      ORDER BY a.data_hora DESC
    `);
    return res.json(rows);
  }

  const target = cliente || user.hubspot;
  if(!target) return res.status(400).json({error:'missing cliente'});
  if(Number(target)!==Number(user.hubspot) && user.perfil!=='admin') return res.status(403).json({error:'forbidden'});

  const [rows]=await pool.query('SELECT id, cliente, local, temperatura_interna AS temp_in, temperatura_externa AS temp_ex, umidade AS hum_in, umidade_externa AS hum_ex, dioxido_carbono AS co2, formaldeido AS form, pm25, pm10, data_hora FROM air_quality WHERE cliente=? ORDER BY data_hora DESC LIMIT 200',[target]);
  return res.json(rows);
}

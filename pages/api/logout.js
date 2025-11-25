export default function handler(req, res) {
  // Expira imediatamente o cookie token
  res.setHeader(
    "Set-Cookie",
    `token=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure`
  );
  return res.json({ ok: true });
}

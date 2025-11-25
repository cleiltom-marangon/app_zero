import { useContext, useState, useEffect } from "react";
import axios from "axios";
import useSWR from "swr";
import styled, { ThemeProvider } from "styled-components";
import { AuthContext } from "./_app";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const fetcher = (url) => axios.get(url, { withCredentials: true }).then((r) => r.data);

// ----- Themes -----
const light = {
  bg: "linear-gradient(135deg,#f9fff9 0%,#f3fdf3 100%)",
  pageBg: "#f6f9f6",
  text: "#062c15",
  cardBg: "#ffffff",
  border: "#e6e6e6",
  primary: "#00ab30",
  muted: "#666",
  chart: {
    tempIn: "#ff7300",
    tempEx: "#ffb000",
    humIn: "#0070f0",
    humEx: "#00b4ff",
    co2: "#32a852",
    form: "#aa00ff",
    pm25: "#0057e7",
    pm10: "#ff5722",
  },
};

const dark = {
  bg: "linear-gradient(135deg,#07110a 0%,#091512 100%)",
  pageBg: "#07110a",
  text: "#e6ffee",
  cardBg: "#0b1610",
  border: "#16321f",
  primary: "#47d16b",
  muted: "#9fbf9f",
  chart: {
    tempIn: "#ff9e5a",
    tempEx: "#ffd07a",
    humIn: "#7fb8ff",
    humEx: "#8fe6ff",
    co2: "#8fe6a3",
    form: "#c48bff",
    pm25: "#65a3ff",
    pm10: "#ff9270",
  },
};

// ------------------ styled-components ------------------

const Page = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px;
  font-family: "Inter", sans-serif;
  color: ${(p) => p.theme.text};
  min-height: 100vh;
  background: ${(p) => p.theme.bg};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 12px;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h1 {
    color: ${(p) => p.theme.primary};
    margin: 0;
    font-size: 20px;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: ${(p) => p.theme.muted};
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    .right {
      justify-content: space-between;
      margin-top: 8px;
    }
  }
`;

const Logo = styled.img`
  height: 44px;
  border-radius: 8px;
  background: rgba(255,255,255,0.02);
  padding: 4px;
`;

// login
const LoginBox = styled.main`
  max-width: 420px;
  margin: 80px auto;
  padding: 26px;
  border-radius: 14px;
  background: ${(p) => p.theme.cardBg};
  box-shadow: 0 6px 18px rgba(2,8,0,0.08);
  color: ${(p) => p.theme.text};

  h1 {
    text-align: center;
    color: ${(p) => p.theme.primary};
    margin: 0 0 8px 0;
    font-size: 20px;
  }

  input {
    width: 100%;
    padding: 12px;
    margin-top: 12px;
    border-radius: 8px;
    border: 1px solid ${(p) => p.theme.border};
    background: transparent;
    color: ${(p) => p.theme.text};
  }

  button {
    width: 100%;
    padding: 12px;
    margin-top: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: ${(p) => p.theme.primary};
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    transition: 0.15s;
  }

  button:hover {
    filter: brightness(0.95);
  }

  img {
    display: block;
    margin: 0 auto 12px;
  }
`;

// layout
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: ${(p) => p.theme.cardBg};
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid ${(p) => p.theme.border};
  box-shadow: 0 6px 18px rgba(2,8,0,0.03);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: ${(p) => p.theme.text};

  h3 {
    margin: 0;
    font-size: 16px;
    color: ${(p) => p.theme.text};
  }
  .subtitle {
    font-size: 12px;
    color: ${(p) => p.theme.muted};
  }
`;

const Section = styled.section`
  margin-top: 20px;

  h2 {
    color: ${(p) => p.theme.text};
    border-left: 5px solid ${(p) => p.theme.primary};
    padding-left: 10px;
    margin: 0 0 10px 0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid ${(p) => p.theme.border};
  background: ${(p) => p.theme.cardBg};
  color: ${(p) => p.theme.text};
`;

// small controls row
const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  button {
    background: transparent;
    border: 1px solid ${(p) => p.theme.border};
    color: ${(p) => p.theme.text};
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }

  .primary {
    background: ${(p) => p.theme.primary};
    color: #fff;
    border-color: ${(p) => p.theme.primary};
  }
`;

// ---------------------------------------------------------
export default function Home() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [cliente, setCliente] = useState(null);
  const [clients, setClients] = useState([]);
  const [themeName, setThemeName] = useState("light");

  useEffect(() => {
    // load theme from localStorage
    const t = typeof window !== "undefined" ? localStorage.getItem("zg_theme") : null;
    if (t) setThemeName(t);
  }, []);

  useEffect(() => {
    if (user && user.perfil === "admin") {
      axios.get("/api/clients", { withCredentials: true }).then((r) => setClients(r.data)).catch(() => {});
    } else if (user) {
      setCliente(user.hubspot);
    }
  }, [user]);

  const endpoint = () =>
    user && cliente
      ? `/api/air/${cliente}`
      : user && user.hubspot
      ? `/api/air/${user.hubspot}`
      : null;

  const { data, error } = useSWR(endpoint, fetcher, {
    refreshInterval: 10000,
  });

  async function login() {
    try {
      const r = await axios.post("/api/login", form, { withCredentials: true });
      setUser(r.data);
    } catch (e) {
      alert("Login inválido");
    }
  }

  async function logout() {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch (e) {
      // ignore
    }
    setUser(null);
    // reload to clear state if needed
    if (typeof window !== "undefined") window.location.href = "/";
  }

  function toggleTheme() {
    const next = themeName === "light" ? "dark" : "light";
    setThemeName(next);
    if (typeof window !== "undefined") localStorage.setItem("zg_theme", next);
  }

  // ---------------- LOGIN -----------------
  if (!user) {
    return (
      <ThemeProvider theme={themeName === "dark" ? dark : light}>
        <LoginBox>
          {/* logo path (local file you uploaded) */}
          <img src="/logo/zerogas.webp" alt="ZeroGas" style={{ width: 130 }} />
          <h1>ZeroGas — Login</h1>
          <input placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button onClick={login}>Entrar</button>
        </LoginBox>
      </ThemeProvider>
    );
  }

  // ---------------- DASHBOARD -----------------
  return (
    <ThemeProvider theme={themeName === "dark" ? dark : light}>
      <Page>
        <Header>
          <div className="left">
            <Logo src="/logo/zerogas.webp" alt="logo" />
            <h1>ZeroGas Dashboard</h1>
          </div>

          <div className="right">
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600 }}>
                {user.nome ? `${user.nome} ${user.sobrenome}` : user.email}
              </div>
              <div style={{ fontSize: 12, color: "inherit" }}>{user.perfil}</div>
            </div>

            <Controls>
              <button onClick={toggleTheme}>{themeName === "dark" ? "Light" : "Dark"}</button>
              <button onClick={logout} className="primary">Sair</button>
            </Controls>
          </div>
        </Header>

        {user.perfil === "admin" && (
          <div>
            <label>Selecionar cliente</label>
            <Select value={cliente || ""} onChange={(e) => setCliente(e.target.value)}>
              <option value="">-- visão geral (últimas leituras por cliente) --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.hubspot}>
                  {`${c.nome} ${c.sobrenome} (${c.hubspot})`}
                </option>
              ))}
            </Select>
          </div>
        )}

        <Section>
          <h2>Leituras recentes</h2>

          {!data && <p>Carregando...</p>}
          {data && data.length === 0 && <p>Nenhuma leitura.</p>}

          {data && data.length > 0 && (
            <CardGrid>
              {data.slice(0, 6).map((row, i) => (
                <ChartCard key={i}>
                  <CardHeader>
                    <h3>{row.local}</h3>
                    <div className="subtitle">{new Date(row.data_hora).toLocaleString()}</div>
                  </CardHeader>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>Temp int: <strong>{row.temp_in}°C</strong></div>
                    <div>Temp ext: <strong>{row.temp_ex}°C</strong></div>
                    <div>Hum int: <strong>{row.hum_in}%</strong></div>
                    <div>Hum ext: <strong>{row.hum_ex}%</strong></div>
                    <div>CO2: <strong>{row.co2} ppm</strong></div>
                    <div>Form: <strong>{row.form}</strong></div>
                    <div>PM2.5: <strong>{row.pm25}</strong></div>
                    <div>PM10: <strong>{row.pm10}</strong></div>
                  </div>
                </ChartCard>
              ))}
            </CardGrid>
          )}
        </Section>

        <Section>
          <h2>Histórico</h2>

          {/* Temperatures & Humidity */}
          {data && (
            <ChartCard>
              <CardHeader>
                <h3>Temperatura e Umidade</h3>
                <div className="subtitle">Últimas leituras</div>
              </CardHeader>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data.slice().reverse()}>
                    <XAxis dataKey="data_hora" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="temp_in" name="Temp Interna" stroke={ (themeName==='dark')? dark.chart.tempIn : light.chart.tempIn } dot={false} />
                    <Line type="monotone" dataKey="temp_ex" name="Temp Externa" stroke={ (themeName==='dark')? dark.chart.tempEx : light.chart.tempEx } dot={false} />
                    <Line type="monotone" dataKey="hum_in" name="Umidade Interna" stroke={ (themeName==='dark')? dark.chart.humIn : light.chart.humIn } dot={false} />
                    <Line type="monotone" dataKey="hum_ex" name="Umidade Externa" stroke={ (themeName==='dark')? dark.chart.humEx : light.chart.humEx } dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {/* CO2 & Formaldeído */}
          {data && (
            <ChartCard>
              <CardHeader>
                <h3>Qualidade do Ar — CO₂ e Formaldeído</h3>
                <div className="subtitle">Acompanhe os níveis</div>
              </CardHeader>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={data.slice().reverse()}>
                    <XAxis dataKey="data_hora" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="co2" name="CO₂ (ppm)" stroke={ (themeName==='dark')? dark.chart.co2 : light.chart.co2 } dot={false} />
                    <Line type="monotone" dataKey="form" name="Formaldeído (ppm)" stroke={ (themeName==='dark')? dark.chart.form : light.chart.form } dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {/* PM2.5 / PM10 */}
          {data && (
            <ChartCard>
              <CardHeader>
                <h3>Partículas — PM2.5 e PM10</h3>
                <div className="subtitle">Níveis de material particulado</div>
              </CardHeader>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={data.slice().reverse()}>
                    <XAxis dataKey="data_hora" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pm25" name="PM2.5" fill={ (themeName==='dark')? dark.chart.pm25 : light.chart.pm25 } />
                    <Bar dataKey="pm10" name="PM10" fill={ (themeName==='dark')? dark.chart.pm10 : light.chart.pm10 } />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}
        </Section>
      </Page>
    </ThemeProvider>
  );
}

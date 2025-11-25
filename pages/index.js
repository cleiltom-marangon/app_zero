import { useContext, useState, useEffect } from "react";
import axios from "axios";
import useSWR from "swr";
import styled from "styled-components";
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

const fetcher = (url) => axios.get(url).then((r) => r.data);

// ------------------ styled-components ------------------

const Page = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Inter", sans-serif;
  color: #062c15;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    color: #00ab30;
  }
`;

const LoginBox = styled.main`
  max-width: 420px;
  margin: 100px auto;
  padding: 30px;
  border-radius: 14px;
  background: #f8f8f8;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);

  h1 {
    text-align: center;
    color: #00ab30;
  }

  input {
    width: 100%;
    padding: 12px;
    margin-top: 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
  }

  button {
    width: 100%;
    padding: 12px;
    margin-top: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: #00ab30;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    transition: 0.2s;
  }

  button:hover {
    background: #009327;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-top: 14px;
`;

const Card = styled.div`
  border: 1px solid #dcdcdc;
  padding: 14px;
  border-radius: 10px;
  background: white;
  font-size: 14px;
`;

const Section = styled.section`
  margin-top: 30px;

  h2 {
    color: #062c15;
    border-left: 5px solid #00ab30;
    padding-left: 10px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

// ---------------------------------------------------------
export default function Home() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [cliente, setCliente] = useState(null);
  const [clients, setClients] = useState([]);

  const endpoint = () =>
    user && cliente
      ? `/api/air/${cliente}`
      : user && user.hubspot
      ? `/api/air/${user.hubspot}`
      : null;

  const { data, error } = useSWR(endpoint, fetcher, {
    refreshInterval: 10000,
  });

  useEffect(() => {
    if (user && user.perfil === "admin") {
      axios
        .get("/api/clients")
        .then((r) => setClients(r.data))
        .catch(() => {});
    } else if (user) {
      setCliente(user.hubspot);
    }
  }, [user]);

  async function login() {
    try {
      const r = await axios.post("/api/login", form);
      setUser(r.data);
    } catch (e) {
      alert("Login inválido");
    }
  }

  // ---------------- LOGIN -----------------
  if (!user) {
    return (
      <LoginBox>
        <h1>ZeroGas — Login</h1>
        <input
          placeholder="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button onClick={login}>Entrar</button>
      </LoginBox>
    );
  }

  // ---------------- DASHBOARD -----------------
  return (
    <Page>
      <Header>
        <h1>ZeroGas Dashboard</h1>
        <div>
          {user.email} — {user.perfil}
        </div>
      </Header>

      {user.perfil === "admin" && (
        <div>
          <label>Selecionar cliente</label>
          <Select
            value={cliente || ""}
            onChange={(e) => setCliente(e.target.value)}
          >
            <option value="">
              -- visão geral (últimas leituras por cliente) --
            </option>
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
              <Card key={i}>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {row.local} — {new Date(row.data_hora).toLocaleString()}
                </div>
                <div style={{ marginTop: 8 }}>Temp int: {row.temp_in} °C</div>
                <div>Temp ext: {row.temp_ex} °C</div>
                <div>Hum int: {row.hum_in} %</div>
                <div>Hum ext: {row.hum_ex} %</div>
                <div>CO2: {row.co2} ppm</div>
                <div>Form: {row.form}</div>
                <div>PM2.5: {row.pm25} µg/m³</div>
                <div>PM10: {row.pm10} µg/m³</div>
              </Card>
            ))}
          </CardGrid>
        )}
      </Section>

      <Section>
        <h2>Histórico</h2>

        {data && (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={data.slice().reverse()}>
                <XAxis
                  dataKey="data_hora"
                  tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(t) => new Date(t).toLocaleString()}
                />
                <Line type="monotone" dataKey="temp_in" name="Temp Interna" />
                <Line type="monotone" dataKey="temp_ex" name="Temp Externa" />
                <Line type="monotone" dataKey="hum_in" name="Umidade Interna" />
                <Line type="monotone" dataKey="hum_ex" name="Umidade Externa" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {data && (
          <div style={{ width: "100%", height: 240, marginTop: 20 }}>
            <ResponsiveContainer>
              <LineChart data={data.slice().reverse()}>
                <XAxis
                  dataKey="data_hora"
                  tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="co2" name="CO2" />
                <Line type="monotone" dataKey="form" name="Formaldeído" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {data && (
          <div style={{ width: "100%", height: 240, marginTop: 20 }}>
            <ResponsiveContainer>
              <BarChart data={data.slice().reverse()}>
                <XAxis
                  dataKey="data_hora"
                  tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pm25" name="PM2.5" />
                <Bar dataKey="pm10" name="PM10" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Section>
    </Page>
  );
}
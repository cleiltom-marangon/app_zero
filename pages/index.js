import { useContext,useState,useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { AuthContext } from './_app';
import { LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,BarChart,Bar,Legend } from 'recharts';

const fetcher=url=>axios.get(url).then(r=>r.data);

export default function Home(){
  const {user,setUser}=useContext(AuthContext);
  const [form,setForm]=useState({email:'',password:''});
  const [cliente,setCliente]=useState(null);
  const [clients,setClients]=useState([]);

  const endpoint = () => (user && cliente) ? `/api/air/${cliente}` : (user && user.hubspot ? `/api/air/${user.hubspot}` : null);
  const {data, error} = useSWR(endpoint, fetcher, {refreshInterval:10000});

  useEffect(()=>{
    if(user && user.perfil==='admin'){
      axios.get('/api/clients').then(r=>setClients(r.data)).catch(()=>{});
    }else if(user){
      setCliente(user.hubspot);
    }
  },[user]);

  async function login(){
    try{
      const r=await axios.post('/api/login',form);
      setUser(r.data);
    }catch(e){ alert('Login inválido'); }
  }

  if(!user){
    return <main style={{maxWidth:600,margin:'0 auto',padding:20}}>
      <h1>Zerogas — Login</h1>
      <input style={{width:'100%',padding:10,marginTop:10}} placeholder='email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
      <input style={{width:'100%',padding:10,marginTop:10}} type='password' placeholder='senha' value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      <button style={{width:'100%',padding:10,marginTop:10}} onClick={login}>Entrar</button>
    </main>
  }

  return <main style={{maxWidth:1000,margin:'0 auto',padding:20}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <h1>Zerogas Dashboard</h1>
      <div>{user.email} — {user.perfil}</div>
    </header>

    {user.perfil==='admin' && <div style={{marginTop:20}}>
      <label>Selecionar cliente</label>
      <select style={{width:'100%',padding:8,marginTop:8}} value={cliente||''} onChange={e=>setCliente(e.target.value)}>
        <option value=''>-- visão geral (últimas leituras por cliente) --</option>
        {clients.map(c=> <option key={c.id} value={c.hubspot}>{c.nome || c.email} ({c.hubspot})</option>)}
      </select>
    </div>}

    <section style={{marginTop:20}}>
      <h2>Leituras recentes</h2>
      {!data && <p>Carregando...</p>}
      {data && data.length===0 && <p>Nenhuma leitura.</p>}
      {data && data.length>0 && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
        {data.slice(0,6).map((row,i)=>(
          <div key={i} style={{border:'1px solid #ddd',padding:12,borderRadius:6}}>
            <div style={{fontSize:12,color:'#666'}}>{row.local} — {new Date(row.data_hora).toLocaleString()}</div>
            <div style={{marginTop:8}}>Temp int: {row.temp_in} °C</div>
            <div>Temp ext: {row.temp_ex} °C</div>
            <div>Hum int: {row.hum_in} %</div>
            <div>Hum ext: {row.hum_ex} %</div>
            <div>CO2: {row.co2} ppm</div>
            <div>Form: {row.form}</div>
            <div>PM2.5: {row.pm25} µg/m³</div>
            <div>PM10: {row.pm10} µg/m³</div>
          </div>
        ))}
      </div>}
    </section>

    <section style={{marginTop:30}}>
      <h2>Histórico (gráficos)</h2>
      {data && <div style={{width:'100%',height:320}}>
        <ResponsiveContainer>
          <LineChart data={data.slice().reverse()}>
            <XAxis dataKey="data_hora" tickFormatter={(t)=>new Date(t).toLocaleTimeString()}/>
            <YAxis/>
            <Tooltip labelFormatter={(t)=>new Date(t).toLocaleString()}/>
            <Line type="monotone" dataKey="temp_in" name="Temp Interna" dot={false}/>
            <Line type="monotone" dataKey="temp_ex" name="Temp Externa" dot={false}/>
            <Line type="monotone" dataKey="hum_in" name="Umidade Interna" dot={false}/>
            <Line type="monotone" dataKey="hum_ex" name="Umidade Externa" dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>}
      {data && <div style={{width:'100%',height:240, marginTop:20}}>
        <ResponsiveContainer>
          <LineChart data={data.slice().reverse()}>
            <XAxis dataKey="data_hora" tickFormatter={(t)=>new Date(t).toLocaleTimeString()}/>
            <YAxis/>
            <Tooltip />
            <Line type="monotone" dataKey="co2" name="CO2" dot={false}/>
            <Line type="monotone" dataKey="form" name="Formaldeído" dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>}
      {data && <div style={{width:'100%',height:240, marginTop:20}}>
        <ResponsiveContainer>
          <BarChart data={data.slice().reverse()}>
            <XAxis dataKey="data_hora" tickFormatter={(t)=>new Date(t).toLocaleTimeString()}/>
            <YAxis/>
            <Tooltip/>
            <Legend />
            <Bar dataKey="pm25" name="PM2.5"/>
            <Bar dataKey="pm10" name="PM10"/>
          </BarChart>
        </ResponsiveContainer>
      </div>}
    </section>

  </main>
}

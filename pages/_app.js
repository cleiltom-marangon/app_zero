import '../styles/globals.css';
import { createContext, useState } from 'react';
export const AuthContext=createContext(null);

export default function App({Component,pageProps}){
  const [user,setUser]=useState(null);
  return <AuthContext.Provider value={{user,setUser}}>
    <Component {...pageProps}/>
  </AuthContext.Provider>
}

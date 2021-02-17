import "../styles/tailwind.css";
import { AppProps } from "next/app";
import Axios from "axios";

import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import {AuthProvider} from '../context/auth'
import "../styles/tailwind.css";
import "../styles/icons/style.css";
import { SWRConfig } from 'swr'
import axios from "axios";

Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + '/api';
Axios.defaults.withCredentials = true;

const fetcher = async (url: string):Promise<Object> => {
  try {
    const res = await axios.get(url)
    return res.data
  } catch (err) {
    throw err.response.data   
  }
}

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);
  return (
    <SWRConfig value={{
      fetcher,
      dedupingInterval: 10000
    }}>
    <AuthProvider>
    
      {!authRoute && <Navbar />}
      <div className={authRoute ? '' : 'pt-12'}>
      <Component {...pageProps} />
      </div>
    
    </AuthProvider>
    </SWRConfig>
  );
}

export default App;

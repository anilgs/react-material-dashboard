/* eslint-disable linebreak-style */
import {useState, useMemo, useEffect, useCallback} from 'react';
import axios from 'axios';

export const ax = axios.create(); // export this and use it in all your components

export function useAxiosLoader(){
  const [counter, setCounter] = useState(0);
  const inc = useCallback(() => setCounter(counter => counter + 1), [setCounter]); // add to counter
  const dec = useCallback(() => setCounter(counter => counter - 1), [setCounter]); // remove from counter
  
  const interceptors = useMemo(() => ({
    request: config => (inc(), config),
    response: response => (dec(), response),
    error: error => (dec(), Promise.reject(error)),
  }), [inc, dec]); // create the interceptors
  
  useEffect(() => {
    // add request interceptors
    const reqInterceptor = ax.interceptors.request.use(interceptors.request, interceptors.error);
    // add response interceptors
    const resInterceptor =  ax.interceptors.response.use(interceptors.response, interceptors.error);
    return () => {
      // remove all intercepts when done
      ax.interceptors.request.eject(reqInterceptor);
      ax.interceptors.response.eject(resInterceptor);
    };
  }, [interceptors]);
  
  return [counter > 0];
}
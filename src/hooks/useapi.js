/* eslint-disable linebreak-style */
import { useState, useEffect } from 'react';
import { ax } from './useAxiosLoader';
import { useErrorStatus } from '../views/ErrorHandler';

/**
 * Usage: const [result, listLoading, listLoaded, error, refresh, setResult] = useApi('get', 'http://example.com/users', {}, false);
 * Note: refresh() is used to invoke the API on demand (using refreshIndex as the key for detecting change)
 * @param {*} method 
 * @param {*} url 
 * @param {*} data 
 * @param {*} skip 
 */
export function useApi(method, url, data, skip) {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState();
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [skipState, setSkipState] = useState(skip);
  const [urlState, setURLState] = useState(url);
  const [dataState, setDataState] = useState(data);
  const { setErrorStatus } = useErrorStatus();

  const refresh = (modurl=undefined, moddata=undefined, modskip=false) => {
    if(modurl !== undefined)
      setURLState(modurl);
    if(moddata !== undefined)
      setDataState(moddata);
    if(modskip !== undefined)
      setSkipState(modskip);
    setRefreshIndex(refreshIndex + 1);
  };

  useEffect(() => {
    let cancelled = false;
    if (skipState) {
      setResult(null);
      setLoading(false);
      setLoaded(false);
    } else {
      setLoading(true);
      ax({
        method: method,
        url: urlState,
        data: dataState
      }).then(r => {
        if (!cancelled) {
          setResult(r.data);
          setLoading(false);
          setLoaded(true);
        }
      })
        .catch(error => {
          setLoading(false);
          if (error.response) {
            setError(error.response.data);
            setErrorStatus({status: true, message:error.response.data.message, code:0, initial: false});

          } else {
            setError(error.message);
            setErrorStatus({status: true, message:error.message, code:0, initial: false});
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [url, refreshIndex]);

  return [result, loading, loaded, error, refresh, setResult];
}
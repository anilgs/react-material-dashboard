/* eslint-disable linebreak-style */
import { useState } from 'react';


export function useError(err=false) {
  const [error, setError] = useState(err);
  const [initial, setInitial] = useState(true);
  return [error, setError, initial, setInitial];
}
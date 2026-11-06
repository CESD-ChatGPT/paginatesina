import { useEffect, useState } from 'react'

/* Hook mínimo para consumir el servicio de datos con los tres estados
   que la UI necesita representar: loading / error / data.
   Se mantiene deliberadamente simple — no hace caché ni reintentos;
   si el proyecto suma un backend real, esto se reemplaza por
   react-query o similar sin tocar los componentes que lo usan. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading', data: null, error: null })

    fn()
      .then((data) => {
        if (alive) setState({ status: 'success', data, error: null })
      })
      .catch((error) => {
        if (alive) setState({ status: 'error', data: null, error })
      })

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

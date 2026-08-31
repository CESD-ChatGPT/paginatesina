import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { consumeAuthCallback, hasAuthCallback } from './lib/supabase'

/* El enlace de confirmación del correo vuelve con los tokens en el
   fragmento de la URL, que en esta app también usa HashRouter para
   rutear. Si React monta primero, el router reescribe el `#` y los
   tokens se pierden: la cuenta queda confirmada en Supabase pero el
   usuario aterriza sin sesión. Ver la nota larga en lib/supabase.js.

   Cuando NO hay callback en la URL —o sea, casi siempre— esto resuelve
   de inmediato y sin cargar el SDK, así que no le cuesta nada a quien
   entra a la landing. */
function arrancar() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

if (hasAuthCallback()) {
  consumeAuthCallback().then((haySesion) => {
    // Recién confirmado: entra derecho al panel en vez de caer en la
    // landing sin señal de que el registro funcionó.
    if (haySesion) window.location.hash = '#/panel'
    arrancar()
  })
} else {
  arrancar()
}

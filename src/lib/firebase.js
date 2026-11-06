/* ═══════════════════════════════════════════════════════════════
   CLIENTE FIREBASE

   Único módulo que sabe que Firebase existe. El resto de la app
   habla con `AuthContext` e `inventoryService`.

   POR QUÉ FIREBASE Y NO SUPABASE
   El plan gratuito de Supabase pausa el proyecto a los 7 días sin
   uso y hay que despausarlo a mano desde el panel. Firebase no
   pausa: el proyecto queda disponible aunque pasen meses. Es la
   única razón del cambio — lo demás funcionaba bien.

   SOBRE LA CONFIGURACIÓN PÚBLICA
   apiKey y projectId viajan dentro del bundle y son visibles para
   cualquiera. Es lo esperado: no son secretos, son identificadores
   del proyecto. Lo que protege los datos son las reglas de
   firestore.rules, que se evalúan en el servidor. Un apiKey de
   Firebase sin reglas es una base abierta; con reglas, es un
   identificador y nada más.
   ═══════════════════════════════════════════════════════════════ */

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/* Los tests corren contra el emulador local, que no necesita un
   proyecto real: alcanza con un projectId que empiece con `demo-`. */
const EMULADOR = import.meta.env.VITE_FIREBASE_EMULATOR
const EMULADOR_PROJECT_ID = 'demo-solvus'

export const isFirebaseConfigured = Boolean(
  (config.apiKey && config.projectId) || EMULADOR
)

let appPromise = null

/* Carga diferida: el SDK de Firebase pesa más que el panel entero y
   la landing es pública. Va en su propio chunk detrás de un
   import() y solo baja cuando alguien lo necesita de verdad. */
export function getFirebase() {
  if (!isFirebaseConfigured) return Promise.resolve(null)
  if (appPromise) return appPromise

  appPromise = (async () => {
    const [{ initializeApp }, auth, firestore] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ])

    const app = initializeApp(
      EMULADOR
        ? { apiKey: 'demo', projectId: EMULADOR_PROJECT_ID, authDomain: 'localhost' }
        : config
    )

    const authInstance = auth.getAuth(app)
    const db = firestore.getFirestore(app)

    if (EMULADOR) {
      const [hostAuth, hostDb] = EMULADOR.split('|')
      auth.connectAuthEmulator(authInstance, `http://${hostAuth}`, { disableWarnings: true })
      const [h, p] = hostDb.split(':')
      firestore.connectFirestoreEmulator(db, h, Number(p))
    }

    return { app, auth: authInstance, db, sdkAuth: auth, sdkDb: firestore }
  })()

  return appPromise
}

/* ¿Hay sesión guardada? Firebase la persiste en IndexedDB, que es
   asincrónica y no se puede mirar de reojo como el localStorage de
   Supabase. Pero deja una marca sincrónica en localStorage con el
   appId, y eso alcanza para decidir si vale la pena bajar el SDK.

   Ante la duda devuelve true: equivocarse hacia "cargar de más"
   cuesta unos KB; equivocarse hacia "no cargar" dejaría a alguien
   con sesión abierta viéndose como desconectado. */
export function hasStoredSession() {
  if (typeof window === 'undefined') return false
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('firebase:authUser:')) return true
    }
    return false
  } catch {
    return true
  }
}

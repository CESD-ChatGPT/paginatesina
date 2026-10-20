/* ═══════════════════════════════════════════════════════════════
   PROVIDER DE AUTENTICACIÓN — FIREBASE

   Misma interfaz que el provider de Supabase: signIn, signUp,
   resendConfirmation, requestPasswordReset, updatePassword,
   signOut, restore, onChange. AuthContext no distingue cuál usa.

   El rol vive en el documento `usuarios/{uid}` de Firestore y no en
   el perfil de Auth. Es la misma lección de antes: lo que el
   usuario puede escribir sobre sí mismo no sirve para autorizar.
   Las reglas de firestore.rules impiden que cambie su propio rol.
   ═══════════════════════════════════════════════════════════════ */

import { getFirebase } from '../lib/firebase'

const ROL_POR_DEFECTO = 'operador'

/* Los códigos de Firebase son estables y vienen en inglés. Se
   traducen a los mismos códigos que ya entiende la pantalla de
   Login, para no tener que tocarla. */
export function traducirErrorFirebase(error) {
  const code = error?.code || ''
  const err = new Error(error?.message || 'Error de autenticación')

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    err.code = 'invalid_credentials'
  } else if (code === 'auth/email-already-in-use') {
    err.code = 'email_taken'
  } else if (code === 'auth/weak-password') {
    err.code = 'weak_password'
  } else if (code === 'auth/invalid-email') {
    err.code = 'invalid_email'
  } else if (code === 'auth/too-many-requests') {
    err.code = 'rate_limited'
  } else if (code === 'auth/network-request-failed') {
    err.code = 'network'
  } else {
    err.code = 'unknown'
  }
  return err
}

async function perfilDe(fb, user) {
  if (!user) return null
  const base = {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Usuario',
    email: user.email,
    jobTitle: 'Sin puesto asignado',
    /* Mínimo privilegio mientras se resuelve: entre mostrar de más y
       mostrar de menos, de menos. */
    role: ROL_POR_DEFECTO,
    warehouse: 'Depósito central',
    emailVerified: user.emailVerified,
  }

  try {
    const ref = fb.sdkDb.doc(fb.db, 'usuarios', user.uid)
    const snap = await fb.sdkDb.getDoc(ref)
    if (!snap.exists()) {
      /* Primera vez: se crea el perfil con el rol mínimo. Las reglas
         solo aceptan 'operador' en el alta. */
      await fb.sdkDb.setDoc(ref, {
        nombre: base.name,
        puesto: '',
        rol: ROL_POR_DEFECTO,
        creadoEn: new Date().toISOString(),
      })
      return base
    }
    const d = snap.data()
    return {
      ...base,
      name: d.nombre || base.name,
      jobTitle: d.puesto || base.jobTitle,
      role: d.rol || ROL_POR_DEFECTO,
    }
  } catch {
    /* Si Firestore no responde, la sesión sigue siendo válida: se
       entra con el rol mínimo en vez de quedar afuera. */
    return base
  }
}

export const firebaseAuthProvider = {
  async signIn({ email, password }) {
    const fb = await getFirebase()
    try {
      const cred = await fb.sdkAuth.signInWithEmailAndPassword(fb.auth, email.trim(), password)
      return perfilDe(fb, cred.user)
    } catch (e) {
      throw traducirErrorFirebase(e)
    }
  },

  async signUp({ name, email, password }) {
    const fb = await getFirebase()
    try {
      const cred = await fb.sdkAuth.createUserWithEmailAndPassword(fb.auth, email.trim(), password)
      await fb.sdkAuth.updateProfile(cred.user, { displayName: name.trim() })
      await fb.sdkAuth.sendEmailVerification(cred.user)
      const user = await perfilDe(fb, cred.user)
      /* Firebase deja la sesión abierta aunque el correo no esté
         verificado. Se entra igual y se avisa; bloquear acá sería
         encerrar a alguien que acaba de registrarse. */
      return { user: { ...user, name: name.trim() }, needsEmailConfirmation: false }
    } catch (e) {
      throw traducirErrorFirebase(e)
    }
  },

  async resendConfirmation() {
    const fb = await getFirebase()
    const user = fb.auth.currentUser
    if (!user) throw new Error('Iniciá sesión para reenviar la verificación.')
    try {
      await fb.sdkAuth.sendEmailVerification(user)
    } catch (e) {
      throw traducirErrorFirebase(e)
    }
  },

  async requestPasswordReset(email) {
    const fb = await getFirebase()
    try {
      await fb.sdkAuth.sendPasswordResetEmail(fb.auth, email.trim())
    } catch (e) {
      /* No se distingue "no existe" de "sí existe": decirlo le
         confirma a cualquiera quién tiene cuenta acá. */
      const err = traducirErrorFirebase(e)
      if (err.code === 'invalid_credentials') return
      throw err
    }
  },

  async updatePassword(password) {
    const fb = await getFirebase()
    const user = fb.auth.currentUser
    if (!user) throw new Error('El enlace de recuperación venció. Pedí uno nuevo.')
    try {
      await fb.sdkAuth.updatePassword(user, password)
    } catch (e) {
      throw traducirErrorFirebase(e)
    }
  },

  async signOut() {
    const fb = await getFirebase()
    await fb.sdkAuth.signOut(fb.auth)
  },

  async restore() {
    const fb = await getFirebase()
    /* authStateReady espera a que Firebase lea IndexedDB; sin esto
       currentUser es null en el primer tick y la app mandaría al
       login a alguien que sí tiene sesión. */
    await fb.auth.authStateReady()
    return perfilDe(fb, fb.auth.currentUser)
  },

  onChange(handler) {
    let desuscribir = null
    let cancelado = false
    getFirebase().then((fb) => {
      if (cancelado || !fb) return
      desuscribir = fb.sdkAuth.onAuthStateChanged(fb.auth, (user) => {
        if (!user) return handler(null)
        perfilDe(fb, user).then(handler)
      })
    })
    return () => {
      cancelado = true
      desuscribir?.()
    }
  },
}

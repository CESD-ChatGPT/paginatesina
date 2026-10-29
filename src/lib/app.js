/* ═══════════════════════════════════════════════════════════════
   LA APP DE PRUEBA

   SOLVUS en este repositorio es la landing y el panel. El software
   que la gente prueba es el ChatBot Stock, que corre en Vento y
   trabaja contra el inventario real de la red `cesd`.

   Un solo lugar con la dirección: la landing la usa en el hero, en
   la banda de cierre y en la barra. Si la app se muda, se cambia acá
   y nada más.
   ═══════════════════════════════════════════════════════════════ */

export const APP_URL = 'https://cloud.vento.build/networks/cesd/chatbot-stock.html'

/* Demo pública del ChatBot: servicio separado, sin login y con datos ficticios.
   Se publica con `npm run build:demo`. */
export const DEMO_URL = 'https://solvus-demo.pages.dev/'

export const APP_NOMBRE = 'ChatBot Stock'

/* Contacto para pedir una demo. */
export const WHATSAPP_DEMO = 'https://wa.me/5493518046548?text=Hola%2C%20quiero%20pedir%20una%20demo%20de%20Stockus'

/* La app pide usuario y PIN propios, que no son la cuenta de SOLVUS:
   son dos sistemas distintos y conviene no prometer lo contrario. */
export const APP_REQUIERE_CUENTA_PROPIA = true

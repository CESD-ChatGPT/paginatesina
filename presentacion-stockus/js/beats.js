/* LÍNEAS DE TIEMPO DE LAS ANIMACIONES GUIADAS (diapositivas 2 y 3)
   Único archivo para retocar los tiempos. Cada beat: t = segundo de inicio (a velocidad 100 %),
   escena = qué se muestra (lo usa js/escenas.js), en / es = subtítulo bilingüe de ese momento.
   Un beat sin en/es deja el subtítulo anterior en pantalla.
   duracion = cuándo termina la animación; el último estado queda quieto hasta que se avance.
   Velocidad en vivo: teclas [ y ] (pasos de 5 %), 0 vuelve a 100 %. R reinicia la animación actual.
   Máximo 8 palabras por línea de subtítulo. */
window.BEATS = {
  thomas: {
    duracion: 70,
    beats: [
      { t: 0,    escena: 'deposito',   en: 'An internship at HDS Technology',  es: 'Una pasantía en HDS Technology' },
      { t: 9,    escena: 'sin-sistema', en: 'A big problem: no stock system',  es: 'El problema: no había sistema de stock' },
      { t: 19,   escena: 'de-palabra', en: 'Stock controlled verbally',        es: 'El stock se controlaba de palabra' },
      { t: 24,   escena: 'desalineado', en: 'Poorly organized',                es: 'Poco organizado' },
      { t: 28,   escena: 'tiempo',     en: 'Lost time. Common mistakes.',      es: 'Pérdida de tiempo y errores frecuentes' },
      { t: 38,   escena: 'stockus',    en: 'Stockus: a stock control system',  es: 'Stockus: un sistema de control de stock' },
      { t: 48,   escena: 'paso-1',     en: 'Log in',                           es: 'Iniciás sesión' },
      { t: 52.5, escena: 'paso-2',     en: 'Add or update products',           es: 'Agregás o actualizás productos' },
      { t: 57,   escena: 'paso-3',     en: 'Record every movement',            es: 'Registrás cada movimiento' },
      { t: 61.5, escena: 'paso-4',     en: 'Track your inventory live',        es: 'Seguís tu inventario en tiempo real' },
      { t: 66,   escena: 'fin' }
    ]
  },
  pedro: {
    duracion: 66,
    bucle: true,           // la maqueta sigue en bucle al terminar (único bucle permitido)
    beats: [
      { t: 0,  escena: 'titulo',      en: 'What makes Stockus different',     es: 'Lo que diferencia a Stockus' },
      { t: 6,  escena: 'chat',        en: 'You ask where a product is',       es: 'Preguntás dónde está un producto' },
      { t: 14, escena: 'led',         en: 'LEDs show the exact location',     es: 'Los LEDs muestran el lugar exacto' },
      { t: 20, escena: 'sin-buscar',  en: 'No more shelf-by-shelf searching', es: 'Sin buscar estante por estante' },
      { t: 26, escena: 'red-local',   en: 'Local network: no internet needed', es: 'Red local: no necesita internet' },
      { t: 33, escena: 'senal-debil', en: 'Great for weak connections',       es: 'Ideal para señal débil' },
      { t: 40, escena: 'raspberry',   en: 'Raspberry Pi: the main computer',  es: 'Raspberry Pi: la computadora principal' },
      { t: 47, escena: 'esp',         en: 'ESP8266: controls the LED strip',  es: 'ESP8266: controla la tira de LED' },
      { t: 54, escena: 'maqueta',     en: 'Our live model',                   es: 'Nuestra maqueta funcionando en vivo' },
      { t: 62, escena: 'fin' }
    ]
  }
};

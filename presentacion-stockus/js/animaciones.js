/* ANIMACIONES DE ENTRADA (diapositivas 2 a 11 y 21 a 24): un único objeto para retocarlas.
   Cada animación arranca al llegar a su diapositiva y termina en un estado quieto que queda hasta avanzar.
   dur  = cuándo queda estable (segundos desde que se llega).
   m    = momentos de la animación, en segundos desde que se llega (los usa js/escenas.js).
   subs = subtítulos fijos de la diapositiva; si hay dos, el segundo reemplaza al primero con un fundido en su t.
   R repite la animación de la diapositiva actual. Al retroceder se muestra terminada. */
window.ANIMACIONES = {
  /* ---------- Thomas ---------- */
  'th-deposito': { dur: 20,
    m: { dibujo: 0, dibujoDur: 8, rotulo: 8, preguntas: 14, preguntasDur: 3, nostock: 17, nostockDur: 3 },
    subs: [{ t: 0, en: 'An internship at HDS Technology', es: 'Una pasantía en HDS Technology' },
           { t: 14, en: 'A big problem: no stock system', es: 'El problema: no había sistema de stock' }] },
  'th-palabra': { dur: 4, bucle: true,      // el diálogo de los globos se repite mientras la diapositiva está en pantalla
    m: { voces: 0, vocesDur: 3, desalineado: 2, desalineadoDur: 2 },
    subs: [{ t: 0, en: 'The stock was controlled verbally, with no system to track it.', es: 'El stock se controlaba de forma verbal, sin ningún sistema para registrarlo.' }] },
  'th-tiempo': { dur: 7,
    m: { zigzag: 0, zigzagDur: 5, reloj: 0, relojDur: 5, cruces: 5, crucesDur: 2 },   // el reloj gira mientras la persona camina
    subs: [{ t: 0, en: 'Lost time. Common mistakes.', es: 'Pérdida de tiempo y errores frecuentes' }] },
  'th-stockus': { dur: 8,
    m: { apaga: 0, apagaDur: 2, revela: 2, revelaDur: 3, tira: 5, tiraDur: 3 },
    subs: [{ t: 0, en: 'Stockus: a stock control system', es: 'Stockus: un sistema de control de stock' }] },
  'th-pasos': { dur: 19,
    m: { sube: 0, subeDur: 1.5, pasos: [2, 7, 12, 17] },
    subs: [{ t: 2, en: 'Log in', es: 'Iniciás sesión' },
           { t: 7, en: 'Add or update products', es: 'Agregás o actualizás productos' },
           { t: 12, en: 'Record every movement', es: 'Registrás cada movimiento' },
           { t: 17, en: 'Track your inventory live', es: 'Seguís tu inventario en tiempo real' }] },
  /* ---------- Pedro ---------- */
  'pe-diferencia': { dur: 9,
    m: { titulo: 0, tituloDur: 2, escribe: 3, escribeDur: 3 },     // escritura un 40 % más rápida: termina a los 6 s (la entrada dura 9)
    subs: [{ t: 0, en: 'You ask where a product is', es: 'Preguntás dónde está un producto' }] },
  'pe-leds': { dur: 10,
    m: { led: 0, ledDur: 4, recorrido: 6, recorridoDur: 3, tacha: 9, tachaDur: 1 },
    subs: [{ t: 0, en: 'LEDs show the exact location', es: 'Los LEDs muestran el lugar exacto' },
           { t: 6, en: 'No shelf-by-shelf searching', es: 'Sin buscar estante por estante' }] },
  'pe-red': { dur: 9,      // red local 0–4 s, wifi tachado 5–9 s (sin el tramo de la señal débil)
    m: { anillo: 0, anilloDur: 4, wifi: 5, wifiDur: 4 },
    subs: [{ t: 0, en: 'Local network: no internet needed', es: 'Red local: no necesita internet' }] },
  'pe-hardware': { dur: 9,
    m: { raspberry: 0, esp: 3, tira: 6, piezaDur: 3 },
    subs: [{ t: 0, en: 'Raspberry Pi + ESP8266 + LED strip', es: 'Raspberry Pi, ESP8266 y tira de LED' }] },
  'pe-maqueta': { dur: 14, bucle: true,      // el recorrido de luz de la maqueta es el único bucle de la presentación
    m: { maqueta: 0, maquetaDur: 4, leds: [8, 11, 14] }, },
  /* ---------- Conclusiones (21 a 24): un mensaje por diapositiva ----------
     partes = [inicio, duración] de cada texto que se escribe letra por letra; escribiendo = fin de los tres puntos */
  'conv-pregunta':  { dur: 4.2, m: { partes: [[.2, 3.8]] } },
  'conv-respuesta': { dur: 14,  m: { escribiendo: 1, partes: [[1, 1.4], [6, .9], [11, 1.8]] } },
  'conv-ahora':     { dur: 2.2, m: { partes: [[.2, 1.8]] } },
  'conv-final':     { dur: 9,   m: { escribiendo: 1, partes: [[1, 2], [5, 1.6]], vento: 8 } }
};

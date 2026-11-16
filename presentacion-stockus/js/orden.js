/* ORDEN DE LAS DIAPOSITIVAS: único lugar donde se decide qué diapositivas hay y en qué orden.
   Para sacar una, borrá su línea. La numeración, la barra de LEDs del pie, el hash de la URL (#N),
   los cortes alrededor de los videos, el cronómetro y las notas del presentador se recalculan solos.
   Cada nombre es el id de una <section> de index.html y la clave de sus notas en js/notas.js. */
window.ORDEN = [
  'negro',            // sala a oscuras
  'stockus',          // revelación
  'leds',             // LEDs y tecnología
  'equipo',
  'identidad',
  'vento',
  'demo',             // video del chatbot
  'metodologia',
  'deposito',         // video: así cambia un depósito
  'escala',
  'presupuesto',
  'equilibrio',
  'pago',             // caso HDS y plan de pago
  'conclusiones-a',   // versión A: el estante que se abre
  'conclusiones-b',   // versión B: la conversación con Stockus
  'cierre'
];

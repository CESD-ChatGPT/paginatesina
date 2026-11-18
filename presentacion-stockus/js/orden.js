/* ORDEN DE LAS DIAPOSITIVAS: único lugar donde se decide qué diapositivas hay y en qué orden.
   Para sacar una, borrá su línea. La numeración, la barra de LEDs del pie, el hash de la URL (#N),
   los cortes alrededor de los videos, el cronómetro y las notas del presentador se recalculan solos.
   Cada nombre es el id de una <section> de index.html y la clave de sus notas en js/notas.js. */
window.ORDEN = [
  'negro',          //  1 sala a oscuras
  'thomas',         //  2 la historia de Thomas (animación guiada, js/beats.js)
  'pedro',          //  3 la explicación de Pedro (animación guiada, js/beats.js)
  'equipo',         //  4
  'identidad',      //  5
  'vento',          //  6
  'demo',           //  7 video del chatbot
  'metodologia',    //  8
  'deposito',       //  9 video: así cambia un depósito
  'escala',         // 10
  'presupuesto',    // 11 presupuesto, con el punto de equilibrio de fondo
  'pago',           // 12 caso HDS y plan de pago
  'conversacion',   // 13 conclusiones: la conversación con Stockus
  'cierre'          // 14 frase clave, gracias y preguntas
];

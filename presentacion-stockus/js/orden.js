/* ORDEN DE LAS DIAPOSITIVAS: único lugar donde se decide qué diapositivas hay y en qué orden.
   Para sacar una, borrá su línea. La numeración, la barra de LEDs del pie, el hash de la URL (#N),
   los cortes, el cronómetro y las notas del presentador se recalculan solos.
   Cada nombre es el id de una <section> de index.html y la clave de sus notas en js/notas.js. */
window.ORDEN = [
  'negro',          //  1 sala a oscuras
  'th-deposito',    //  2 Thomas · el depósito de HDS y el problema
  'th-palabra',     //  3 Thomas · stock controlado de palabra
  'th-tiempo',      //  4 Thomas · tiempo perdido y errores
  'th-stockus',     //  5 Thomas · aparece STOCKUS
  'th-pasos',       //  6 Thomas · los cuatro pasos
  'pe-diferencia',  //  7 Pedro · lo que diferencia a Stockus
  'pe-leds',        //  8 Pedro · los LEDs marcan el lugar
  'pe-red',         //  9 Pedro · red local, sin internet
  'pe-hardware',    // 10 Pedro · Raspberry Pi y ESP8266
  'pe-maqueta',     // 11 Pedro · la maqueta en vivo
  'equipo',         // 12
  'identidad',      // 13
  'vento',          // 14
  'demo',           // 15 video del chatbot
  'metodologia',    // 16
  'deposito',       // 17 video: así cambia un depósito
  'escala',         // 18
  'presupuesto',    // 19 presupuesto, con el punto de equilibrio de fondo
  'pago',           // 20 caso HDS y plan de pago
  'conv-pregunta',  // 21 conversación · la pregunta (Gonzalo)
  'conv-respuesta', // 22 conversación · responde Stockus (Gonzalo)
  'conv-ahora',     // 23 conversación · ¿Y ahora? (Francisco)
  'conv-final',     // 24 conversación · primeros clientes (Francisco)
  'cierre'          // 25 frase clave, gracias y preguntas
];

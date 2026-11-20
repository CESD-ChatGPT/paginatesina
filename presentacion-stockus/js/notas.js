/* Notas del presentador, por id de diapositiva (ver js/orden.js; el número se calcula solo).
   Fuente: guion.md. t0 / t1 = tiempos del guion en segundos desde el inicio (0:00).
   ind / ind2 = indicaciones (entre corchetes); en: true = texto en inglés. */
window.NOTAS = {
  'negro': { titulo: 'Sala a oscuras', bloques: [
    { t0: 0, t1: 30, quien: 'Thomas', bloque: 'Entrada',
      ind: 'Sala a oscuras. Thomas junto al estante, con el micrófono abierto. El técnico mantiene las luces apagadas hasta que Thomas diga «Hello, everyone».',
      texto: '“Stockus, ¿dónde está el tornillo?”',
      ind2: 'Se enciende un solo LED y Stockus responde por voz. Pausa de 2 segundos. Thomas se acerca y saca la caja con la imagen del tornillo. Al decir «Hello, everyone» → ENCENDER TODAS LAS LUCES y AVANZAR → DIAPO 2.' }
  ] },
  'th-deposito': { titulo: 'Thomas · El depósito de HDS y el problema', bloques: [
    { t0: 30, t1: 53, quien: 'Thomas', bloque: 'Inglés 1 · el depósito y el problema', en: true,
      ind: 'La animación arranca sola (unos 20 s): primero el depósito y HDS, después los «?» y NO STOCK SYSTEM.',
      texto: '“Hello, everyone. I\'m going to talk about our project, Stockus. All this started when we were doing an internship at HDS technology, a company related to logistics and warehouses.”\n\n“During the internship, we found a BIG PROBLEM: they didn\'t have a stock system.”',
      ind2: 'AVANZAR → DIAPO 3 al decir: «The stock was controlled verbally…»' }
  ] },
  'th-palabra': { titulo: 'Thomas · Stock controlado de palabra', bloques: [
    { t0: 53, t1: 58, quien: 'Thomas', bloque: 'Inglés 1 · de palabra', en: true,
      texto: '“The stock was controlled verbally, with no system to track it.”',
      ind2: 'AVANZAR → DIAPO 4 al decir: «Because of this, the employees lost time…»' }
  ] },
  'th-tiempo': { titulo: 'Thomas · Tiempo perdido y errores', bloques: [
    { t0: 58, t1: 66, quien: 'Thomas', bloque: 'Inglés 1 · tiempo y errores', en: true,
      texto: '“Because of this, the employees lost time looking for tools, and mistakes in the warehouse were common.”',
      ind2: 'AVANZAR → DIAPO 5 al decir: «So we decided to create Stockus…»' }
  ] },
  'th-stockus': { titulo: 'Thomas · Aparece STOCKUS', bloques: [
    { t0: 66, t1: 74, quien: 'Thomas', bloque: 'Inglés 1 · la solución', en: true,
      texto: '“So we decided to create Stockus. Our solution is a stock control system for storage facilities.”',
      ind2: 'AVANZAR → DIAPO 6 al decir: «And using Stockus is fast and simple…»' }
  ] },
  'th-pasos': { titulo: 'Thomas · Los cuatro pasos', bloques: [
    { t0: 74, t1: 100, quien: 'Thomas', bloque: 'Inglés 1 · cómo se usa', en: true,
      ind: 'Los cuatro pasos entran solos, uno cada 5 s, con su subtítulo.',
      texto: '“And using Stockus is fast and simple. Once you log in, you have full control over your warehouse: you can add or update products in seconds, record every stock movement, and track your inventory in real time.”\n\n“Now my partner will explain how the system works.”',
      ind2: 'AVANZAR → DIAPO 7 (Pedro) al decir: «Thank you. Now I\'m going to talk about…»' }
  ] },
  'pe-diferencia': { titulo: 'Pedro · Lo que diferencia a Stockus', bloques: [
    { t0: 100, t1: 112, quien: 'Pedro', bloque: 'Inglés 2 · lo que lo hace diferente', en: true,
      texto: '“Thank you. Now I\'m going to talk about the feature that makes Stockus different.”\n\n“The user can ask the system where a product is.”',
      ind2: 'AVANZAR → DIAPO 8 al decir: «Then, the LEDs on the shelves turn on…»' }
  ] },
  'pe-leds': { titulo: 'Pedro · Los LEDs marcan el lugar', bloques: [
    { t0: 112, t1: 123, quien: 'Pedro', bloque: 'Inglés 2 · los LEDs', en: true,
      texto: '“Then, the LEDs on the shelves turn on and show the exact location. This way, workers find products fast, without searching shelf by shelf.”',
      ind2: 'AVANZAR → DIAPO 9 al decir: «Now, about the technology…»' }
  ] },
  'pe-red': { titulo: 'Pedro · Red local, sin internet', bloques: [
    { t0: 123, t1: 137, quien: 'Pedro', bloque: 'Inglés 2 · red local', en: true,
      texto: '“Now, about the technology. The system works on a local network, so it doesn\'t need internet. This is very useful for warehouses with a weak connection.”',
      ind2: 'AVANZAR → DIAPO 10 al decir: «It uses a Raspberry Pi…»' }
  ] },
  'pe-hardware': { titulo: 'Pedro · Raspberry Pi y ESP8266', bloques: [
    { t0: 137, t1: 147, quien: 'Pedro', bloque: 'Inglés 2 · el hardware', en: true,
      texto: '“It uses a Raspberry Pi as the main computer, and a small board called ESP8266 to control the LED strip.”',
      ind2: 'AVANZAR → DIAPO 11 al decir: «We also built a small model…»' }
  ] },
  'pe-maqueta': { titulo: 'Pedro · La maqueta en vivo', bloques: [
    { t0: 147, t1: 166, quien: 'Pedro', bloque: 'Inglés 2 · la maqueta', en: true,
      ind: 'La maqueta queda en bucle; los tres LEDs de abajo se encienden a los 8, 11 y 14 s.',
      texto: '“We also built a small model with shelves and LEDs. It works live with our software, so you can see it in action.”\n\n“In short, Stockus saves time, reduces mistakes, and keeps the stock organized.”\n\n“Thank you.”',
      ind2: 'AVANZAR → DIAPO 12 (Gonzalo).' }
  ] },
  'equipo': { titulo: 'Somos Solvus (equipo)', bloques: [
    { t0: 166, t1: 206, quien: 'Gonzalo', bloque: 'Equipo y producto',
      texto: '“Gracias, Pedro. Como vieron al empezar, le preguntamos por un tornillo y nos mostró dónde estaba: puede buscar cualquier cosa, en segundos.”\n\n“Nosotros somos Solvus, la empresa que lo desarrolló. Yo soy Gonzalo, Scrum Master y coordinador. Francisco es Product Owner y responsable de comunicación; Luana, gestora de documentación; y Pedro, Luciano y Thomas, desarrolladores e investigadores. Luciano les muestra nuestra identidad.”' }
  ] },
  'identidad': { titulo: 'Una marca clara y sobria (identidad)', bloques: [
    { t0: 206, t1: 226, quien: 'Luciano', bloque: 'Identidad de marca',
      texto: '“Gracias, Gonzalo. Esta es la identidad de Solvus, que creé yo: una marca clara y sobria, con una paleta de cuatro colores. Su isotipo es una S formada por dos flechas, que representan la entrada y la salida de mercadería.”' }
  ] },
  'vento': { titulo: 'Todo Stockus, en un solo lugar (Vento)', bloques: [
    { t0: 226, t1: 256, quien: 'Pedro', bloque: 'Con qué lo construimos: Vento',
      texto: '“Gracias, Luciano. Todo Stockus lo construimos con Vento, una plataforma de inteligencia artificial para crear proyectos de hardware, robótica, IoT y automatizaciones usando lenguaje natural. Este es nuestro espacio de trabajo: las bases de datos, la Raspberry Pi, las páginas del sistema y los agentes de IA, todo conectado en un solo lugar.”' }
  ] },
  'demo': { titulo: 'Demo: el chatbot funcionando', bloques: [
    { t0: 256, t1: 332, quien: 'Luciano', bloque: 'Demo: el chatbot funcionando',
      ind: 'El video arranca solo al entrar (sin audio). Luciano lo explica de principio a fin, sin silencios. Los tiempos son aproximados: ajustarlos mirando el video.',
      texto: '“Gracias, Pedro. Esto es el chatbot de Stockus funcionando. Primero creamos una cuenta, con nombre, usuario y un PIN, para que cada persona entre con el suyo.”\n\n“Ya adentro, le hablamos en lenguaje natural: escribimos «sumar 5 unidades del SKU 1» y el chatbot nos pide confirmación antes de cambiar nada. Lo mismo hacemos para agregar y para restar stock.”\n\n“Cada cambio se actualiza al instante, y a la derecha aparecen las alertas de los productos que están por debajo del mínimo.”\n\n“Desde acá abrimos el dashboard: cuántos productos hay, cuántas unidades, las alertas y el stock por ubicación. También vemos todos los movimientos, con fecha y hora, y cerramos la sesión.”\n\n“Y si falta un producto, lo agregamos con su categoría, su código, su ubicación y su stock mínimo.”',
      ind2: 'Termina el video (se corta antes de la placa «Pedí tu demo»). Se hace en vivo, con el estante.' },
    { t0: 332, t1: 346, quien: 'Luciano', bloque: 'En vivo con el estante',
      texto: '“Y lo mejor es que esto se conecta con los LEDs inteligentes. Lo hacemos en vivo: Stockus, ¿dónde está el tornillo?”\n\n(Se enciende el LED y Stockus responde por voz.)\n\n“El cajón se ilumina y no hace falta buscar estante por estante. Usamos un tornillo, pero puede ser cualquier cosa.”',
      ind2: 'Ensayar el en vivo con ruido de fondo.' }
  ] },
  'metodologia': { titulo: 'Paso a paso, con Scrum (metodología)', bloques: [
    { t0: 346, t1: 361, quien: 'Thomas', bloque: 'Metodología',
      texto: '“Gracias, Luciano. Ahora les contamos cómo lo construimos. Todo empezó en la pasantía en HDS, donde descubrimos el problema. Trabajamos con Scrum: dividimos el proyecto en sprints, ciclos cortos con un objetivo claro, y anotamos las tareas en Trello.”' },
    { t0: 361, t1: 386, quien: 'Luana', bloque: 'Metas de los sprints (Sprint Goal)',
      texto: '“Gracias, Thomas. Trabajar así nos permitió avanzar paso a paso y siempre con rumbo claro. Y cada sprint tuvo su meta, su Sprint Goal: el del primero, investigar y definir los límites del proyecto; el del segundo, desarrollar el software; y el del tercero, integrar el software con el hardware. Eso es lo que acaban de ver.”' }
  ] },
  'deposito': { titulo: 'Video: así cambia un depósito', bloques: [
    { t0: 386, t1: 410, quien: 'Francisco', bloque: 'Video: así cambia un depósito',
      ind: 'El video arranca solo, sin audio, y dura 22 s. Tiempos aproximados: 0–1,5 s el problema; 1,5–5,5 s las consecuencias; 5,5–7 s entra Stockus; 7–13 s ingresos y egresos; 13–17 s búsqueda con LED; 17–22 s el resultado.',
      texto: '“Gracias, Luana. Así cambia un depósito: hoy el stock se lleva de memoria, se pierde tiempo y se cometen errores. Entra Stockus: registramos ingresos y egresos desde la web o el chat, preguntamos dónde está un producto y el LED nos lo muestra. El resultado: stock claro.”',
      ind2: 'No decir «animación» ni «página web»: describir lo que se ve. El video usa la leche como producto de ejemplo: no nombrar a ninguna empresa.' }
  ] },
  'escala': { titulo: 'A medida (Stockus escala)', bloques: [
    { t0: 410, t1: 430, quien: 'Luana', bloque: 'Lo económico: a medida, no hay un precio único',
      texto: '“Gracias, Francisco. Ahora, lo económico. Stockus crece con cada empresa, desde una sola zona hasta todo el depósito: por eso no hay un precio único. Cada propuesta es a medida, y eso es justamente su ventaja. Siempre empezamos con un relevamiento.”' }
  ] },
  'presupuesto': { titulo: 'Qué entra en el presupuesto', bloques: [
    { t0: 430, t1: 454, quien: 'Francisco', bloque: 'Costo fijo y parte variable',
      texto: '“Gracias, Luana. El presupuesto tiene un costo fijo, igual para todos: el software y el hardware base. Y una parte variable que depende de cada empresa: los metros de LEDs inteligentes, el tamaño del depósito y lo que quiere automatizar. Atrás pueden ver nuestro punto de equilibrio: entre 2 y 3 sistemas por mes con jornada completa.”' }
  ] },
  'pago': { titulo: 'Un caso real y cómo se paga', bloques: [
    { t0: 454, t1: 476, quien: 'Luana', bloque: 'Caso de referencia: HDS',
      texto: '“Gracias, Francisco. Como ejemplo, HDS, una empresa mediana que partía sin sistema de stock. Tener el trabajo terminado, con el sistema funcionando, llevaría como máximo entre 2 y 3 meses: contar el stock, armar el sistema, capacitar al personal y hacer los ajustes finales, siempre por fases.”' },
    { t0: 476, t1: 500, quien: 'Francisco', bloque: 'Plan de pago 1: el 50 %',
      texto: '“Gracias, Luana. Y lo más importante: cada empresa tiene su propia propuesta y su propia forma de pago. Se paga por etapas, según el avance. Un 50% al firmar, que cubre el hardware, así lo compramos todo desde el principio.”' },
    { t0: 500, t1: 526, quien: 'Luana', bloque: 'Plan de pago 2: el 30 % y el 20 %',
      texto: '“Gracias, Francisco. Después, un 30% al terminar la instalación, y el 20% restante al finalizar la capacitación, con la conformidad del cliente. Así el último pago llega solo cuando todo funciona. El monto de cada empresa se define en la propuesta, después del relevamiento.”' }
  ] },
  'conv-pregunta': { titulo: 'Conversación · la pregunta', bloques: [
    { t0: 526, t1: 536, quien: 'Gonzalo', bloque: 'Conclusiones 1: la pregunta',
      ind: 'La pregunta se escribe sola (unos 4 s) y queda quieta.',
      texto: '“Gracias, Luana. Para cerrar, le hacemos una última pregunta a Stockus: ¿qué dejó este proyecto?”',
      ind2: 'AVANZAR → DIAPO 22 · responde Stockus. Esperar a que termine de escribir (unos 14 s).' }
  ] },
  'conv-respuesta': { titulo: 'Conversación · responde Stockus', bloques: [
    { t0: 536, t1: 561, quien: 'Gonzalo', bloque: 'Conclusiones 1: la respuesta de Stockus',
      ind: 'Las tres líneas aparecen a los 1, 6 y 11 s; queda quieta desde los 14 s.',
      texto: '“Un problema real, resuelto con luz. Partimos de un depósito sin sistema de stock; hoy Stockus permite cargar y controlar el stock, funciona sin internet y ubica cada producto con LEDs inteligentes, todo construido sobre Vento.”',
      ind2: 'AVANZAR → DIAPO 23 (Francisco).' }
  ] },
  'conv-ahora': { titulo: 'Conversación · ¿Y ahora?', bloques: [
    { t0: 561, t1: 567, quien: 'Francisco', bloque: 'Conclusiones 2: ¿y ahora?',
      texto: '“Gracias, Gonzalo. Y ahora, ¿qué sigue?”',
      ind2: 'AVANZAR → DIAPO 24 · responde Stockus: «Primeros clientes.»' }
  ] },
  'conv-final': { titulo: 'Conversación · primeros clientes', bloques: [
    { t0: 567, t1: 586, quien: 'Francisco', bloque: 'Conclusiones 2: primeros clientes',
      ind: 'Aparece «Primeros clientes.» (1–3 s), la línea de abajo (5 s) y «Construido sobre Vento» (8 s).',
      texto: '“Esto recién empieza. Nuestro próximo paso son los primeros clientes, siempre empezando con un relevamiento para entender cómo trabaja cada uno, y acompañarlos después con soporte y mantenimiento.”',
      ind2: 'AVANZAR → DIAPO 25 (Gonzalo, cierre).' }
  ] },
  'cierre': { titulo: 'Cada producto, a un LED de distancia (cierre)', bloques: [
    { t0: 586, t1: 600, quien: 'Gonzalo', bloque: 'Cierre',
      texto: '“Gracias, Francisco. Y si hay que quedarse con una sola idea, es esta: cada producto, a un LED de distancia. Gracias por su atención. Quedamos a disposición para sus preguntas.”' }
  ] }
};
/* El cronómetro arranca al pasar de la diapositiva 1 a la 2. En el guion eso ocurre a las 0:30. */
window.PLAN_T2 = 30;

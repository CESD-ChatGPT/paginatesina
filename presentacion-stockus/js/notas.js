/* Notas del presentador, por id de diapositiva (ver js/orden.js; el número se calcula solo): texto de cada bloque del guion y quién lo dice.
   t0 / t1 = tiempos del guion en segundos desde el inicio (0:00). Las cursivas entre corchetes son indicaciones. */
window.NOTAS = {
  'negro': { titulo: 'Sala a oscuras', bloques: [
    { t0: 0, t1: 30, quien: 'Thomas', bloque: 'Entrada',
      ind: 'Sala a oscuras. Thomas junto al estante, con el micrófono abierto. El técnico mantiene las luces apagadas.',
      texto: '“Stockus, ¿dónde está el tornillo?”',
      ind2: 'Se enciende un solo LED y Stockus responde por voz. Pausa de 2 segundos. Thomas se acerca y saca la caja, que tiene pegada la imagen de un tornillo.' },
    { t0: 30, t1: 80, quien: 'Thomas', bloque: 'Inglés 1: el problema y el sistema',
      texto: '“Hello, everyone. First, I\'m going to talk about where our project started.”\n\n“We did an internship at HDS Technology, a company related to logistics and warehouses. During the internship, we noticed that they didn\'t have a stock system yet. The stock was managed verbally, so employees spent a lot of time looking for products, and mistakes could happen.”\n\n“So we decided to create a solution. We called it Stockus...”',
      ind2: 'SEÑAL PARA EL TÉCNICO: encender todas las luces de la sala. Pasar a la diapositiva 2 (Stockus). Thomas muestra la caja.', en: true }
  ] },
  'stockus': { titulo: 'Stockus (revelación)', bloques: [
    { t0: 50, t1: 80, quien: 'Thomas', bloque: 'Inglés 1 (continúa)', en: true,
      texto: '“...Stockus is a stock control system for warehouses.”\n\n“It is easy to use. First, the user logs in with a username and a password. Then, they can add new products and edit them. Also, they can register when stock comes in or goes out, and check the stock at any moment.”\n\n“Now my partner will explain the most special part of Stockus.”' }
  ] },
  'leds': { titulo: 'LEDs y tecnología', bloques: [
    { t0: 80, t1: 155, quien: 'Pedro', bloque: 'Inglés 2: los LEDs y la tecnología', en: true,
      texto: '“Thank you. Now I\'m going to talk about the feature that makes Stockus different.”\n\n“The user can ask the system where a product is. Then, the smart LEDs on the shelves turn on and show the exact location. This way, workers find products fast, without searching shelf by shelf.”\n\n“Now, about the technology. The system works on a local network, so it doesn\'t need internet. This is very useful for warehouses with a weak connection. It uses a Raspberry Pi as the main computer, and a small board called ESP8266 to control the smart LED strip. You can ask by voice or by text. The Raspberry Pi receives the request and sends the order over WiFi to the ESP8266, which turns on the right LEDs. And the length of the strip adapts to the size of each warehouse.”\n\n“We also built a small model with shelves and LEDs. It works live with our software, so you can see it in action.”\n\n“In short, Stockus saves time, reduces mistakes, and keeps the stock organized.”\n\n“Thank you.”' }
  ] },
  'equipo': { titulo: 'Somos Solvus (equipo)', bloques: [
    { t0: 155, t1: 189, quien: 'Gonzalo', bloque: 'Equipo y producto',
      texto: '“Gracias, Pedro. Esa es la solución: Stockus, un sistema que une software y hardware para controlar el stock y ubicar cada producto con LEDs inteligentes. Como vieron al empezar, le preguntamos por un tornillo y Stockus nos mostró dónde estaba. Puede buscar cualquier cosa, en segundos.”\n\n“Nosotros somos Solvus, la empresa que lo desarrolló. Yo soy Gonzalo, Scrum Master y coordinador. Francisco es Product Owner y responsable de comunicación; Luana, gestora de documentación; y Pedro, Luciano y Thomas, desarrolladores e investigadores. Luciano les muestra nuestra identidad.”' }
  ] },
  'identidad': { titulo: 'Una marca clara y sobria (identidad)', bloques: [
    { t0: 189, t1: 209, quien: 'Luciano', bloque: 'Identidad de marca',
      texto: '“Gracias, Gonzalo. Esta es la identidad de Solvus, que creé yo: una marca clara y sobria, con una paleta de cuatro colores. Su isotipo es una S formada por dos flechas, que representan la entrada y la salida de mercadería. Pedro les cuenta con qué lo construimos.”' }
  ] },
  'vento': { titulo: 'Todo Stockus, en un solo lugar (Vento)', bloques: [
    { t0: 209, t1: 234, quien: 'Pedro', bloque: 'Con qué lo construimos: Vento',
      texto: '“Gracias, Luciano. Todo Stockus lo construimos con Vento, una plataforma de inteligencia artificial para crear proyectos de hardware, robótica, IoT y automatizaciones usando lenguaje natural. Este es nuestro espacio de trabajo: las bases de datos, la Raspberry Pi, las páginas del sistema y los agentes de IA, todo conectado en un solo lugar.”' }
  ] },
  'demo': { titulo: 'Demo: el chatbot funcionando', bloques: [
    { t0: 234, t1: 322, quien: 'Luciano', bloque: 'Demo: el chatbot funcionando',
      ind: 'El video arranca solo al entrar (sin audio, 1:10, termina antes de la placa «Pedí tu demo»). Luciano lo explica de principio a fin, sin silencios. Capítulos en pantalla: 01 crear cuenta · 02 añadir y restar stock · 03 dashboard y alertas · 04 ubicaciones y movimientos · 05 agregar un producto (al final cierra la sesión).',
      texto: '“Gracias, Pedro. Esto es el chatbot de Stockus funcionando. Primero creamos una cuenta, con nombre, usuario y un PIN, para que cada persona entre con el suyo.”\n\n“Ya adentro, le hablamos en lenguaje natural: escribimos «sumar 5 unidades del SKU 1» y el chatbot nos pide confirmación antes de cambiar nada. Lo mismo hacemos para agregar y para restar stock.”\n\n“Cada cambio se actualiza al instante, y a la derecha aparecen las alertas de los productos que están por debajo del mínimo.”\n\n“Desde acá abrimos el dashboard: cuántos productos hay, cuántas unidades, las alertas y el stock por ubicación. También vemos todos los movimientos, con fecha y hora, y cerramos la sesión.”\n\n“Y si falta un producto, lo agregamos con su categoría, su código, su ubicación y su stock mínimo.”',
      ind2: 'Termina el video. Se hace en vivo, con el estante.' },
    { t0: 308, t1: 322, quien: 'Luciano', bloque: 'En vivo con el estante',
      texto: '“Y lo mejor es que esto se conecta con los LEDs inteligentes. Lo hacemos en vivo: Stockus, ¿dónde está el tornillo?”\n\n(Se enciende el LED y Stockus responde por voz.)\n\n“El cajón se ilumina y no hace falta buscar estante por estante. Usamos un tornillo, pero puede ser cualquier cosa.”',
      ind2: 'La caja tiene pegada la imagen de un tornillo. Ensayar el en vivo con ruido de fondo.' }
  ] },
  'metodologia': { titulo: 'Paso a paso, con Scrum (metodología)', bloques: [
    { t0: 322, t1: 348, quien: 'Luana', bloque: 'Metodología',
      texto: '“Gracias, Luciano. Ahora les contamos cómo lo construimos. Todo empezó en la pasantía en HDS, donde descubrimos el problema. Organizamos el trabajo con Scrum: dividimos el proyecto en sprints, que son ciclos cortos con un objetivo claro, y anotamos las tareas en Trello como historias de usuario. Yo me encargué de la documentación, en especial del manual de usuario.”' },
    { t0: 348, t1: 370, quien: 'Francisco', bloque: 'Resultados de los sprints',
      texto: '“Gracias, Luana. En el primer sprint hicimos la investigación general y definimos los límites del proyecto; en el segundo, desarrollamos el software; y en el tercero, integramos el software con el hardware. Eso es lo que acaban de ver.”' },
    { t0: 370, t1: 390, quien: 'Thomas', bloque: 'Retrospectivas y desafío',
      texto: '“Gracias, Francisco. Al cierre de cada sprint hicimos una retrospectiva, de unos 30 minutos, con tres preguntas: qué empezar, qué parar y qué continuar. Ahí detectamos nuestro mayor desafío: limitar el alcance. Aprendimos a priorizar lo esencial antes de sumar funciones.”' }
  ] },
  'deposito': { titulo: 'Video: así cambia un depósito', bloques: [
    { t0: 390, t1: 412, quien: 'Francisco', bloque: 'Video: así cambia un depósito',
      ind: 'Video sin audio, 21,7 segundos. Francisco lo describe mientras corre. Tiempos aproximados: 0–1,5 s el problema; 1,5–5,5 s las consecuencias; 5,5–7 s entra Stockus; 7–13 s ingresos y egresos; 13–17 s búsqueda con LED; 17–21,7 s el resultado.',
      texto: '“Gracias, Thomas. Así cambia un depósito: hoy el stock se lleva de memoria, se pierde tiempo y se cometen errores. Entra Stockus: registramos ingresos y egresos desde la web o el chat, preguntamos dónde está un producto y el LED nos lo muestra. El resultado: stock claro, cada producto a un LED de distancia.”',
      ind2: 'No decir «animación» ni «página web»: describir lo que se ve. El video usa la leche como producto de ejemplo: no nombrar a ninguna empresa.' }
  ] },
  'escala': { titulo: 'Crece con cada empresa (escala)', bloques: [
    { t0: 412, t1: 434, quien: 'Luana', bloque: 'Lo económico 1: por qué no hay un precio único',
      texto: '“Gracias, Francisco. Ahora hablemos de lo económico. Stockus no es un producto cerrado: crece con cada empresa, desde una sola zona hasta todo el depósito. Por eso es difícil ponerle un único precio, y esa es justamente su ventaja: se adapta a lo que cada cliente necesita. Por eso empezamos siempre con un relevamiento.”' }
  ] },
  'presupuesto': { titulo: 'Qué entra en el presupuesto', bloques: [
    { t0: 434, t1: 454, quien: 'Francisco', bloque: 'Lo económico 2: costo fijo y variable',
      texto: '“Gracias, Luana. El presupuesto tiene un costo fijo, igual para todos: el software y el hardware base, con la Raspberry Pi, la ESP8266 y la fuente. Y una parte que depende de cada empresa: los metros de LEDs inteligentes, el tamaño del depósito y qué quiere automatizar. Más extras opcionales, como capacitación y soporte mensual.”' }
  ] },
  'equilibrio': { titulo: 'Nuestro punto de equilibrio', bloques: [
    { t0: 454, t1: 478, quien: 'Luana', bloque: 'Lo económico 3: punto de equilibrio',
      texto: '“Gracias, Francisco. Para que Solvus sea sostenible calculamos nuestro punto de equilibrio: cuántos sistemas tenemos que vender por mes para cubrir nuestros gastos fijos. Dividimos esos gastos por lo que deja cada venta, que es el precio menos los materiales. El resultado: con jornada completa, entre 2 y 3 sistemas por mes; con media jornada, aproximadamente la mitad.”' }
  ] },
  'pago': { titulo: 'Un caso real y cómo se paga', bloques: [
    { t0: 478, t1: 498, quien: 'Francisco', bloque: 'Caso de referencia: HDS',
      texto: '“Gracias, Luana. Como ejemplo, tomamos a HDS, una empresa mediana que partía sin sistema de stock. Contar todo su stock llevaría como máximo entre 2 y 3 meses, trabajando 8 horas por día. Después, armado, capacitación y ajustes finales, siempre por fases.”' },
    { t0: 498, t1: 520, quien: 'Luana', bloque: 'Plan de pago 1: anticipo e instalación',
      texto: '“Gracias, Francisco. ¿Y cómo se paga? Por etapas, según el avance. Un 50% al firmar, que cubre el hardware, así lo compramos todo desde el principio. Y un 30% al terminar la instalación. De esta forma el cliente paga a medida que ve resultados.”' },
    { t0: 520, t1: 540, quien: 'Francisco', bloque: 'Plan de pago 2: entrega',
      texto: '“Y el 20% restante, al finalizar la capacitación y con la conformidad del cliente. El monto de cada empresa se define en la propuesta, después del relevamiento.”' }
  ] },
  'conclusiones-a': { titulo: 'Conclusiones · Versión A: el estante que se abre', bloques: [
    { t0: 540, t1: 590, quien: 'Gonzalo', bloque: 'Conclusiones y futuro · VERSIÓN A',
      ind: 'Versión A (el estante que se abre). La animación dura unos 6 s y se dispara sola.',
      texto: '“Gracias, Francisco. Para cerrar: partimos de un problema real, un depósito sin sistema de stock. Hoy Stockus permite cargar y controlar el stock, funciona sin internet y ubica cada producto con LEDs inteligentes, todo construido sobre Vento.”\n\n“Pero esto recién empieza. Queremos seguir probándolo y adaptándolo a distintos tipos de depósito, escuchando a cada empresa. Nuestro próximo paso es llegar a los primeros clientes, empezando siempre con un relevamiento para entender cómo trabaja cada uno, y acompañarlos después de la instalación con soporte y mantenimiento.”' }
  ] },
  'conclusiones-b': { titulo: 'Conclusiones · Versión B: la conversación con Stockus', bloques: [
    { t0: 540, t1: 590, quien: 'Gonzalo', bloque: 'Conclusiones y futuro · VERSIÓN B',
      ind: 'Versión B (la conversación con Stockus). La escritura dura unos 8 s y se dispara sola; se puede hablar encima.',
      texto: '“Gracias, Francisco. Para cerrar: partimos de un problema real, un depósito sin sistema de stock. Hoy Stockus permite cargar y controlar el stock, funciona sin internet y ubica cada producto con LEDs inteligentes, todo construido sobre Vento.”\n\n“Pero esto recién empieza. Queremos seguir probándolo y adaptándolo a distintos tipos de depósito, escuchando a cada empresa. Nuestro próximo paso es llegar a los primeros clientes, empezando siempre con un relevamiento para entender cómo trabaja cada uno, y acompañarlos después de la instalación con soporte y mantenimiento.”' }
  ] },
  'cierre': { titulo: 'Gracias y preguntas', bloques: [
    { t0: 590, t1: 600, quien: 'Gonzalo', bloque: 'Cierre',
      texto: '“Gracias por su atención. Quedamos a disposición para sus preguntas.”' }
  ] }
};
/* El cronómetro arranca al pasar de la diapositiva 1 a la 2. En el guion eso ocurre cerca de 0:50. */
window.PLAN_T2 = 50;

import { Link } from 'react-router-dom'

/* Términos y condiciones de Stockus, de SOLVUS.
   BORRADOR: debe revisarlo un profesional antes de publicarlo. Los datos
   entre corchetes (razón social, CUIT, domicilio) faltan y no se inventan. */

const SECCIONES = [
  {
    titulo: '1. Quiénes somos',
    texto: 'Stockus es un producto de SOLVUS, emprendimiento de [razón social], CUIT [número], con domicilio en [domicilio]. Contacto: WhatsApp 351 804 6548.',
  },
  {
    titulo: '2. Qué es Stockus',
    texto: 'Stockus es un sistema de control de inventario que combina una aplicación web con hardware instalado en el depósito del cliente: un servidor local, una tira de luces LED que guía al producto y una balanza que registra los movimientos de stock.',
  },
  {
    titulo: '3. Compra, precio y pago',
    texto: 'El precio de referencia se informa por escrito antes de la compra e incluye IVA cuando así se indique. El pago puede hacerse de contado o en cuotas, según la propuesta aceptada. Las condiciones de cada venta se confirman en un presupuesto firmado por ambas partes.',
  },
  {
    titulo: '4. Instalación',
    texto: 'La instalación y la capacitación inicial del equipo están incluidas en el precio acordado. El plazo de instalación depende del cliente y del plan contratado, y se fija en el presupuesto.',
  },
  {
    titulo: '5. Garantía y soporte',
    texto: 'El hardware tiene garantía de [plazo, por ejemplo 2 años] contra defectos de fabricación. La garantía no cubre daños por mal uso, golpes, humedad, cortes de energía o intervención de terceros. El soporte técnico incluido y su alcance se detallan en el presupuesto.',
  },
  {
    titulo: '6. Uso del software',
    texto: 'El cliente es responsable de los datos de su inventario y de sus usuarios. Las actualizaciones del software se incluyen según el plan contratado. No se garantiza disponibilidad ininterrumpida de la aplicación en línea, que depende de servicios de terceros.',
  },
  {
    titulo: '7. Datos personales',
    texto: 'Los datos de contacto que se envían por el formulario o por WhatsApp se usan solo para responder la consulta y coordinar la demo. No se comparten con terceros, salvo obligación legal. El titular puede pedir acceso, rectificación o supresión de sus datos escribiendo al contacto indicado.',
  },
  {
    titulo: '8. Propiedad intelectual',
    texto: 'El nombre Stockus, la marca SOLVUS, el logotipo, los textos y el software son propiedad de sus titulares. Está prohibida su copia o reventa sin autorización.',
  },
  {
    titulo: '9. Limitación de responsabilidad',
    texto: 'La información de esta página tiene carácter orientativo. SOLVUS no responde por pérdidas indirectas ni por decisiones de compra tomadas solo con base en los datos de demostración.',
  },
  {
    titulo: '10. Ley aplicable',
    texto: 'Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia se somete a los tribunales de [jurisdicción].',
  },
]

export default function Terminos() {
  return (
    <main className="shell pt-32 pb-24 max-w-[760px]">
      <Link to="/" className="t-mono text-[12px] text-muted hover:text-[var(--accent)]">← Volver a la landing</Link>
      <h1 className="t-h2 mt-8 mb-3">Términos y condiciones</h1>
      <p className="t-mono text-[11px] text-muted mb-10">Última actualización: [fecha] · Borrador pendiente de revisión legal</p>

      <div className="flex flex-col gap-8">
        {SECCIONES.map(({ titulo, texto }) => (
          <section key={titulo}>
            <h2 className="t-h3 mb-2">{titulo}</h2>
            <p className="t-body text-[15px]">{texto}</p>
          </section>
        ))}
      </div>
    </main>
  )
}

import { Mail, MessageSquare } from 'lucide-react'

export default function CTA() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Listo para optimizar tu inventario?
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Descubre cómo StockAI puede transformar tu gestión de stock con inteligencia artificial.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-blue-600" size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Prueba 14 días gratis
                </h3>
                <p className="text-gray-600 text-sm">
                  Sin tarjeta de crédito necesaria
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="text-blue-600" size={32} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Demostración personalizada
                </h3>
                <p className="text-gray-600 text-sm">
                  Habla con un experto
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Comenzar
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Contactar
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-8">
              Solución confiable para empresas de todos los tamaños.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

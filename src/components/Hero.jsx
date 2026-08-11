import { ArrowRight, Zap, Brain } from 'lucide-react'

export default function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="text-blue-600" size={24} />
              <span className="text-blue-600 font-semibold">Inteligencia Artificial</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Control de Stock
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                {' '}Inteligente
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Automatiza tu inventario con IA. Reduce costos, prevén demanda y optimiza tu cadena de suministro en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary flex items-center justify-center gap-2">
                Prueba Gratis <ArrowRight size={20} />
              </button>
              <button className="btn-secondary">
                Ver Demo
              </button>
            </div>

            <div className="mt-12 flex items-center space-x-8">
              <div>
                <p className="text-3xl font-bold text-blue-600">500+</p>
                <p className="text-gray-600">Empresas Activas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">98%</p>
                <p className="text-gray-600">Satisfacción</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">24/7</p>
                <p className="text-gray-600">Soporte</p>
              </div>
            </div>
          </div>

          <div className="relative h-96 md:h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl opacity-10 blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-3xl p-8 flex items-center justify-center h-80 md:h-96">
                <div className="text-center">
                  <Zap className="text-yellow-400 mx-auto mb-4" size={64} />
                  <p className="text-white text-lg font-semibold">
                    Dashboard en Tiempo Real
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Monitorea tu inventario desde cualquier dispositivo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

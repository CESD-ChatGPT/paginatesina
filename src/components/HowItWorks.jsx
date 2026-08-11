import { Download, Brain, BarChart3, Zap } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: Download,
      title: 'Conecta tu datos',
      description: 'Integra fácilmente tus sistemas existentes (ERP, e-commerce, CRM) con nuestras APIs.'
    },
    {
      icon: Brain,
      title: 'IA Aprende',
      description: 'Nuestros modelos de ML analizan patrones históricos y actuales de tu inventario.'
    },
    {
      icon: BarChart3,
      title: 'Predicciones',
      description: 'Obtén predicciones precisas de demanda, tendencias y optimizaciones.'
    },
    {
      icon: Zap,
      title: 'Automatiza',
      description: 'Automatiza decisiones de inventario basadas en recomendaciones de IA.'
    },
  ]

  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cómo Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un proceso simple y automático para optimizar tu inventario
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-8 mb-6 min-h-64 flex flex-col justify-between">
                  <Icon className="text-blue-600 mb-4" size={48} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Conector entre pasos */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
                )}

                {/* Número del paso */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
              </div>
            )
          })}
        </div>

        {/* Caso de uso */}
        <div className="mt-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Caso de Uso Real
            </h3>
            <p className="text-gray-600 mb-4 text-lg">
              Una tienda de electrónica con 50+ SKUs y múltiples almacenes redujo:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-lg">↓ 35%</span>
                <span className="text-gray-600">Exceso de inventario</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-lg">↑ 42%</span>
                <span className="text-gray-600">Precisión de pronósticos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-lg">↓ 28%</span>
                <span className="text-gray-600">Rupturas de stock</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold text-lg">↓ 52%</span>
                <span className="text-gray-600">Tiempo de gestión manual</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Métricas Clave</h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Precisión de Predicción</span>
                  <span className="font-bold text-blue-600">94%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Optimización de Costos</span>
                  <span className="font-bold text-blue-600">68%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Disponibilidad de Productos</span>
                  <span className="font-bold text-blue-600">99.2%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.2%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

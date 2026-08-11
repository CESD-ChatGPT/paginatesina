import { Check } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/mes',
      description: 'Perfecto para pequeños negocios',
      features: [
        'Hasta 500 SKUs',
        'Dashboard básico',
        'Predicciones diarias',
        'Alertas de stock bajo',
        'Soporte por email',
        'API limitada',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/mes',
      description: 'Para empresas en crecimiento',
      features: [
        'Hasta 5,000 SKUs',
        'Dashboard avanzado',
        'Predicciones horarias',
        'Alertas inteligentes',
        'Soporte prioritario',
        'API completa',
        'Múltiples almacenes',
        'Análisis avanzado',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Solución personalizada',
      features: [
        'SKUs ilimitados',
        'Todas las características',
        'Análisis predictivo custom',
        'Automatización avanzada',
        'Soporte 24/7 dedicado',
        'Integración personalizada',
        'SLA garantizado',
        'Capacitación incluida',
      ],
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planes de Precios
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan perfecto para tu negocio. Sin contratos de largo plazo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.highlighted
                  ? 'ring-2 ring-blue-600 shadow-2xl md:scale-105'
                  : 'shadow-lg'
              }`}
            >
              {/* Badge para plan destacado */}
              {plan.highlighted && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 text-center font-semibold">
                  Más Popular
                </div>
              )}

              <div className={`p-8 ${plan.highlighted ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-white'}`}>
                {/* Encabezado del plan */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {plan.description}
                </p>

                {/* Precio */}
                <div className="mb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                  {!plan.period && (
                    <p className="text-gray-600 text-sm mt-2">
                      Contáctanos para una demostración
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition-colors ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contactar Ventas' : 'Comenzar'}
                </button>

                {/* Características */}
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check
                        size={20}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Comparación */}
        <div className="mt-20 bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Comparativa de Funcionalidades
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Característica</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Professional</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'Predicción IA',
                  'Análisis Predictivo',
                  'Automatización',
                  'Integraciones',
                  'API',
                  'Soporte Prioritario',
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-4 px-4 text-gray-700">{feature}</td>
                    <td className="py-4 px-4 text-center">
                      <Check className="mx-auto text-green-500" size={20} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="mx-auto text-green-500" size={20} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="mx-auto text-green-500" size={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

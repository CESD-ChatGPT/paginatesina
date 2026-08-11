import { Star } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'María García',
      role: 'CEO, RetailMax',
      company: 'Cadena de Tiendas - 45 sucursales',
      text: 'StockAI ha transformado cómo gestionamos nuestro inventario. Hemos reducido ruptura de stock en un 30% y ahorrado miles en exceso de inventario.',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      name: 'Carlos Mendoza',
      role: 'Operations Manager, LogisticaPro',
      company: 'Distribuidor Mayorista',
      text: 'La predicción de demanda es increíblemente precisa. Nuestro equipo ahora tiene más tiempo para estrategia en lugar de gestión manual.',
      avatar: '👨‍💼',
      rating: 5,
    },
    {
      name: 'Ana López',
      role: 'Owner, Fashion Hub',
      company: 'E-commerce de Ropa',
      text: 'Perfecto para nuestro negocio estacional. StockAI predice tendencias mucho mejor que nuestras estimaciones anteriores.',
      avatar: '👩‍🔬',
      rating: 5,
    },
    {
      name: 'Roberto Sánchez',
      role: 'Supply Chain Director, ElectroShop',
      company: 'Electrónica - $5M anuales',
      text: 'La ROI fue inmediata. El primer mes ya recuperamos la inversión. Ahora es parte fundamental de nuestra operación.',
      avatar: '👨‍💻',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Testimonios de Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Más de 500 empresas confían en StockAI para optimizar su inventario
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Calificación */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 text-lg mb-6 italic">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <span className="text-4xl">{testimonial.avatar}</span>
                <div>
                  <p className="font-bold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-blue-600 text-sm font-semibold">
                    {testimonial.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas de Clientes */}
        <div className="mt-20 grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">500+</p>
            <p className="text-gray-600">Empresas Activas</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">$200M+</p>
            <p className="text-gray-600">Valor Gestionado</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">4.9/5</p>
            <p className="text-gray-600">Rating Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">99.9%</p>
            <p className="text-gray-600">Disponibilidad</p>
          </div>
        </div>
      </div>
    </section>
  )
}

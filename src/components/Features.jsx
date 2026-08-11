import { BarChart3, Brain, AlertCircle, Zap, Lock, Globe } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: 'IA Predictiva',
      description: 'Predice demanda futura con precisión usando aprendizaje automático avanzado.'
    },
    {
      icon: BarChart3,
      title: 'Análisis en Tiempo Real',
      description: 'Visualiza métricas de inventario y tendencias instantáneamente.'
    },
    {
      icon: AlertCircle,
      title: 'Alertas Inteligentes',
      description: 'Recibe notificaciones automáticas para stock bajo, sobrestock o anomalías.'
    },
    {
      icon: Zap,
      title: 'Automatización',
      description: 'Automatiza pedidos, reabastecimiento y procesos repetitivos.'
    },
    {
      icon: Lock,
      title: 'Seguridad Empresarial',
      description: 'Encriptación de grado militar y cumplimiento con estándares internacionales.'
    },
    {
      icon: Globe,
      title: 'Multisede',
      description: 'Gestiona múltiples almacenes y ubicaciones desde una plataforma central.'
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Características Principales
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todo lo que necesitas para optimizar tu control de inventario
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="feature-card animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="text-blue-600 mb-4" size={40} />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

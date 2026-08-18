import { BarChart3, Brain, AlertCircle, Zap, Lock, Globe } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: 'IA Predictiva',
      description: 'Predicciones precisas con aprendizaje automático avanzado.',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Análisis Real',
      description: 'Métricas instantáneas y tendencias en tiempo real.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: AlertCircle,
      title: 'Alertas Smart',
      description: 'Notificaciones automáticas e inteligentes.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Automatización',
      description: 'Procesos automáticos y pedidos inteligentes.',
      color: 'from-pink-500 to-red-600'
    },
    {
      icon: Lock,
      title: 'Seguridad',
      description: 'Encriptación de grado militar.',
      color: 'from-red-500 to-orange-600'
    },
    {
      icon: Globe,
      title: 'Multisede',
      description: 'Gestión centralizada de múltiples ubicaciones.',
      color: 'from-orange-500 to-yellow-600'
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-28 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-14 sm:mb-20 animate-slide-in-up">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight text-main">
            <span>Características</span>
            <br />
            <span className="gradient-text">Revolucionarias</span>
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto">
            Soluciones inteligentes para cada aspecto de tu negocio
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group glass-hover glass h-full p-6 sm:p-8 rounded-2xl animate-slide-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-full h-full text-white" />
                </div>

                <h3 className="text-xl font-bold text-main mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>

                <div className={`mt-6 h-1 w-8 bg-gradient-to-r ${feature.color} rounded-full group-hover:w-16 transition-all`}></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

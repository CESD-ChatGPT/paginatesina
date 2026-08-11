import { Zap } from 'lucide-react'
import CtaButton from './CtaButton'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className="animate-slide-in-left">
            <div className="inline-block mb-6 glass px-4 py-2 text-sm">
              <span className="gradient-text font-semibold">✨ Inteligencia Artificial</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
              <span>Control de</span>
              <br />
              <span className="gradient-text animate-glow">Stock</span>
              <br />
              <span>Inteligente</span>
            </h1>

            <p className="text-lg text-gray-300 mb-12 leading-relaxed max-w-lg">
              La única plataforma con IA que realmente entiende tu inventario. Reduce costos, prevén demanda y optimiza tu negocio automáticamente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <CtaButton />
              <button className="px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-opacity-20 backdrop-blur-md">
                Ver Demo
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6">
              {[
                { value: '500+', label: 'Empresas' },
                { value: '98%', label: 'Satisfacción' },
                { value: '24/7', label: 'Soporte' }
              ].map((stat, i) => (
                <div key={i} className="animate-slide-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative h-96 flex items-center justify-center animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl opacity-20 blur-3xl animate-pulse-glow"></div>

            <div className="relative w-full h-full">
              <div className="glass-lg absolute inset-0 flex flex-col items-center justify-center">
                <Zap className="text-cyan-400 mb-4 animate-bounce" size={64} />
                <h3 className="text-2xl font-bold text-white text-center mb-2">
                  Dashboard IA
                </h3>
                <p className="text-gray-300 text-sm text-center">
                  Análisis en tiempo real
                </p>
              </div>

              {/* Floating cards effect */}
              <div className="absolute top-8 right-8 glass p-4 rounded-lg w-32 animate-slide-in-up stagger-1">
                <p className="text-xs text-gray-300">Predicción</p>
                <p className="text-lg font-bold gradient-text">+23%</p>
              </div>
              <div className="absolute bottom-8 left-8 glass p-4 rounded-lg w-32 animate-slide-in-up stagger-2">
                <p className="text-xs text-gray-300">Eficiencia</p>
                <p className="text-lg font-bold gradient-text">-15%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

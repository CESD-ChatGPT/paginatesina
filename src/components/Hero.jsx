import { Zap } from 'lucide-react'
import CtaButton from './CtaButton'

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Left side - Text */}
          <div className="animate-slide-in-left text-center md:text-left">
            <div className="inline-block mb-6 glass px-4 py-2 text-sm">
              <span className="gradient-text font-semibold">✨ Inteligencia Artificial</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 leading-tight text-main">
              <span>Control de</span>
              <br />
              <span className="gradient-text animate-glow">Stock</span>
              <br />
              <span>Inteligente</span>
            </h1>

            <p className="text-base sm:text-lg text-muted mb-10 md:mb-12 leading-relaxed max-w-lg mx-auto md:mx-0">
              La única plataforma con IA que realmente entiende tu inventario. Reduce costos, prevén demanda y optimiza tu negocio automáticamente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
              <CtaButton size="lg" />
              <button className="w-full sm:w-auto px-8 py-4 glass text-main font-semibold rounded-2xl hover:bg-opacity-20 backdrop-blur-md">
                Ver Demo
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6">
              {[
                { value: '500+', label: 'Empresas' },
                { value: '98%', label: 'Satisfacción' },
                { value: '24/7', label: 'Soporte' }
              ].map((stat, i) => (
                <div key={i} className="animate-slide-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                  <p className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-soft text-xs sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative h-72 sm:h-96 flex items-center justify-center animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl opacity-20 blur-3xl animate-pulse-glow"></div>

            <div className="relative w-full h-full max-w-sm md:max-w-none mx-auto">
              <div className="glass-lg absolute inset-0 flex flex-col items-center justify-center px-6">
                <Zap className="text-cyan-400 mb-4 animate-bounce" size={56} />
                <h3 className="text-xl sm:text-2xl font-bold text-main text-center mb-2">
                  Dashboard IA
                </h3>
                <p className="text-muted text-sm text-center">
                  Análisis en tiempo real
                </p>
              </div>

              {/* Floating cards effect */}
              <div className="hidden xs:block absolute top-4 right-4 sm:top-8 sm:right-8 glass px-3 py-2 sm:p-4 rounded-lg w-24 sm:w-32 animate-slide-in-up stagger-1">
                <p className="text-[10px] sm:text-xs text-muted">Predicción</p>
                <p className="text-sm sm:text-lg font-bold gradient-text">+23%</p>
              </div>
              <div className="hidden xs:block absolute bottom-4 left-4 sm:bottom-8 sm:left-8 glass px-3 py-2 sm:p-4 rounded-lg w-24 sm:w-32 animate-slide-in-up stagger-2">
                <p className="text-[10px] sm:text-xs text-muted">Eficiencia</p>
                <p className="text-sm sm:text-lg font-bold gradient-text">-15%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Mail, MessageSquare, ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="glass-lg p-12 md:p-20 rounded-3xl backdrop-blur-md animate-scale-in">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              <span>Transforma tu</span>
              <br />
              <span className="gradient-text">Negocio Hoy</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Únete a cientos de empresas que ya están ahorrando dinero con StockAI
            </p>
          </div>

          {/* Feature boxes */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Mail, title: 'Prueba Gratis', desc: 'Sin tarjeta de crédito' },
              { icon: MessageSquare, title: 'Demo Personal', desc: 'Con un experto' }
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="glass p-6 rounded-2xl backdrop-blur-sm text-center animate-slide-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                  <Icon className="w-8 h-8 mx-auto mb-3 text-cyan-400" />
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 overflow-hidden hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
              <span className="relative z-10">Comenzar Ahora</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-8 py-4 glass text-white font-bold rounded-xl hover:bg-opacity-20 transition-all">
              Agendar Demo
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Sin compromisos • Acceso inmediato • Cancela en cualquier momento
          </p>
        </div>
      </div>
    </section>
  )
}

import { Github, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black/40 backdrop-blur-md border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="animate-slide-in-up">
            <div className="text-2xl font-black gradient-text mb-4">
              Stock<span className="text-cyan-400">AI</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Control inteligente de inventario con IA para el futuro del retail.
            </p>
          </div>

          {/* Product */}
          <div className="animate-slide-in-up stagger-1">
            <h4 className="font-bold text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Características', 'Precios', 'API', 'Status'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="animate-slide-in-up stagger-2">
            <h4 className="font-bold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Acerca de', 'Blog', 'Carreras', 'Contacto'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="animate-slide-in-up stagger-3">
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Términos', 'Privacidad', 'Cookies', 'Seguridad'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="animate-slide-in-up stagger-4">
            <h4 className="font-bold text-white mb-4">Síguenos</h4>
            <div className="flex gap-4">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Github, label: 'GitHub' }
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all"
                  title={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {currentYear} StockAI. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

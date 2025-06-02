import { Button } from "../Buttons"

export const NavBar = ()=> {
  return (
    <nav className=" w-full backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-black rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">LinealCO</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-rose-500 font-medium hover:text-rose-600 transition-colors duration-200">
                Inicio
            </a>
            <a href="#contribuidores" className="text-gray-700 font-medium hover:text-rose-500 transition-colors duration-200">
                Contribuidores
            </a>
            <a href="#descripcion" className="text-gray-700 font-medium hover:text-rose-500 transition-colors duration-200">
                Descripción
            </a>
            </div>
            <Button onClick={() => window.location.href = '/proyects'}>
                Comenzar ahora
            </Button>
        </div>
    </nav>
  )
}

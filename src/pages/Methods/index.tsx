import MethodCard from "../../components/Card"

export const MethodsPage = () => {
  return (
    <main className="mx-auto max-w-7xl">
        <h1 className="text-5xl relative font-bold text-center my-24">Métodos de Transporte Programación Lineal</h1>
        <div className="size-64 rounded-full z-1 bottom-[5%] left-[10%] bg-rose-400 absolute shadow-2xl shadow-rose-400 blur-3xl"></div>
        <div className="size-52 rounded-full z-1 top-[2%] left-[5%] bg-amber-100 absolute shadow-2xl shadow-rose-400 blur-3xl"></div>
        <div className="size-64 rounded-full z-1 top-[32%] right-[6%] bg-orange-400 absolute shadow-2xl opacity-50 shadow-rose-400 blur-3xl"></div>
        <section className="mt-10 mx-auto max-w-[150rem] grid grid-cols-1 md:grid-cols-3 gap-10">
            <MethodCard
                title="Método Noroeste"
                description="El Método noroeste es un enfoque heurístico utilizado para encontrar una solución inicial a problemas de transporte. Este método comienza asignando la mayor cantidad posible a las celdas en la esquina noroeste de la tabla de costos, y luego se mueve hacia el este o hacia el sur hasta que se satisfacen todas las restricciones."
                gradientFrom="from-rose-400"
                gradientTo="to-black"
                route="/proyects/northwest"
            />
            <MethodCard
                title="Método de Costo Mínimo / Utilidad Máxima"
                description="El Método de costo mínimo, también conocido como Método de utilidad máxima, es una técnica para encontrar una solución inicial óptima en problemas de transporte. Este método asigna recursos a las celdas con los costos más bajos primero, maximizando así la utilidad o minimizando el costo total del transporte."
                gradientFrom="from-rose-400"
                gradientTo="to-black"
                route="/proyects/corner"
            />
            <MethodCard
                title="Método de Aproximación de Vogel"
                description="El Método aproximado de vogel es un enfoque heurístico utilizado para encontrar una solución inicial a problemas de transporte. Este método calcula las penalizaciones asociadas a cada fila y columna, y asigna la mayor cantidad posible a las celdas con la penalización más baja, priorizando así las asignaciones más eficientes."
                gradientFrom="from-rose-400"
                gradientTo="to-black"
                route="/proyects/vogel"
            />
        </section>
    </main>
  )
}
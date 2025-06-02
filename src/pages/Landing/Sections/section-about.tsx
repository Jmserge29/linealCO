import desktop from '../../../assets/images/desktop.png'

export const SectionAbout = () => {
  return (
    <section className="flex relative m-20" id="descripcion">
        <div className="w-[50%] flex flex-col items-start justify-center p-10 gap-4 z-10">
            <img src={desktop} alt="" className="z-10 " />
        </div>
        <div className="w-[50%] flex flex-col items-start justify-center p-10 gap-4">
            <h2 className="text-5xl font-semibold ">Descripción</h2>
            <p className="text-justify w-[80%] text-lg"><span className=" text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">LinealCO</span> es un proyecto educativo desarrollado con el propósito de modernizar la enseñanza de la programación lineal en el contexto universitario. La aplicación web proporciona una interfaz intuitiva para la resolución de problemas de transporte, implementando metodologías algorítmicas establecidas en la literatura de investigación de operaciones. A través de un enfoque pedagógico centrado en la visualización y el análisis paso a paso, la herramienta facilita la asimilación de conceptos complejos, promoviendo el aprendizaje autónomo y la experimentación práctica con diferentes escenarios de optimización.</p>
        </div>
    </section>
  )
}

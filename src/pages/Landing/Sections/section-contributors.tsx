export const SectionContributors = () => {
  return (
    <section className="m-20 relative" id="contribuidores">
        <h2 className="text-5xl font-semibold flex justify-center w-[100%] mb-10">Contribuidores</h2>
        <div className="absolute size-70 bg-rose-500 right-[25%] rounded-full z-1 blur-3xl opacity-60"></div>
        <div className="absolute size-70 bg-amber-200 right-[10%] top-[50%] rounded-full z-1 blur-3xl"></div>

        <article className="flex">
            <div className="w-[50%] px-20 flex flex-col items-start justify-center p-10 gap-4 z-10">
                <h3 className="text-4xl font-semibold ">Desarrollador de Sofwtare</h3>
                <p className="text-justify text-lg">Estudiante de sexto semestre de Ingeniería de Sistemas en la Universidad Libre de Barranquilla, con sólida formación académica en desarrollo de software y más de dos años de experiencia práctica en el sector tecnológico. Especializado en el desarrollo de aplicaciones web y móviles, con dominio de tecnologías modernas y metodologías ágiles de desarrollo. Apasionado por la innovación tecnológica y la creación de soluciones digitales que impacten positivamente.</p>
                <span className="font-bold text-2xl">José Serge.</span>
            </div>
            <div className="relative w-[50%] flex flex-col items-center justify-center p-10 gap-4 z-10">
                {/* <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-amber-400 rounded-full z-1 top-[1%]"></div>
                <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-rose-400 rounded-full z-1 top-[10%]"></div>
                <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-rose-400 rounded-full z-1 top-[20%]"></div>
                <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-rose-400 rounded-full z-1 top-[80%]"></div> */}

                <div className="size-96">
                    <img className="w-full h-full object-cover rounded-full" src="https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9" alt="José Serge" />
                </div>
            </div>
        </article>
    </section>
  )
}

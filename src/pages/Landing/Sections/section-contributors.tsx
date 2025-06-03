import { useState } from "react";

export const SectionContributors = () => {
    const [perfil, setPerfil] = useState(false);
  return (
    <section className="m-20 relative" id="contribuidores">
        <h2 className="text-5xl font-semibold flex justify-center w-[100%] mb-10">Contribuidores</h2>
        <div className="absolute size-70 bg-rose-500 right-[25%] rounded-full z-1 blur-3xl opacity-60"></div>
        <div className="absolute size-70 bg-amber-200 right-[10%] top-[50%] rounded-full z-1 blur-3xl"></div>

        <article className="flex">
            <div className="w-[50%] px-20 flex flex-col items-start justify-center p-10 gap-4 z-10">
                <h3 className="text-4xl font-semibold ">{!perfil ? 'Desarrollador de Sofwtare' : 'Estudiante ingeniería de Sistemas'}</h3>
                <p className="text-justify text-lg">{!perfil ? 'Estudiante de sexto semestre de Ingeniería de Sistemas en la Universidad Libre de Barranquilla, con sólida formación académica en desarrollo de software y más de dos años de experiencia práctica en el sector tecnológico. Especializado en el desarrollo de aplicaciones web y móviles, con dominio de tecnologías modernas y metodologías ágiles de desarrollo. Apasionado por la innovación tecnológica y la creación de soluciones digitales que impacten positivamente.': 'Estudiante de sexto semestre de Ingeniería de Sistemas en la Universidad Libre de Barranquilla, con sólida formación académica en desarrollo de software.'}</p>
                <span className="font-bold text-2xl">{!perfil ? 'José Serge' : 'Walter Olmos'}.</span>
            </div>
            <div className="relative w-[50%] flex items-center justify-center p-10 gap-2 z-10">
                {/* <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-amber-400 rounded-full z-1 top-[1%]"></div>
                <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-rose-400 rounded-full z-1 top-[10%]"></div>
                <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-rose-400 rounded-full z-1 top-[20%]"></div>
                <div className="absolute size-8 border-2 border-black shadow-2xl shadow-black bg-rose-400 rounded-full z-1 top-[80%]"></div> */}

                <div className={`${!perfil ? 'size-72' : 'size-40'} transition-all duration-1000 ease-in-out`}>
                    <img onClick={() => setPerfil((prevState) => !prevState)} className={`w-full h-full transition-all duration-1000 ease-in-out object-cover rounded-full ${!perfil && 'shadow-2xl shadow-white border-8 border-white'} cursor-pointer`} src="https://media-bog2-2.cdn.whatsapp.net/v/t61.24694-24/491840962_2523956261278214_2617378343373288705_n.jpg?ccb=11-4&oh=01_Q5Aa1gEdacmdgSJhFkXazQUhI_ateIUS2XlcWCYkwb33EYm4jw&oe=684C38DF&_nc_sid=5e03e0&_nc_cat=106" alt="José Serge" />
                </div>
                <div className={`${perfil ? 'size-72' : 'size-40'} transition-all duration-1000 ease-in-out`}>
                    <img onClick={() => setPerfil((prevState) => !prevState)} className={`w-full h-full object-cover transition-all duration-1000 ease-in-out rounded-full ${perfil && 'shadow-2xl shadow-white border-8 border-white'} cursor-pointer`} src="https://media-bog2-2.cdn.whatsapp.net/v/t61.24694-24/484421364_1787348258710081_8986885307090276497_n.jpg?ccb=11-4&oh=01_Q5Aa1gG-tcKoUXOKc36FLxTxS9mncEtZBSIvRXc-Yuuo7Bpf-Q&oe=684C4036&_nc_sid=5e03e0&_nc_cat=110" alt="José Serge" />
                </div>
            </div>
        </article>
    </section>
  )
}

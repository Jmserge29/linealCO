import React from 'react';

// Tipos e interfaces
interface MethodCardProps {
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  imageSrc?: string;
  imageAlt?: string;
  route: string;
  className?: string;
  onClick?: () => void;
}

const MethodCard: React.FC<MethodCardProps> = ({
  title,
  description,
  gradientFrom,
  gradientTo,
  imageSrc,
  imageAlt = "",
  route,
  className = "",
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = route;
    }
  };

  return (
    <div className={`${className} bg-rose-400/10 px-10 py-4 rounded-4xl z-30`}>
      <h2 className={`text-3xl z-30 font-semibold mt-10 bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
        {title}
      </h2>
      <p className="text-base mt-4 text-justify text-gray-700 leading-relaxed">
        {description}
      </p>
      <div 
        onClick={handleClick}
        className="cursor-pointer mt-6 w-full h-40 rounded-lg bg-gradient-to-br from-rose-100 to-rose-200 hover:from-rose-200 hover:to-rose-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden group"
      >
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium">Explorar Método</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MethodCard;
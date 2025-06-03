# 🚀 LinealCO

**Solucionador de Problemas de Transporte con Programación Lineal**

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Descripción

**LinealCO** es una herramienta educativa especializada en la enseñanza y aplicación de algoritmos de programación lineal, específicamente diseñada para el análisis y resolución de problemas de transporte. La plataforma implementa métodos fundamentales como la **Esquina Noroeste** y el **Costo Mínimo**, proporcionando una interfaz interactiva que facilita la comprensión de conceptos teóricos mediante la visualización paso a paso de los procesos algorítmicos.

### 🎯 Objetivos del Proyecto

- Modernizar la enseñanza de programación lineal en el contexto universitario
- Facilitar la comprensión de algoritmos de optimización complejos
- Proporcionar herramientas prácticas para estudiantes de ingeniería y ciencias administrativas
- Crear un puente entre la teoría matemática y su aplicación práctica

## ✨ Características Principales

### 🔧 Funcionalidades Core

- **Métodos de Solución Implementados:**
  - ✅ Método de la Esquina Noroeste
  - ✅ Método de Costo Mínimo
  - ✅ Método de Utilidad Máxima

- **Configuración Dinámica:**
  - 📐 Matrices configurables desde 2x2 hasta 6x6
  - ⚖️ Verificación automática de balance (oferta = demanda)
  - 🔄 Reseteo completo de datos

### 📊 Visualización y Análisis

- **Proceso Paso a Paso:**
  - 👀 Visualización detallada de cada iteración del algoritmo
  - 📝 Explicaciones textuales de cada movimiento
  - 📈 Seguimiento de oferta y demanda restante

- **Resultados Completos:**
  - 🎯 Matriz de asignación final
  - 💰 Cálculo automático del costo total
  - 📋 Desglose detallado de cada asignación

### 🎨 Interfaz de Usuario

- **Diseño Moderno:**
  - 🌟 Interfaz intuitiva y responsive
  - 🎨 Gradientes y animaciones suaves
  - 📱 Compatible con dispositivos móviles y desktop

- **Experiencia de Usuario:**
  - ⚡ Feedback inmediato en la entrada de datos
  - 🟢 Indicadores visuales de estado (balanceado/no balanceado)
  - 🔍 Resaltado de celdas con asignaciones

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.0+ | Framework de interfaz de usuario |
| **TypeScript** | 5.0+ | Tipado estático y seguridad de tipos |
| **Tailwind CSS** | 3.0+ | Framework de estilos utilitarios |
| **Lucide React** | Latest | Iconografía moderna |
| **Vite** | Latest | Herramienta de desarrollo y build |

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0 o **yarn** >= 1.22.0

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Jmserge29/linealCO.git
   cd linealco
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o con yarn
   yarn install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   # o con yarn
   yarn dev
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:5173
   ```

## 📖 Guía de Uso

### 1. Configuración del Problema

1. **Ajustar dimensiones:** Selecciona el número de orígenes (filas) y destinos (columnas)
2. **Ingresar costos:** Completa la matriz de costos unitarios de transporte
3. **Definir restricciones:** Establece la oferta de cada origen y demanda de cada destino
4. **Verificar balance:** Asegúrate de que la oferta total = demanda total

### 2. Selección del Método

- **Esquina Noroeste:** Método sistemático que inicia en la esquina superior izquierda
- **Costo Mínimo:** Prioriza las celdas con menor costo unitario
- **Utilidad Máxima:** Optimiza seleccionando las celdas con mayor utilidad

### 3. Análisis de Resultados

- **Solución Óptima:** Revisa la matriz de asignación final
- **Costo Total:** Analiza el costo total de la solución
- **Proceso Detallado:** Estudia cada paso del algoritmo para comprender la lógica

## 🎓 Contexto Académico

### Aplicaciones Educativas

- **Cursos de Investigación de Operaciones**
- **Programación Lineal y Optimización**
- **Logística y Cadena de Suministro**
- **Análisis Cuantitativo para la Toma de Decisiones**

### Casos de Uso Reales

- Optimización de rutas de distribución
- Asignación de recursos en manufactura
- Planificación de suministros en retail
- Gestión de inventarios multi-ubicación

## 🤝 Contribuciones

### Cómo Contribuir

1. **Fork** el proyecto
2. Crea una **rama feature** (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un **Pull Request**

### Áreas de Contribución

- 🧮 Implementación de nuevos algoritmos (Vogel, MODI, etc.)
- 🎨 Mejoras en la interfaz de usuario
- 📱 Optimización para dispositivos móviles
- 📖 Documentación y tutoriales
- 🐛 Corrección de bugs y optimizaciones
- 🌐 Internacionalización (i18n)

## 📝 Roadmap

### Próximas Funcionalidades

- [ ] **Método de Aproximación de Vogel**
- [ ] **Método MODI (Multiplicadores)**
- [ ] **Exportación de resultados a PDF/Excel**
- [ ] **Modo tutorial interactivo**
- [ ] **Biblioteca de ejemplos predefinidos**
- [ ] **Comparación entre métodos**
- [ ] **Modo oscuro**
- [ ] **Análisis de sensibilidad**

### Mejoras Técnicas

- [ ] **Tests unitarios y de integración**
- [ ] **PWA (Progressive Web App)**
- [ ] **Optimización de rendimiento**
- [ ] **Accesibilidad (WCAG 2.1)**

## 👨‍💻 Autor

**José Serge**
- 🎓 Estudiante de 6to semestre - Ingeniería de Sistemas
- 🏫 Universidad Libre de Barranquilla
- 💼 Desarrollador de Software especializado en aplicaciones web
- 🐙 GitHub: [@jmserge29]

**Walter Olmos**
- 🎓 Estudiante de 6to semestre - Ingeniería de Sistemas
- 🏫 Universidad Libre de Barranquilla

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2024 José Serge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```
---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

**Desarrollado con ❤️ para la comunidad educativa**

[🚀 Demo en Vivo](https://lineal-co.vercel.app/)

</div>
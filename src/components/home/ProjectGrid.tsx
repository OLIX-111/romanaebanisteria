import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/router";
import en from "@/locales/en";
import es from "@/locales/es";

// Interfaz para cada proyecto
interface Project {
  id: number;
  category: string; // "Residencial", "Villas", "Hoteles", "All Works"
  image: string;    
}

/**
 * Genera un arreglo de 10 proyectos con números aleatorios (1..90) 
 * para la ruta de la imagen, según la categoría seleccionada.
 */
function getRandomProjects(category: string, count = 11): Project[] {
  const projects: Project[] = [];
  const usedNumbers = new Set<number>();

  while (projects.length < count) {
    const randomNum = Math.floor(Math.random() * 90) + 1; // 1..90
    // Evita repetir la misma imagen
    if (!usedNumbers.has(randomNum)) {
      usedNumbers.add(randomNum);
      projects.push({
        id: randomNum,
        category,
        image: `/projects/romana_ebanisteria_grupo_chavon${randomNum}.png`,
      });
    }
  }

  return projects;
}

const ProjectGrid = () => {
  const { locale } = useRouter() as { locale: string };
  const translations = locale === "es" ? es : en;
  const projTrans = translations.ProjectGrid; // Objeto de traducciones para este componente

  // Categorías (con "All Works" para mostrar 10 aleatorias de la mezcla).
  const categories = ["All Works", "Residencial", "Villas", "Hoteles"];

  // Estado para la categoría seleccionada
  const [activeCategory, setActiveCategory] = useState<string>("All Works");

  // Estado que contiene los proyectos filtrados aleatoriamente
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(
    getRandomProjects("All Works") // Al iniciar, cargamos 10 de "All Works"
  );

  // Maneja el cambio de categoría
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Genera 10 imágenes aleatorias nuevas para esa categoría
    setFilteredProjects(getRandomProjects(category));
  };

  return (
    <section className="px-4 lg:px-8">
      <div className="mx-auto container py-16 md:py-24">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
						{projTrans.title}
          </h2>
        </div>

        {/* Filtros de categorías */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  px-4 py-2 text-sm font-medium border transition-colors duration-200 rounded-sm
                  ${isActive 
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid de proyectos (10 aleatorios para cada categoría) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-72 bg-gray-100 overflow-hidden shadow-md rounded-md"
              style={{ borderRadius: 0 }}
            >
              <img
                src={project.image}
                alt={`${project.category} project #${project.id}`}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: 0 }}
              />
            </motion.div>
          ))}

          {/* Tarjeta de "Ver todos los proyectos" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
              relative w-full h-72 flex flex-col items-start justify-between
              bg-primary text-white font-semibold shadow cursor-pointer
            `}
            style={{ borderRadius: 0 }}
          >
            <a
              href="/projects" // Ajusta la ruta a tu página con más proyectos
              className="flex flex-col justify-between p-4"
            >
              <span className="text-4xl lg:text-4xl max-w-[80%]">
                {projTrans.seeAll}
              </span>
              
            </a>
            <div className="flex flex-row-reverse w-full">
              <span className="mt-2 bg-white text-black p-2 flex w-fit rounded-tl-sm">
                  <ArrowUpRight width={40} height={40}/>
                </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectGrid;

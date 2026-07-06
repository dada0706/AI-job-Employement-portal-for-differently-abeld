import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryIcon } from "../assets/assets";
import { motion } from "framer-motion";
import { SlideLeft, slideRigth } from "../utils/Animation";

const JobCategory = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const handleClick = useCallback(
    (index, name) => {
      setActiveIndex(index);
      setTimeout(() => setActiveIndex(null), 150);
      navigate(`/all-jobs/${encodeURIComponent(name)}`);
      window.scrollTo(0, 0);
    },
    [navigate]
  );

  return (
    <section className="mt-24">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Popular Job Categories
        </h1>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
          Discover top job categories tailored to your skills and career goals.
        </p>
      </div>

      {/* Grid of Categories */}
      <motion.div
        variants={SlideLeft(0.3)}
        initial="hidden"
        whileInView={"visible"}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6"
      >
        {Array.isArray(categoryIcon) &&
          categoryIcon.map((icon, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={index}
                onClick={() => handleClick(index, icon.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleClick(index, icon.name);
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                className={`relative group bg-[var(--card-bg)] p-4 md:p-6 rounded-lg md:rounded-md border border-[var(--border-color)] hover:border-[var(--primary-color)] shadow hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col items-center text-center ${isActive ? "scale-[0.98] bg-[var(--primary-color)]/10 border-[var(--primary-color)]/30" : ""
                  }`}
              >
                <div className="bg-[var(--primary-color)]/10 p-3 rounded-full mb-3 md:mb-4 transition-transform group-hover:scale-105">
                  <img
                    className="w-7 h-7 md:w-8 md:h-8 object-contain drop-shadow-sm dark:brightness-110"
                    src={icon.icon}
                    alt={icon.name}
                    title={icon.name}
                    loading="lazy"
                  />
                </div>
                <span className="font-medium text-[var(--text-color)] text-sm">
                  {icon.name}
                </span>
              </div>
            );
          })}
      </motion.div>
    </section>
  );
};

export default JobCategory;

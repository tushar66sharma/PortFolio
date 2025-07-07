import React from 'react'
import { experiences } from '../../constants'

export const Experience = () => {
  return (
    <section
      id="experience"
      className="py-24 px-6 sm:px-12 md:px-[7vw] lg:px-[16vw] font-sans bg-gradient-to-b from-[#0d2254] to-[#070b12] "

    >
      {/* Section Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white">EXPERIENCE</h2>
        <div className="w-56 h-1 bg-[#1349bd] mx-auto mt-4" />
        <p className="text-gray-400 mt-4 text-lg font-semibold">
          A collection of my work experience and the roles I have taken in
          various organizations
        </p>
      </div>

      <div className="relative">
        {/* Vertical center‐rail (only at 2xl+) */}
        <div
          className="
            absolute hidden 2xl:block
            left-1/2 transform -translate-x-1/2
            w-1 bg-white h-full z-0
          "
        />

        {experiences.map((exp, idx) => (
          <div
            key={exp.id}
            className={`
              flex flex-col 2xl:flex-row items-center mb-16
              ${idx % 2 === 0 ? '2xl:justify-end' : '2xl:justify-start'}
            `}
          >
            {/* Timeline dot (only at 2xl+) */}
            <div
              className="
                absolute hidden 2xl:flex
                left-1/2 transform -translate-x-1/2
                bg-gray-400 border-4 border-[#1349bd]
                w-12 h-12 2xl:w-16 2xl:h-16
                rounded-full justify-center items-center
                z-10
              "
            >
              <img
                src={exp.img}
                alt={exp.company}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Card (always full‑width stack, but at 2xl becomes half‑width and offset) */}
            <div
              className={`
                relative z-20
                w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3
                mx-auto
                2xl:ml-32 2xl:mr-32
                p-4 sm:p-6 md:p-8
                rounded-2xl
                shadow-2xl border border-white
                bg-gray-900 backdrop-blur-md
                shadow-[0_0_20px_1px_rgba(130,69,236,0.3)]
                transform transition-transform duration-300 hover:scale-105
              `}
            >
              {/* Logo & Header */}
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white rounded-md overflow-hidden">
                  <img
                    src={exp.img}
                    alt={exp.company}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {exp.role}
                    </h3>
                    <h4 className="text-md sm:text-sm text-gray-300">
                      {exp.company}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{exp.date}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-gray-400">{exp.desc}</p>

              {/* Skills */}
              <div className="mt-4">
                <h5 className="font-medium text-white">Skills:</h5>
                <ul className="flex flex-wrap mt-2">
                  {exp.skills.map((skill, i) => (
                    <li
                      key={i}
                      className="
                        bg-[#1349bd] text-gray-300
                        px-4 py-1 text-xs sm:text-sm
                        rounded-lg mr-2 mb-2
                        border border-gray-400
                      "
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

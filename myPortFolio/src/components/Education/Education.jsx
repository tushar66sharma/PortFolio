import React from 'react'
import { education } from '../../constants'

export const Education = () => {
  return (
    <section
      id="education"
      className="py-24 px-6 sm:px-12 md:px-[7vw] lg:px-[20vw] font-sans bg-gradient-to-b from-[#04070b] to-[#0d2254]"
    >
      {/* Section Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white">EDUCATION</h2>
        <div className="w-48 h-1 bg-[#1349bd] mx-auto mt-4" />
        <p className="text-gray-400 mt-4 text-lg font-semibold">
          My education has been a journey of learning and development. Here are the details of my academic background
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

        {education.map((edu, idx) => (
          <div
            key={edu.id}
            className={`
              flex flex-col 2xl:flex-row items-center mb-16
              ${idx % 2 === 0 ? '2xl:justify-start' : '2xl:justify-end'}
            `}
          >
            {/* Timeline dot (only at 2xl+) */}
            <div
              className="
                absolute hidden 2xl:flex
                left-1/2 transform -translate-x-1/2
                bg-gray-400 border-4 border-blue-500
                w-12 h-12 2xl:w-16 2xl:h-16
                rounded-full justify-center items-center
                z-10
              "
            >
              <img
                src={edu.img}
                alt={edu.school}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Card (stacked until 2xl, then half‑width and offset) */}
            <div
              className={`
                relative z-20
                w-full sm:w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/3
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
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-md overflow-hidden">
                  <img
                    src={edu.img}
                    alt={edu.school}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {edu.degree}
                    </h3>
                    <h4 className="text-md sm:text-sm text-gray-300">
                      {edu.school}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{edu.date}</p>
                </div>
              </div>

              {/* Grade & Description */}
              <p className="mt-4 text-gray-400 font-bold">
                Grade: {edu.grade}
              </p>
              <p className="mt-2 text-gray-400">{edu.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

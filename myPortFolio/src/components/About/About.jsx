import { useState, useEffect } from "react";
import Tilt from "react-parallax-tilt";
import profileImage from "../../assets/profile5.png";

export const About = () => {
  const words = [
    "Full-Stack Developer",
    "App Developer",
    "Competitive Programmer",
    "Open-Source Contributor",
  ];

  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const delta = isDeleting ? 50 : 150;
    const timeout = setTimeout(() => {
      setText((prev) =>
        isDeleting
          ? current.substring(0, prev.length - 1)
          : current.substring(0, prev.length + 1)
      );

      if (!isDeleting && text === current) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setWordIndex((i) => i + 1);
      }
    }, delta);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <section
      id="about"
      className="py-4 px-[7vw] md:px-[7vw] lg:px-[20vw] font-sans mt-16 md:mt-24 lg:mt-32"
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Left: Text */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2">
            Hi, I am
          </h1>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4">
            Tushar Sharma
          </h2>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-[#1349bd]">
            <span className="text-white">I am a&nbsp;</span>
            <span className="inline font-semibold text-1xl sm:text-2xl md:text-3xl">
              {text}
              <span className="animate-pulse inline">|</span>
            </span>
          </h3>

          {/* About me Paragraph */}
          <p className="text-base sm:text-lg md:text-lg text-gray-400 mb-10 mt-8 leading-relaxed">
            I’m Tushar Sharma, a full‑stack developer with over 2 years
            experience building scalable, user‑centric web applications.
            I specialize in the MERN stack (MongoDB, Express, React, Node.js)
            alongside Python/Django and modern front‑end tools.
            I thrive on crafting efficient, maintainable code and seamless UX
            to solve real‑world problems.
          </p>

          {/* Resume Button */}
          <a
            href="https://drive.google.com/file/d/163wQ9ER_Mn_KHe7h25AE9cFHwrJEg1cH/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white py-3 px-8 rounded-full mt-5 text-lg font-bold transition duration-300 transform hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #1349bd, #4a6ed5)",
              boxShadow:
                "0 0 2px #1349bd, 0 0 8px #1349bd, 0 0 20px rgba(19, 73, 189, 0.5)",
            }}
          >
            Download CV
          </a>
        </div>

        {/* Right: Image with Tilt */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0 md:ml-8">
          <Tilt
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            glareEnable={true}
            glareMaxOpacity={0.2}
            className="w-64 h-64 md:w-full md:h-full"
          >
            <img
              src={profileImage}
              alt="Tushar Sharma"
              className="
                w-full h-full rounded-full object-cover
                ring-4 ring-[#1349bd]
                drop-shadow-[0_10px_20px_rgba(19,73,189,0.5)]
              "
            />
          </Tilt>
        </div>
      </div>
    </section>
  );
};

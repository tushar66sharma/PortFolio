import React, { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiLeetcode, SiCodechef, SiCodeforces } from "react-icons/si";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuItemClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsOpen(false);
  };

  const menuItems = [
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "eduaction", label: "Education" },
  ];
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition duration-300 px-[7vw] md:px-[7vw] lg:px-[20vw] ${
        isScrolled
          ? "bg-[#050414] bg-opacity-50 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="text-white py-5 flex justify-between items-center">
        <div className="text-lg font-semibold cursor-pointer mx-4">
          <span className="text-[#1349bd]">&lt;</span>
          <span className="text-white">Tushar</span>
          <span className="text-[#1349bd]">/</span>
          <span className="text-white">Sharma</span>
          <span className="text-[#1349bd]">&gt;</span>
        </div>

        <ul className="hidden md:flex space-x-8 text-gray-300 mx-4">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`cursor-pointer hover:text-[#1349bd] ${
                activeSection === item.id ? "text-[#1349bd]" : ""
              }`}
            >
              <button onClick={() => handleMenuItemClick(item.id)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex space-x-8 mx-4">
          <a
            href="https://github.com/tushar66sharma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#1349bd]"
          >
            <FaGithub size={24} />
          </a>

          <a
            href="https://www.linkedin.com/in/tushar-sharma-599992256/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#1349bd]"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://leetcode.com/u/DynamicCoder_66/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#1349bd]"
          >
            <SiLeetcode size={24} />
          </a>
          <a
            href="https://www.codechef.com/users/dynamiccoder66"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#1349bd]"
          >
            <SiCodechef size={24} />
          </a>
          <a
            href="https://codeforces.com/profile/DynamicCoder_66"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#1349bd]"
          >
            <SiCodeforces size={24} />
          </a>
        </div>

        <div className="md:hidden">
          {isOpen ? (
            <FiX
              className="text-3xl text-[#1349bd] cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          ) : (
            <FiMenu
              className="text-3xl text-[#1349bd] cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-4/5 bg-[#050414]/70 bg-opacity-100 backdrop-blur-lg z-50 rounded-lg shadow-lg transform">
          <ul className="flex flex-col items-center space-y-4 py-4 text-gray-300">
            {menuItems.map((item) => (
              <li
                key={item.id}
                className={`cursor-pointer hover:text-white ${
                  activeSection === item.id ? "text-[#1349bd]" : ""
                }`}
              >
                <button onClick={() => handleMenuItemClick(item.id)}>
                  {item.label}
                </button>
              </li>
            ))}

            <div className="flex space-x-4">
              <a
                href="https://github.com/tushar66sharma"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white"
              >
                <FaGithub size={24} />
              </a>

              <a
                href="https://www.linkedin.com/in/tushar-sharma-599992256/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#1349bd]"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://leetcode.com/u/DynamicCoder_66/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#1349bd]"
              >
                <SiLeetcode size={24} />
              </a>
              <a
                href="https://www.codechef.com/users/dynamiccoder66"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#1349bd]"
              >
                <SiCodechef size={24} />
              </a>
              <a
                href="https://codeforces.com/profile/DynamicCoder_66"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#1349bd]"
              >
                <SiCodeforces size={24} />
              </a>
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
};

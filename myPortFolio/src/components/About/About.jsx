import { useState, useEffect } from 'react';

export const About = () => {
  const words = [
    'Full-Stack Developer',
    'App Developer',
    'Competitive Programmer',
    'Open-Source Contributor',
  ];

  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const delta = isDeleting ? 50 : 150;
    const timeout = setTimeout(() => {
      setText(prev =>
        isDeleting
          ? current.substring(0, prev.length - 1)
          : current.substring(0, prev.length + 1)
      );

      if (!isDeleting && text === current) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex(i => i + 1);
      }
    }, delta);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <section
      id="about"
      className="py-4 px-[7vw] md:px-[7vw] lg:px-[20vw] font-sans mt-16 md:mt-24 lg:mt-32"
    >
      <div className="flex flex-col-reverse md:flex-row justify-between items-center">
        <div className="md:w-1/2 text-center md:text-left mt-8 md:mt-0">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 leading-tight">
            Hi, I am
          </h1>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
            Tushar Sharma
          </h2>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-[#1349bd] leading-tight">
            <span className="text-white">I am a&nbsp;</span>
            <span className="inline font-semibold text-2xl sm:text-3xl md:text-4xl">
              {text}
              <span className="animate-pulse inline">|</span>
            </span>
          </h3>
        </div>
      </div>
    </section>
  );
};

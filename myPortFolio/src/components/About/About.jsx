import ReactTypingEffect from 'react-typing-effect'

export const About = () => {
  return (
    <section
      id='about'
      className='py-4 px-[7vw] md:px-[7vw] lg:px-[20vw] font-sans mt-16 md:mt-24 lg:mt-32'
    >
      <div className='flex flex-col-reverse md:flex-row justify-between items-center'> 
        <div className='md:w-1/2 text-center md:text-left mt-8 md:mt-0'>
        <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 leading-tight'>
          Hi, I am
        </h1>
        <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight'>
          Tushar Sharma
        </h2>
        <h3 className='text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-[#1349bd] leading-tight'>
          <span className='text-white'>
            I am a&nbsp;
          </span>
          


        </h3>
        </div>

      </div>


    </section>
  )
}

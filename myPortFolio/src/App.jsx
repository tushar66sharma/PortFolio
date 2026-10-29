import { About } from "./components/About/About";
import { Navbar } from "./components/Navbar/Navbar";
import { References } from "./components/References/References";
import { Skills } from "./components/Skills/Skills";
import { Experience } from "./components/Experience/Experience";
import { Work } from "./components/Work/Work";
import { Education } from "./components/Education/Education";
import { Contact } from "./components/Contact/Contact";
import { Footer } from "./components/Footer/Footer";
import "./index.css";

const ZONES = ["A", "B", "C", "D", "E", "F"];

function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1160px] pb-10 pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] pt-20">
        {/* The whole page is one drawing sheet */}
        <div className="bp-sheet">
          <div className="grid grid-cols-6 border-b border-line text-center text-[11px] text-muted" aria-hidden="true">
            {ZONES.map((z, i) => (
              <span key={z} data-zone={z} className={i ? "border-l border-line" : ""}>
                {z}
              </span>
            ))}
          </div>
          <References />
          <About />
          <Skills />
          <Experience />
          <Work />
          <Education />
          <Contact />
          <Footer />
        </div>
      </main>
    </>
  );
}

export default App;

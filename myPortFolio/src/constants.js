import htmlLogo from './assets/tech_logo/html.png';
import cssLogo from './assets/tech_logo/css.png';
import sassLogo from './assets/tech_logo/sass.png';
import javascriptLogo from './assets/tech_logo/javascript.png';
import reactjsLogo from './assets/tech_logo/reactjs.png';
import angularLogo from './assets/tech_logo/angular.png';
import reduxLogo from './assets/tech_logo/redux.png';
import nextjsLogo from './assets/tech_logo/nextjs.png';
import tailwindcssLogo from './assets/tech_logo/tailwindcss.png';
import gsapLogo from './assets/tech_logo/gsap.png';
import materialuiLogo from './assets/tech_logo/materialui.png';
import bootstrapLogo from './assets/tech_logo/bootstrap.png';
import springbootLogo from './assets/tech_logo/springboot.png';
import nodejsLogo from './assets/tech_logo/nodejs.png';
import expressjsLogo from './assets/tech_logo/express.png';
import mysqlLogo from './assets/tech_logo/mysql.png';
import mongodbLogo from './assets/tech_logo/mongodb.png';
import firebaseLogo from './assets/tech_logo/firebase.png';
import cLogo from './assets/tech_logo/c.png';
import cppLogo from './assets/tech_logo/cpp.png';
import javaLogo from './assets/tech_logo/java.png';
import pythonLogo from './assets/tech_logo/python.png';
import typescriptLogo from './assets/tech_logo/typescript.png';
import gitLogo from './assets/tech_logo/git.png';
import githubLogo from './assets/tech_logo/github.png';
import vscodeLogo from './assets/tech_logo/vscode.png';
import postmanLogo from './assets/tech_logo/postman.png';
import mcLogo from './assets/tech_logo/mc.png';
import figmaLogo from './assets/tech_logo/figma.png';
import netlifyLogo from './assets/tech_logo/netlify.png';
import vercelLogo from './assets/tech_logo/vercel.png';
import postgreLogo from './assets/tech_logo/postgre.png';
import csharpLogo from './assets/tech_logo/csharp.png';

// Experience Section Logo's
import iiitdmjlogo from './assets/company_logo/iiitdmj_logo.png';

// Education Section Logo's
import iiitdmj1logo from './assets/education_logo/iiitdmj_logo.png';
import mhalogo from './assets/education_logo/mha_logo.jpeg';

// Project Section Logo's
import footballanalysislogo from './assets/work_logo/Football_analysis.png';
import fusionlogo from './assets/work_logo/fusion_logo.png';
import jobfinderlogo from './assets/work_logo/JobFinder.png';
import pathfinderlogo from './assets/work_logo/pathfinder_logo.png';
import rentconnectlogo from './assets/work_logo/RentConnect.png';

export const SkillsInfo = [
  {
    title: 'Frontend',
    skills: [
      { name: 'HTML', logo: htmlLogo },
      { name: 'CSS', logo: cssLogo },
      { name: 'SASS', logo: sassLogo },
      { name: 'JavaScript', logo: javascriptLogo },
      { name: 'React JS', logo: reactjsLogo },
      { name: 'Angular', logo: angularLogo },
      { name: 'Redux', logo: reduxLogo },
      { name: 'Next JS', logo: nextjsLogo },
      { name: 'Tailwind CSS', logo: tailwindcssLogo },
      { name: 'GSAP', logo: gsapLogo },
      { name: 'Material UI', logo: materialuiLogo },
      { name: 'Bootstrap', logo: bootstrapLogo },
    ],
  },
  {
    title: 'Backend',
    skills: [
      { name: 'Springboot', logo: springbootLogo },
      { name: 'Node JS', logo: nodejsLogo },
      { name: 'Express JS', logo: expressjsLogo },
      { name: 'MySQL', logo: mysqlLogo },
      { name: 'MongoDB', logo: mongodbLogo },
      { name: 'Firebase', logo: firebaseLogo },
      { name: 'PostgreSQL', logo: postgreLogo },
    ],
  },
  {
    title: 'Languages',
    skills: [
      { name: 'C', logo: cLogo },
      { name: 'C++', logo: cppLogo },
      { name: 'Java', logo: javaLogo },
      { name: 'Python', logo: pythonLogo },
      { name: 'C-Sharp', logo: csharpLogo },
      { name: 'JavaScript', logo: javascriptLogo },
      { name: 'TypeScript', logo: typescriptLogo },
    ],
  },
  {
    title: 'Tools',
    skills: [
      { name: 'Git', logo: gitLogo },
      { name: 'GitHub', logo: githubLogo },
      { name: 'VS Code', logo: vscodeLogo },
      { name: 'Postman', logo: postmanLogo },
      { name: 'Compass', logo: mcLogo },
      { name: 'Vercel', logo: vercelLogo },
      { name: 'Netlify', logo: netlifyLogo },
      { name: 'Figma', logo: figmaLogo },
    ],
  },
];

  export const experiences = [
    {
      id: 0,
      img: iiitdmjlogo,
      role: "Fullstack Developer",
      company: "IITDM Jabalpur",
      date: "August 2024 - April 2025",
      desc: "Developed dynamic and scalable web applications for hostel management module using the React Js, Python, Django and PostgreSQL, handling both frontend and backend development. Collaborated with cross-functional teams to build responsive UI, implement RESTful APIs, and optimize application performance in an agile environment.",
      skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "React JS",
        "TypeScript",
        "Python",
        "Tailwind CSS",
        "PostgresSQL",
        "Redux",
        "Django",
      ],
    },
  ];
  
  export const education = [
    {
      id: 0,
      img: iiitdmj1logo,
      school: "IIITDM Jabalpur, Jabalpur",
      date: "August 2022 - Present",
      grade: "8.4 CPI",
      desc: "I completed my Bachelor's degree in Computer Science and Engineering (B.Tech.) from Indian Institute of Information Technology Design and Manufacturing Jabalpur. Throughout my studies, I was immersed in a variety of subjects that deepened my understanding of computing and technology. From exploring Data Structures and Algorithms to diving into Web Development and Database Management Systems, I gained practical insights into the world of software development. My time at IITDMJ allowed me to work on projects that applied theoretical concepts to real-world problems.",
      degree: "Master of Computer Applications - MCA",
    },
    {
      id: 1,
      img: mhalogo,
      school: "Mount Hill Academy, Mathura",
      date: "Apr 2020 - March 2021",
      grade: "95%",
      desc: "I completed my class 12 education from Mount Hill Academy, Mathura, under the CBSE board, where I studied Physics, Chemistry, and Mathematics (PCM) with Computer Science.",
      degree: "CBSE(XII) - PCM with Computer Science",
    },
    {
      id: 2,
      img: mhalogo,
      school: "Mount Hill Academy, Mathura",
      date: "Apr 2018 - March 2019",
      grade: "95.33%",
      desc: "I completed my class 10 education from Mount Hill Academy, Mathura, under the CBSE board, where I studied Science with Computer Science.",
      degree: "CBSE(X), Science with Computer Application",
    },
  ];
  
  export const projects = [
    {
      id: 0,
      title: "Path Finding Visualizer",
      description:
        "The Pathfinding Visualizer is an interactive web application that demonstrates how popular pathfinding algorithms like BFS, DFS, Dijkstra, and A* work through step-by-step animations. Built using React.js, Vite, and TypeScript, the project emphasizes performance, modular design, and clean architecture. It offers an engaging way to understand algorithm behavior visually, making it a valuable tool for learning and teaching pathfinding concepts.",
      image: pathfinderlogo,
      tags: [ "JavaScript","TypeScript", "TailwindCSS", "React JS", "Vite"],
      github: "https://github.com/tushar66sharma/PathFinder_Visualizer",
      webapp: "https://path-finder-visualizer-tushar66sharmas-projects.vercel.app/",
    },
    {
      id: 1,
      title: "Job Finder Mobile App",
      description:
        "The Job Finder Mobile App is a cross-platform application designed to simplify the job-hunting experience. It features real-time job listings, a personalized homepage, and optimized performance tailored for mobile devices. Built using React Native and powered by Rapid APIs, the app delivers fast and responsive user experiences with a clean, intuitive UI. full-stack quiz-based platform designed for GATE/UGC NET students to practice previous year questions and create customized tests. The platform offers comprehensive profile stats and detailed results, helping students track and improve their preparation journey effectively.",
      image: jobfinderlogo,
      tags: ["React Native","React Native Expo", "Node.js", "Express","Axios", "Rapid APIs", "JavaScript","TypeScript"],
      github: "https://github.com/tushar66sharma/Job-Posting-Mobile-App",
      webapp: "https://drive.google.com/drive/u/1/folders/1IK77R0Aof5h4bIlnuVdhdG-o6IS-gfYQ",
    },
    {
      id: 2,
      title: "FootBall Analysis System",
      description:
        "The Football Analysis System is an intelligent video analytics tool designed to extract real-time insights from football match footage. Leveraging YOLO and OpenCV, it identifies players, referees, and the ball, enabling performance metrics like player speed and distance covered—making it a valuable tool for sports analysis and coaching.",
      image: footballanalysislogo,
      tags: ["React JS", "API", "HTML", "CSS", "JavaScript","OpenCV","Python","Yolo"],
      github: "https://github.com/tushar66sharma/Football_analysis_system",
      webapp: "https://drive.google.com/drive/folders/1OMyOBnFBUL93rHz5LOG9UtARw98rwC4S",
    },
    {
      id: 3,
      title: " Rent Connect ",
      description:
        "This mobile and web platform enables students to share and rent food, books, and supplies with ease. Designed for campus communities, it focuses on user-friendly design and real-time data handling to promote sustainability and resource sharing among students.",
      image: rentconnectlogo,
      tags: ["React Native", "Node.js","Express.js","TypeScript","JavaScript"," MongoDB","RestAPIs",],
      github: "https://github.com/tushar66sharma/RentConnect",
      webapp: "https://www.npmjs.com/package/cmtk-email-validator",
    },
    {
      id: 4,
      title: "Fuison (Institute ERP Portal)",
      description:
        "The Hostel Management System automates room allocation and fee management for institutional hostels, replacing manual workflows with a streamlined web-based solution. It enhances administrative efficiency, improves data handling, and ensures accuracy in operations.",
      image: fusionlogo,
      tags: ["JavaScript","React.js","Python","Django","PostgresSQL"],
      github: "https://github.com/tushar66sharma/FusionBackendWork_Myrepo",
      webapp: "http://fusion.iiitdmj.ac.in:8000/dashboard",
    },
  ];  
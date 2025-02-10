import { useState } from "react";
import Navbar from "./components/NavBar";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Resume from "./components/Resume";
import Contact from "./components/Contact";

function App() {
  const [activeComponent, setActiveComponent] = useState("home");

  const renderComponent = () => {
    switch (activeComponent) {
      case "projects":
        return <Projects />;
      case "resume":
        return <Resume />;
      case "contact":
        return <Contact />;
      default:
        return <Home />;
    }
  };

  return (
    <div>
      <Navbar setActiveComponent={setActiveComponent} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeComponent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            padding: "20px",
            borderRadius: "15px",
            background: "#fff",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            margin: "20px",
          }}
        >
          {renderComponent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;

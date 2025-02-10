import { useEffect, useState } from "react";
import axios from "axios";
import Projects from "./components/Projects";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5001")
      .then((response) => setMessage(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>Welcome to My Portfolio</h1>
      <p>Backend says: {message}</p>
      <Projects />
    </div>
  );
}

export default App;

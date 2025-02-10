import { useEffect, useState } from "react";
import axios from "axios";

function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/projects")
      .then(response => setProjects(response.data))
      .catch(error => console.error("Error fetching projects:", error));
  }, []);

  return (
    <div>
      <h2>My Projects</h2>
      <ul>
        {projects.map(project => (
          <li key={project._id}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <a href={project.githubLink}>GitHub</a> | <a href={project.demoLink}>Live Demo</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Projects;

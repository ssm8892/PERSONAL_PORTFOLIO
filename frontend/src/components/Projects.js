import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";

function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/projects`)
      .then(response => setProjects(response.data))
      .catch(error => console.error("Error fetching projects:", error));
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My Projects
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project._id}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Card sx={{ borderRadius: "15px", boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {project.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {project.description}
                  </Typography>
                  <Typography>
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a> | 
                    <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Projects;

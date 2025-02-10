import { Typography, Button, Box } from "@mui/material";
import { motion } from "framer-motion";

function Resume() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom>
        Resume
      </Typography>
      <Box textAlign="center" mt={3}>
        <Button variant="contained" color="primary" sx={{ borderRadius: "20px" }} href="/resume.pdf" download>
          Download Resume
        </Button>
      </Box>
    </motion.div>
  );
}

export default Resume;

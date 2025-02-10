import { Typography, TextField, Button, Box } from "@mui/material";
import { motion } from "framer-motion";

function Contact() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography variant="h4" gutterBottom>
        Contact Me
      </Typography>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Your Name" variant="outlined" fullWidth />
        <TextField label="Your Email" variant="outlined" fullWidth />
        <TextField label="Message" variant="outlined" multiline rows={4} fullWidth />
        <Button variant="contained" color="primary" sx={{ borderRadius: "20px" }}>
          Send Message
        </Button>
      </Box>
    </motion.div>
  );
}

export default Contact;

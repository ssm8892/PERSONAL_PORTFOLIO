import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Box, Typography } from "@mui/material";

function Resume() {
  const pdfUrl = "/Sai_M_Resume.pdf"; // Replace with your S3 URL
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Typography variant="h4" gutterBottom>
        My Resume
      </Typography>
      <Box sx={{ height: "80vh", width: "80%", border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden" }}>
      <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}>
          <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>
      </Box>
    </Box>
  );
}

export default Resume;

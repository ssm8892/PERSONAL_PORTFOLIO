import { AppBar, Tabs, Tab, Toolbar } from "@mui/material";
import { useState } from "react";

function Navbar({ setActiveComponent }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const sections = ["home", "projects", "resume", "contact"];
    setActiveComponent(sections[newValue]);
  };

  return (
    <AppBar position="static" sx={{ borderRadius: "20px", margin: "10px", bgcolor: "#1976d2" }}>
      <Toolbar>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          centered
          sx={{ width: "100%" }}
        >
          <Tab label="Home" />
          <Tab label="Projects" />
          <Tab label="Resume" />
          <Tab label="Contact" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

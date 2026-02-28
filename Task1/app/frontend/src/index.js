import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    axios
      .get("/api/message")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch(() => {
        setMessage("Error connecting to backend");
      });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>EKS Microservices Demo</h1>
      <h2>{message}</h2>
    </div>
  );
}

export default App;
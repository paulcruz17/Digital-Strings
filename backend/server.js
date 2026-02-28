const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PASSWORD = "1234";

app.use(cors());
app.use(express.json());

// 👉 ESTA LÍNEA ES CLAVE
app.use(express.static(path.join(__dirname, "public")));

// LOGIN
app.post("/login", (req, res) => {
  const { password } = req.body;

  if (password === PASSWORD) {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

// SERVIDOR
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

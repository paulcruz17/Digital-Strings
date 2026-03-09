const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression"); // 👉 compresión para acelerar la web

const app = express();

const PASSWORD = "1234";

app.use(cors());
app.use(express.json());

// 👉 activa compresión de archivos (html, css, js, imágenes)
app.use(compression());

// 👉 sirve archivos estáticos con cache del navegador
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "30d"
}));

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
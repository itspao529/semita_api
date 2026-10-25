const express = require("express");
const cors = require("cors");

const app = express();
console.log("API_KEY longitud:", (process.env.API_KEY || "").length);
app.use(cors());
app.use(express.json());

let estado = {
  modo: "manual",
  distancia: 0,
  motor: "detenido",
  ultimaLectura: null
};

function calcularMotorAuto(d) {
  if (d >= 10 && d <= 25) return "derecha";
  if (d >= 26 && d <= 40) return "izquierda";
  return "detenido";
}

function exigirClave(req, res, next) {
  const clave = (process.env.API_KEY || "").trim();
  if (clave && req.get("X-API-Key") !== clave) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}

app.get("/", (req, res) => {
  res.json({ mensaje: "API Semita funcionando" });
});

app.get("/api/estado", (req, res) => {
  res.json(estado);
});

app.post("/api/modo", (req, res) => {
  const { modo } = req.body;
  if (modo !== "manual" && modo !== "automatico") {
    return res.status(400).json({ error: "Modo inválido" });
  }
  estado.modo = modo;
  if (modo === "automatico") {
    estado.motor = calcularMotorAuto(estado.distancia);
  } else {
    estado.motor = "detenido";
  }
  res.json(estado);
});

app.post("/api/motor", (req, res) => {
  if (estado.modo !== "manual") {
    return res.status(409).json({ error: "Cambia a modo manual primero" });
  }
  const { accion } = req.body;
  if (accion === "izquierda") estado.motor = "izquierda";
  else if (accion === "derecha") estado.motor = "derecha";
  else if (accion === "detener") estado.motor = "detenido";
  else return res.status(400).json({ error: "Acción inválida" });
  res.json(estado);
});

app.post("/api/distancia", exigirClave, (req, res) => {
  if (req.body.distancia === undefined) {
    return res.status(400).json({ error: "Distancia inválida" });
  }
  const d = Math.round(Number(req.body.distancia));
  if (Number.isNaN(d)) {
    return res.status(400).json({ error: "Distancia inválida" });
  }
  estado.distancia = d;
  estado.ultimaLectura = new Date().toISOString();
  if (estado.modo === "automatico") {
    estado.motor = calcularMotorAuto(d);
  }
  res.json({ ok: true, motor: estado.motor });
});

app.get("/api/comando", (req, res) => {
  res.json({ modo: estado.modo, motor: estado.motor });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});

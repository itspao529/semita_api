const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Estado del sistema (en memoria) ----------
let estado = {
  modo: "manual",          // "manual" | "automatico"
  distancia: 0,            // cm, la reporta el ESP32
  motor: "detenido",       // "izquierda" | "derecha" | "detenido"
  ultimaLectura: null      // fecha de la última lectura recibida
};

// Lógica automática según la distancia
function calcularMotorAuto(d) {
  if (d >= 10 && d <= 25) return "derecha";
  if (d >= 26 && d <= 40) return "izquierda";
  return "detenido";
}

// ---------- Endpoints ----------

// Raíz: para comprobar que la API está viva
app.get("/", (req, res) => {
  res.json({ mensaje: "API Semita funcionando" });
});

// La web consulta el estado completo
app.get("/api/estado", (req, res) => {
  res.json(estado);
});

// Cambiar modo: { "modo": "manual" } o { "modo": "automatico" }
app.post("/api/modo", (req, res) => {
  const { modo } = req.body;
  if (modo !== "manual" && modo !== "automatico") {
    return res.status(400).json({ error: "Modo inválido" });
  }
  estado.modo = modo;
  if (modo === "automatico") {
    estado.motor = calcularMotorAuto(estado.distancia);
  } else {
    estado.motor = "detenido"; // al pasar a manual, el motor arranca detenido
  }
  res.json(estado);
});

// Comando manual: { "accion": "izquierda" | "derecha" | "detener" }
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

// El ESP32 reporta la distancia: { "distancia": 23.5 }
app.post("/api/distancia", (req, res) => {
  const d = Number(req.body.distancia);
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

// El ESP32 consulta qué debe hacer el motor
app.get("/api/comando", (req, res) => {
  res.json({ modo: estado.modo, motor: estado.motor });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
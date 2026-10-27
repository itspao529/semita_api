# Semita API

API REST (Node.js + Express) del proyecto EAI441 "Control de giro con sensor".

URL: https://semita-api-pjk7.onrender.com

| Método | Ruta | Uso |
|---|---|---|
| GET | /api/estado | Modo, distancia y motor (lo consulta la web) |
| POST | /api/modo | {"modo":"manual" o "automatico"} |
| POST | /api/motor | {"accion":"izquierda", "derecha" o "detener"} (solo en manual) |
| POST | /api/distancia | {"distancia":N} lo envía el ESP32, requiere header X-API-Key |
| GET | /api/comando | Modo y motor actual |

Modo automático: 10-25 cm derecha, 26-40 cm izquierda, fuera de rango detenido.

Despliegue: Render (Node). Start command: npm start. Variable de entorno: API_KEY.

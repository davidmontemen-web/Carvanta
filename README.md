# Carvanta CRM

Sistema CRM con frontend en React + Vite y backend en Node.js + Express + MySQL.

---

## Estructura del proyecto

```bash
carvanta/
├─ frontend/              # React + Vite
├─ backend/               # Express + MySQL
├─ database/
│  └─ schema.sql          # Esquema base de la BD
└─ README.md

Requisitos
Node.js 20+

npm 10+

MySQL 8+

1) Configurar base de datos
Ejecuta:

SOURCE database/schema.sql;
o importa el archivo con tu cliente MySQL.

2) Variables de entorno
Backend (backend/.env)
Crea el archivo backend/.env con este contenido:

PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=carvanta_db
JWT_SECRET=super_secret_key
BASE_URL=http://localhost:4000
Frontend (frontend/.env)
Crea el archivo frontend/.env con este contenido:

VITE_API_BASE_URL=http://localhost:4000
3) Instalar dependencias
Frontend
cd frontend
npm install
Backend
cd backend
npm install
4) Ejecutar en desarrollo
Backend
cd backend
npm run dev
Frontend
cd frontend
npm run dev
Scripts disponibles
Frontend
npm run dev
npm run lint
npm run build
npm run preview
Backend
npm run dev
npm run start
npm run check
Endpoints base
GET / → Estado base del backend

GET /api/health → Health check con DB

POST /api/auth/login → Login

GET /api/usuarios → Listado usuarios (requiere token)

POST /api/usuarios → Crear usuario (requiere token admin)

Notas de almacenamiento de archivos
Las imágenes de avalúo se guardan en:

backend/uploads/appraisals

Esa carpeta está excluida de Git (.gitignore) para no versionar binarios de runtime.

Flujo recomendado de calidad
Antes de hacer commit:

cd frontend && npm run lint && npm run build
cd ../backend && npm run check
Troubleshooting
npm run build falla por JSX en archivo .js
Renombra ese archivo a .jsx o elimina JSX dentro del .js.

Error 401/403 en frontend
Verifica token en localStorage y JWT_SECRET en backend.

Error de conexión a MySQL
Revisa DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME y que MySQL esté encendido.


---

## 2) Crear archivo nuevo `backend/.env.example`

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=carvanta_db
JWT_SECRET=change_me
BASE_URL=http://localhost:4000
3) Crear archivo nuevo frontend/.env.example
VITE_API_BASE_URL=http://localhost:4000
4) Validación final
cd frontend && npm run lint && npm run build
cd ../backend && npm run check

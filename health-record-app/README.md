# Mi Expediente — App móvil de registro médico (modelo EDUS) con JWT

Proyecto educativo con **React Native (Expo + TypeScript)**, **Node.js + TypeScript**, **PostgreSQL** y autenticación con **JSON Web Tokens**.
Está basado en el modelo del EDUS (Expediente Digital Único en Salud), pero es una demostración: **no está afiliado a la CCSS** y todos los datos son de personas ficticias.

- Código en inglés, comentarios y documentación en español.
- Frontend y backend totalmente separados, ambos con Clean Architecture.
- El backend no contiene datos fijos: todo se consulta en PostgreSQL. Los datos de ejemplo están solo en `database/init.sql`.

---

## 1. Estructura del repositorio

```text
health-record-app/
├── docker-compose.yml            # Orquesta PostgreSQL (db) + API (api)
├── .env.example                  # Variables de entorno (copiar a .env)
├── database/
│   └── init.sql                  # DDL + datos de prueba (hashes bcrypt)
├── backend/                      # API REST — Node.js + Express 5 + TypeScript
│   ├── Dockerfile
│   ├── package.json / tsconfig.json
│   └── src/
│       ├── domain/               # Núcleo: no depende de ningún framework
│       │   ├── entities/         # User, Patient, Appointment, Prescription, MedicalHistory (+ reglas de negocio)
│       │   ├── repositories/     # Interfaces (puertos) de acceso a datos
│       │   ├── services/         # Interfaces PasswordHasher y TokenProvider
│       │   ├── errors/           # Errores de dominio (Validation, Unauthorized, NotFound...)
│       │   └── validation/       # Validaciones: correo, cédula, contraseña, fechas
│       ├── use-cases/            # AuthenticateUser, RegisterPatient, GetCurrentUser, GetPatientProfile,
│       │                         # GetHomeSummary, GetAppointments, GetActivePrescriptions, GetMedicalHistory
│       ├── infrastructure/
│       │   ├── config/env.ts     # Lee y valida DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT
│       │   ├── database/         # Pool de conexiones `pg`
│       │   ├── security/         # JwtService (jsonwebtoken) y HashService (bcrypt)
│       │   ├── repositories/     # Repositorios concretos con SQL parametrizado
│       │   └── container.ts      # Inyección de dependencias (raíz de composición)
│       ├── presentation/
│       │   ├── middlewares/      # authMiddleware (Bearer JWT) y errorHandler
│       │   ├── controllers/      # Auth, Patient, Appointment, Prescription, MedicalHistory, Health
│       │   ├── routes/           # Rutas REST bajo /api
│       │   └── app.ts            # Aplicación Express
│       └── server.ts             # Punto de entrada
└── mobile/                       # App React Native (Expo SDK 57)
    ├── App.tsx                   # Proveedores globales + navegación
    ├── .env.example              # EXPO_PUBLIC_API_URL
    └── src/
        ├── config/env.ts         # URL de la API
        ├── domain/
        │   ├── models/           # UserToken, PatientProfile, Appointment, Prescription, MedicalHistory...
        │   └── repositories/     # Interfaces que implementa la capa de datos
        ├── data/
        │   ├── api/              # Cliente Axios con interceptores JWT + normalización de errores
        │   ├── storage/          # Token en Expo SecureStore (Keystore / Keychain)
        │   └── services/         # AuthService, PatientService, AppointmentService...
        └── presentation/
            ├── context/          # AuthContext / AuthProvider (login, registro, logout, sesión persistente)
            ├── navigation/       # RootNavigator: AuthStack (Login, Registro) vs AppStack (pestañas + Perfil)
            ├── screens/          # Login, Register, Home, Profile, Appointments, Prescriptions, MedicalHistory
            ├── components/       # Tarjetas reutilizables, botones, campos, estados de carga/error/vacío
            ├── hooks/            # useApiResource (carga, error, deslizar para actualizar)
            └── theme/ · utils/   # Colores, formatos de fecha y etiquetas en español
```

---

## 2. Cómo funciona la autenticación JWT

```text
App (Login)  ──POST /api/auth/login {identifier, password}──►  AuthController → AuthenticateUser
                                                                 ├─ busca el usuario por correo o cédula (PostgreSQL)
                                                                 ├─ bcrypt.compare(password, password_hash)
                                                                 └─ JwtService.sign({ sub, patientId, role })  (firmado con JWT_SECRET)
App  ◄──────────────── { token, tokenType: "Bearer", expiresIn, user } ──────────────────┘
 │  guarda el token en SecureStore
 │
 └─ GET /api/appointments  con  Authorization: Bearer <token>   (lo agrega el interceptor de Axios)
                                   └─► authMiddleware verifica firma, algoritmo (HS256), emisor y expiración
                                        └─► el controlador usa el patientId DEL TOKEN: cada paciente solo ve su expediente
```

- **Contraseñas:** solo se guarda el hash bcrypt (costo 10, salt único por usuario).
- **Token expirado o alterado:** la API responde 401, el interceptor lo detecta y el `AuthContext` cierra la sesión.
- **Sin enumeración de cuentas:** el login responde siempre "Credenciales inválidas" y ejecuta bcrypt aunque el usuario no exista.
- **Registro seguro:** el expediente ya existe (lo crea el centro de salud). El paciente crea su cuenta demostrando su cédula **y** su fecha de nacimiento.

---

## 3. Guía de ejecución

### Requisitos
- **Docker Desktop** (incluye Docker Compose).
- **Node.js 20 o superior** (para la app móvil).
- Para probar la app, una de estas opciones:
  - un **emulador de Android** (Android Studio › Device Manager), o
  - un teléfono con **Expo Go** (Play Store / App Store) en la **misma red Wi-Fi** que la computadora. Expo Go debe ser compatible con el **SDK 57**.

### Paso 1 — Variables de entorno
```bash
cd health-record-app
cp .env.example .env          # Windows (PowerShell): copy .env.example .env
```
Cambia `JWT_SECRET` por un valor aleatorio largo (mínimo 32 caracteres):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Paso 2 — Levantar base de datos y API
```bash
docker compose up --build      # (o docker-compose up --build con la versión clásica)
```
La primera vez, PostgreSQL ejecuta `database/init.sql` y crea las tablas con los datos de prueba.
Verifica que todo esté arriba en <http://localhost:3000/api/health>: debe responder `{"status":"ok","database":"up"}`.

### Paso 3 — Ejecutar la app móvil
```bash
cd mobile
npm install
cp .env.example .env           # Windows: copy .env.example .env
```
Edita `mobile/.env` según dónde vas a probar:

| Dónde corre la app | `EXPO_PUBLIC_API_URL` |
|---|---|
| Emulador de Android | `http://10.0.2.2:3000/api` |
| Teléfono con Expo Go | `http://<IP de tu computadora>:3000/api` (ej. `http://192.168.1.50:3000/api`; en Windows la ves con `ipconfig`) |
| Simulador de iOS / navegador | `http://localhost:3000/api` |

```bash
npx expo start
```
- Presiona **`a`** para abrir el emulador de Android, o
- escanea el código QR con **Expo Go**.

> Si cambias `mobile/.env`, reinicia con `npx expo start --clear`.

### Paso 4 — Credenciales de prueba

| Paciente | Correo | Cédula | Contraseña |
|---|---|---|---|
| María Fernanda Solano Rojas | `maria.solano@example.com` | `1-1234-0567` | `Paciente123!` |
| José Pablo Vargas Mora | `jose.vargas@example.com` | `4-0215-0893` | `Paciente123!` |

**Probar el registro:** en "Regístrate" usa la cédula `2-0456-0789` y la fecha de nacimiento `1978-07-21` (Ana Lucía Castro Jiménez, que tiene expediente pero aún no tiene cuenta). Elige cualquier correo y una contraseña con mayúscula, minúscula y número.

### Reiniciar la base de datos
`init.sql` solo se ejecuta cuando el volumen está vacío. Para recargar los datos de prueba:
```bash
docker compose down -v
docker compose up --build
```

---

## 4. Endpoints de la API

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| GET | `/api/health` | No | Estado de la API y la base de datos |
| POST | `/api/auth/login` | No | `{ identifier, password }` → token JWT |
| POST | `/api/auth/register` | No | `{ nationalId, birthDate, email, password }` → token JWT |
| GET | `/api/auth/me` | Sí | Usuario dueño del token |
| GET | `/api/patients/me` | Sí | Perfil: datos personales, tipo de sangre, contactos de emergencia |
| GET | `/api/patients/me/summary` | Sí | Resumen para la pantalla de inicio |
| GET | `/api/appointments` | Sí | `{ upcoming, history }` |
| GET | `/api/prescriptions/active` | Sí | Medicamentos activos con dosis, indicaciones y estado de entrega |
| GET | `/api/medical-history` | Sí | `{ diagnoses, allergies, vitalSigns }` |

Prueba rápida con `curl` (en Windows usa Git Bash o Postman):
```bash
# 1. Login → copiar el valor de "token"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"maria.solano@example.com","password":"Paciente123!"}'

# 2. Ruta protegida con el token
curl http://localhost:3000/api/appointments -H "Authorization: Bearer <token>"

# 3. Sin token → 401
curl http://localhost:3000/api/appointments
```

Los errores tienen siempre el mismo formato: `{ "error": { "code": "UNAUTHORIZED", "message": "..." } }`.

---

## 5. Solución de problemas

| Problema | Solución |
|---|---|
| La app dice "No se pudo conectar con el servidor" | Revisa `EXPO_PUBLIC_API_URL`. En el teléfono **no** sirve `localhost`: usa la IP de la computadora. Permite el puerto 3000 en el firewall de Windows. |
| `port is already allocated` al levantar Docker | Otro programa usa el puerto. Cambia `PORT` o `DB_HOST_PORT` en `.env`. |
| La API no inicia: `JWT_SECRET debe tener al menos 32 caracteres` | Define un secreto más largo en `.env`. |
| Cambié `init.sql` y no se reflejan los datos | Ejecuta `docker compose down -v` y vuelve a levantar. |
| Expo Go dice que el proyecto es incompatible | Actualiza Expo Go a la versión compatible con el SDK 57. |

Para conectarte a la base de datos con DBeaver o pgAdmin: host `localhost`, puerto `5433`, con el usuario, la contraseña y la base de datos definidos en `.env`.

# Mi Expediente — App móvil de registro médico (modelo EDUS)

Aplicación educativa de expediente médico con **React Native (Expo)**, **Node.js + TypeScript**, **PostgreSQL** y autenticación con **JWT**.
Todos los datos son de personas ficticias. No está afiliada a la CCSS.

---

## Requisitos

| Herramienta | Uso |
|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Levanta la base de datos y la API |
| [Node.js 20 o superior](https://nodejs.org/) | Ejecuta la app móvil |
| **Expo Go** (Play Store / App Store) o un emulador de Android | Abre la app (Expo Go debe ser compatible con el **SDK 57**) |

> En Windows, Docker Desktop requiere **WSL 2**. El instalador lo configura automáticamente.

---

## 1. Obtener el proyecto

Descomprime el archivo `.zip` y entra a la carpeta del proyecto.

> **Importante:** al usar "Extraer todo", Windows crea una carpeta dentro de otra con el mismo nombre.
> Entra hasta la carpeta que contiene `backend`, `database`, `mobile` y `docker-compose.yml`.

```powershell
cd health-record-app
dir    # Debe mostrar: backend, database, mobile, docker-compose.yml
```

---

## 2. Levantar la base de datos y la API

1. **Abre Docker Desktop** y espera a que indique **"Engine running"**.

2. Crea el archivo de variables de entorno:

```powershell
   copy .env.example .env
```

   (Opcional) Cambia `JWT_SECRET` en `.env` por un valor aleatorio de al menos 32 caracteres:

```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

3. Levanta los contenedores:

```powershell
   docker compose up --build
```

   La primera vez se descargan las imágenes y se ejecuta `database/init.sql`, que crea las tablas y los datos de prueba.
   Cuando aparezca este mensaje, la API está lista:

```
   edus_api  | [api] Servidor escuchando en http://localhost:3000/api
```

4. Verifica en el navegador: <http://localhost:3000/api/health>
   Debe responder `{"status":"ok","database":"up"}`.

> **Deja esta terminal abierta** mientras uses la app.

---

## 3. Ejecutar la app móvil

Abre una **segunda terminal** en la carpeta del proyecto:

```powershell
cd mobile
npm install
copy .env.example .env
```

### Configurar la URL de la API

Edita `mobile/.env` según dónde vas a ejecutar la app:

| Dónde corre la app | Valor de `EXPO_PUBLIC_API_URL` |
|---|---|
| Teléfono con Expo Go | `http://<IP-de-tu-computadora>:3000/api` |
| Emulador de Android | `http://10.0.2.2:3000/api` |
| Navegador web / simulador iOS | `http://localhost:3000/api` |

**Para usar el teléfono (Expo Go):**

1. Obtén la IP de tu computadora con `ipconfig` y copia la **Dirección IPv4** del adaptador Wi-Fi (ej. `192.168.1.50`).
2. Edita el archivo:

```powershell
   notepad .env
```

```
   EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api
```

3. Conecta el teléfono a la **misma red Wi-Fi** que la computadora.
4. Prueba desde el navegador del teléfono: `http://192.168.1.50:3000/api/health`
   Si no carga, permite el puerto en el firewall (PowerShell **como administrador**):

```powershell
   New-NetFirewallRule -DisplayName "API Expediente 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
```

   y verifica que la red Wi-Fi esté configurada como **privada**.

### Iniciar la app

```powershell
npx expo start --clear
```

- **Teléfono:** escanea el código QR con **Expo Go** (Android) o con la cámara (iPhone).
- **Emulador de Android:** abre el emulador desde Android Studio y presiona `a` en la terminal.

> Si Windows pregunta si Node.js puede acceder a la red, permite el acceso en **redes privadas**.

---

## 4. Usuarios de prueba

Contraseña para ambos: **`Paciente123!`**

| Paciente | Correo | Cédula |
|---|---|---|
| María Fernanda Solano Rojas | `maria.solano@example.com` | `1-1234-0567` |
| José Pablo Vargas Mora | `jose.vargas@example.com` | `4-0215-0893` |

Se puede iniciar sesión con el **correo** o con la **cédula** (con o sin guiones).

### Probar el registro

En **"Regístrate"** usa los datos de una paciente que tiene expediente pero aún no tiene cuenta:

| Campo | Valor |
|---|---|
| Cédula | `2-0456-0789` |
| Fecha de nacimiento | `1978-07-21` |
| Correo | Cualquiera (ej. `ana.castro@example.com`) |
| Contraseña | Mínimo 8 caracteres, con mayúscula, minúscula y número (ej. `Segura123`) |

---

## 5. Comandos útiles

| Acción | Comando |
|---|---|
| Detener los contenedores | `Ctrl + C` o `docker compose down` |
| Volver a levantar | `docker compose up` |
| Reiniciar la base de datos con los datos de prueba | `docker compose down -v` y luego `docker compose up --build` |
| Reiniciar Expo limpiando la caché | `npx expo start --clear` |

> `init.sql` solo se ejecuta cuando el volumen de la base de datos está vacío. Por eso, para recargar los datos hay que usar `down -v`.

---

## 6. Solución de problemas

| Error | Causa y solución |
|---|---|
| `No se encuentra la ruta de acceso ... .env.example` o `no configuration file provided` | Estás en la carpeta equivocada. Entra a la carpeta que contiene `docker-compose.yml`. |
| `failed to connect to the docker API ... dockerDesktopLinuxEngine` | Docker Desktop no está abierto. Ábrelo y espera a que diga "Engine running". |
| `port is already allocated` | Otro programa usa el puerto. Cambia `PORT` o `DB_HOST_PORT` en `.env`. |
| La app dice "No se pudo conectar con el servidor" | Revisa la IP en `mobile/.env`, que el teléfono esté en la misma red Wi-Fi y el firewall. Reinicia con `npx expo start --clear`. |
| Expo Go indica que el proyecto es incompatible | Actualiza Expo Go a la versión compatible con el SDK 57. |
| Advertencias de `npm audit` al instalar | Son normales en dependencias de Expo. **No ejecutes `npm audit fix --force`**, porque rompe la compatibilidad del SDK. |

---

## 7. Endpoints de la API

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| GET | `/api/health` | No | Estado de la API y la base de datos |
| POST | `/api/auth/login` | No | Iniciar sesión → token JWT |
| POST | `/api/auth/register` | No | Crear cuenta → token JWT |
| GET | `/api/auth/me` | Sí | Usuario autenticado |
| GET | `/api/patients/me` | Sí | Perfil y contactos de emergencia |
| GET | `/api/patients/me/summary` | Sí | Resumen de la pantalla de inicio |
| GET | `/api/appointments` | Sí | Citas próximas e historial |
| GET | `/api/prescriptions/active` | Sí | Medicamentos activos |
| GET | `/api/medical-history` | Sí | Diagnósticos, alergias y constantes vitales |

Las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`.

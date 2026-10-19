-- =============================================================================
-- init.sql — Base de datos del Expediente Digital (demo educativa basada en el modelo EDUS)
-- Docker lo ejecuta automáticamente la PRIMERA vez que se crea el volumen de PostgreSQL
-- (carpeta /docker-entrypoint-initdb.d/). Para volver a ejecutarlo: docker compose down -v
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. DDL: creación de tablas
--    gen_random_uuid() viene incluido en PostgreSQL 13+ (no requiere extensiones).
-- -----------------------------------------------------------------------------

-- Pacientes: datos personales del expediente
CREATE TABLE patients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR(12)  NOT NULL UNIQUE,              -- Cédula solo con dígitos (ej. 112340567)
    first_name  VARCHAR(80)  NOT NULL,
    last_name   VARCHAR(120) NOT NULL,
    birth_date  DATE         NOT NULL,
    sex         VARCHAR(10)  NOT NULL CHECK (sex IN ('FEMALE', 'MALE')),
    blood_type  VARCHAR(3)   NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone       VARCHAR(20),
    address     TEXT,
    health_area VARCHAR(120),                              -- Área de salud / EBAIS asignado
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT national_id_digits CHECK (national_id ~ '^[0-9]{9,12}$')
);

-- Usuarios: credenciales de acceso (la contraseña SOLO se guarda como hash bcrypt)
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'PATIENT' CHECK (role IN ('PATIENT', 'ADMIN')),
    patient_id    UUID UNIQUE REFERENCES patients (id) ON DELETE CASCADE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

-- Contactos de emergencia del paciente
CREATE TABLE emergency_contacts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id   UUID         NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    full_name    VARCHAR(160) NOT NULL,
    relationship VARCHAR(60)  NOT NULL,
    phone        VARCHAR(20)  NOT NULL,
    is_primary   BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Citas médicas (programadas e historial de atenciones)
CREATE TABLE appointments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id    UUID         NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    scheduled_at  TIMESTAMPTZ  NOT NULL,
    specialty     VARCHAR(80)  NOT NULL,
    doctor_name   VARCHAR(120) NOT NULL,
    health_center VARCHAR(120) NOT NULL,
    location      VARCHAR(120),                            -- Consultorio, piso o módulo
    reason        TEXT,
    status        VARCHAR(20)  NOT NULL CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'MISSED')),
    notes         TEXT,                                    -- Resumen de la atención (si ya ocurrió)
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Recetas / medicamentos
CREATE TABLE prescriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID         NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    medication_name VARCHAR(120) NOT NULL,
    dosage          VARCHAR(60)  NOT NULL,                 -- Concentración (ej. 50 mg)
    frequency       VARCHAR(120) NOT NULL,                 -- Ej. 1 tableta cada 12 horas
    route           VARCHAR(40)  NOT NULL,                 -- Vía de administración
    instructions    TEXT,
    quantity        INTEGER      NOT NULL CHECK (quantity > 0),
    start_date      DATE         NOT NULL,
    end_date        DATE,                                  -- NULL = tratamiento crónico
    prescribed_by   VARCHAR(120) NOT NULL,
    pharmacy        VARCHAR(120) NOT NULL,
    status          VARCHAR(20)  NOT NULL CHECK (status IN ('ACTIVE', 'COMPLETED', 'SUSPENDED')),
    delivery_status VARCHAR(20)  NOT NULL CHECK (delivery_status IN ('PENDING', 'READY_FOR_PICKUP', 'DELIVERED')),
    delivered_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_treatment_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Diagnósticos (historial clínico) con código CIE-10
CREATE TABLE medical_records (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id     UUID         NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    diagnosis_code VARCHAR(10)  NOT NULL,
    diagnosis_name VARCHAR(160) NOT NULL,
    diagnosed_at   DATE         NOT NULL,
    doctor_name    VARCHAR(120) NOT NULL,
    health_center  VARCHAR(120) NOT NULL,
    status         VARCHAR(20)  NOT NULL CHECK (status IN ('ACTIVE', 'CONTROLLED', 'RESOLVED')),
    notes          TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Alergias
CREATE TABLE allergies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  UUID         NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    allergen    VARCHAR(120) NOT NULL,
    reaction    VARCHAR(160) NOT NULL,
    severity    VARCHAR(10)  NOT NULL CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE')),
    recorded_at DATE         NOT NULL,
    UNIQUE (patient_id, allergen)
);

-- Constantes vitales básicas registradas en cada consulta
CREATE TABLE vital_signs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id         UUID         NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    recorded_at        TIMESTAMPTZ  NOT NULL,
    systolic_pressure  INTEGER      NOT NULL CHECK (systolic_pressure BETWEEN 50 AND 260),
    diastolic_pressure INTEGER      NOT NULL CHECK (diastolic_pressure BETWEEN 30 AND 160),
    heart_rate         INTEGER      NOT NULL CHECK (heart_rate BETWEEN 20 AND 250),
    temperature_c      NUMERIC(4,1) NOT NULL,
    weight_kg          NUMERIC(5,1) NOT NULL,
    height_cm          NUMERIC(5,1) NOT NULL,
    oxygen_saturation  INTEGER      NOT NULL CHECK (oxygen_saturation BETWEEN 50 AND 100),
    glucose_mg_dl      INTEGER                                   -- Opcional (solo si se midió)
);

-- Índices para las consultas por paciente
CREATE INDEX idx_emergency_contacts_patient ON emergency_contacts (patient_id);
CREATE INDEX idx_appointments_patient_date  ON appointments (patient_id, scheduled_at);
CREATE INDEX idx_prescriptions_patient      ON prescriptions (patient_id);
CREATE INDEX idx_medical_records_patient    ON medical_records (patient_id, diagnosed_at);
CREATE INDEX idx_allergies_patient          ON allergies (patient_id);
CREATE INDEX idx_vital_signs_patient_date   ON vital_signs (patient_id, recorded_at);

-- -----------------------------------------------------------------------------
-- 2. Función auxiliar para las semillas: fecha relativa a HOY con hora de Costa Rica (UTC-6).
--    Así las citas "próximas" siempre quedan en el futuro, sin importar cuándo se cree la BD.
-- -----------------------------------------------------------------------------
CREATE FUNCTION seed_local_time(days_from_today INTEGER, local_time TIME)
RETURNS TIMESTAMPTZ
LANGUAGE SQL
AS $$
    SELECT ((CURRENT_DATE + days_from_today) + local_time) AT TIME ZONE INTERVAL '-06:00';
$$;

-- -----------------------------------------------------------------------------
-- 3. DML: datos de prueba (personas ficticias)
-- -----------------------------------------------------------------------------

INSERT INTO patients (national_id, first_name, last_name, birth_date, sex, blood_type, phone, address, health_area) VALUES
    ('112340567', 'María Fernanda', 'Solano Rojas',   '1985-03-14', 'FEMALE', 'O+', '8845-1290', 'Barva, Heredia. 200 m norte de la iglesia',     'Área de Salud Barva — EBAIS Barva Centro'),
    ('402150893', 'José Pablo',     'Vargas Mora',    '1992-11-02', 'MALE',   'A+', '8712-3344', 'San Pablo, Heredia. Residencial Las Flores #12', 'Área de Salud San Pablo — EBAIS Rincón de Sabanilla'),
    -- Paciente SIN cuenta de usuario: sirve para probar el registro desde la app
    ('204560789', 'Ana Lucía',      'Castro Jiménez', '1978-07-21', 'FEMALE', 'B-', '8390-7781', 'Alajuela centro, Calle 4',                      'Área de Salud Alajuela Central');

-- Usuarios de prueba. Contraseña de ambos: Paciente123!  (hashes bcrypt, costo 10)
INSERT INTO users (email, password_hash, role, patient_id) VALUES
    ('maria.solano@example.com', '$2b$10$QRW8cul4ria9H1Va1e4fOuI9pxQcV3DNAHu0zz1QDUwATJd66hgk.', 'PATIENT',
        (SELECT id FROM patients WHERE national_id = '112340567')),
    ('jose.vargas@example.com',  '$2b$10$eAG1lRhTtB8L7RedVudjh.igmvWaqWTFGAZqvWZZ3dIenGdto6Cou', 'PATIENT',
        (SELECT id FROM patients WHERE national_id = '402150893'));

INSERT INTO emergency_contacts (patient_id, full_name, relationship, phone, is_primary) VALUES
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Carlos Solano Méndez',   'Esposo',   '8801-2233', TRUE),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Rosa Rojas Alfaro',      'Madre',    '2260-4455', FALSE),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'Laura Mora Quesada',     'Madre',    '8999-1020', TRUE),
    ((SELECT id FROM patients WHERE national_id = '204560789'), 'Diego Castro Jiménez',   'Hermano',  '8650-3311', TRUE);

-- Citas: próximas (días positivos) e historial (días negativos)
INSERT INTO appointments (patient_id, scheduled_at, specialty, doctor_name, health_center, location, reason, status, notes) VALUES
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(4, '08:30'),   'Medicina General', 'Dra. Patricia Núñez Araya', 'EBAIS Barva Centro',              'Consultorio 2',            'Control de hipertensión y diabetes', 'SCHEDULED', NULL),
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(18, '10:15'),  'Oftalmología',     'Dr. Andrés Quirós Villalobos', 'Hospital San Vicente de Paúl', 'Consulta Externa, piso 2', 'Revisión de fondo de ojo (diabetes)', 'SCHEDULED', NULL),
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(-30, '09:00'), 'Medicina General', 'Dra. Patricia Núñez Araya', 'EBAIS Barva Centro',              'Consultorio 2',            'Control trimestral',                  'COMPLETED', 'Presión arterial controlada. Se mantiene Losartán y se ajusta Metformina.'),
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(-75, '13:30'), 'Nutrición',        'Lic. Sofía Herrera Campos',  'Área de Salud Barva',             'Consultorio de Nutrición', 'Plan de alimentación',                'MISSED',    NULL),
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(-120, '07:45'),'Laboratorio',      'Lab. Clínico — Toma de muestras', 'EBAIS Barva Centro',       'Laboratorio',              'Hemoglobina glicosilada y perfil de lípidos', 'COMPLETED', 'Muestras tomadas en ayunas. HbA1c: 6,9 %.'),
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(-160, '11:00'),'Cardiología',      'Dr. Mauricio Salas Ureña',   'Hospital San Vicente de Paúl',    'Consulta Externa, piso 3', 'Valoración cardiovascular',           'CANCELLED', 'Cita reprogramada por el centro de salud.'),
    ((SELECT id FROM patients WHERE national_id = '402150893'), seed_local_time(9, '14:00'),   'Neumología',       'Dra. Gabriela Rojas Soto',   'Hospital San Vicente de Paúl',    'Consulta Externa, piso 1', 'Control de asma',                     'SCHEDULED', NULL),
    ((SELECT id FROM patients WHERE national_id = '402150893'), seed_local_time(-45, '08:00'), 'Medicina General', 'Dr. Esteban Chaves León',    'EBAIS Rincón de Sabanilla',       'Consultorio 1',            'Crisis asmática leve',                'COMPLETED', 'Se nebuliza en consulta. Se indica Salbutamol de rescate.'),
    ((SELECT id FROM patients WHERE national_id = '402150893'), seed_local_time(-200, '10:30'),'Odontología',      'Dra. Natalia Brenes Fallas', 'EBAIS Rincón de Sabanilla',       'Consultorio Odontológico', 'Limpieza dental',                     'COMPLETED', 'Profilaxis completa sin hallazgos.');

-- Recetas: activas, listas para retiro, entregadas y finalizadas
INSERT INTO prescriptions (patient_id, medication_name, dosage, frequency, route, instructions, quantity, start_date, end_date, prescribed_by, pharmacy, status, delivery_status, delivered_at) VALUES
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Losartán',      '50 mg',  '1 tableta cada 12 horas', 'Oral', 'Tomar a la misma hora todos los días. No suspender sin indicación médica.', 60, CURRENT_DATE - 30, NULL,              'Dra. Patricia Núñez Araya', 'Farmacia EBAIS Barva Centro', 'ACTIVE', 'DELIVERED',        seed_local_time(-29, '10:00')),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Metformina',    '850 mg', '1 tableta con el desayuno y la cena', 'Oral', 'Tomar con alimentos para evitar molestias estomacales.', 60, CURRENT_DATE - 30, NULL,              'Dra. Patricia Núñez Araya', 'Farmacia EBAIS Barva Centro', 'ACTIVE', 'READY_FOR_PICKUP', NULL),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Atorvastatina', '20 mg',  '1 tableta en la noche', 'Oral', 'Evitar el consumo de toronja durante el tratamiento.', 30, CURRENT_DATE - 30, CURRENT_DATE + 60, 'Dra. Patricia Núñez Araya', 'Farmacia Hospital San Vicente de Paúl', 'ACTIVE', 'PENDING', NULL),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Acetaminofén',  '500 mg', '1 tableta cada 8 horas si hay dolor', 'Oral', 'Máximo 4 tabletas al día.', 20, CURRENT_DATE - 90, CURRENT_DATE - 80, 'Dra. Patricia Núñez Araya', 'Farmacia EBAIS Barva Centro', 'COMPLETED', 'DELIVERED', seed_local_time(-90, '11:30')),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'Salbutamol',    '100 mcg/dosis', '2 inhalaciones cada 6 horas en caso de crisis', 'Inhalada', 'Usar con espaciador. Si no mejora en 20 minutos, acudir a emergencias.', 1, CURRENT_DATE - 45, NULL, 'Dr. Esteban Chaves León', 'Farmacia EBAIS Rincón de Sabanilla', 'ACTIVE', 'DELIVERED', seed_local_time(-45, '09:15')),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'Beclometasona', '250 mcg/dosis', '2 inhalaciones cada 12 horas', 'Inhalada', 'Enjuagar la boca después de cada uso.', 1, CURRENT_DATE - 45, CURRENT_DATE + 45, 'Dr. Esteban Chaves León', 'Farmacia EBAIS Rincón de Sabanilla', 'ACTIVE', 'READY_FOR_PICKUP', NULL),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'Loratadina',    '10 mg',  '1 tableta al día', 'Oral', 'Puede causar somnolencia leve.', 10, CURRENT_DATE - 60, CURRENT_DATE - 50, 'Dr. Esteban Chaves León', 'Farmacia EBAIS Rincón de Sabanilla', 'COMPLETED', 'DELIVERED', seed_local_time(-60, '08:40'));

-- Diagnósticos con códigos CIE-10
INSERT INTO medical_records (patient_id, diagnosis_code, diagnosis_name, diagnosed_at, doctor_name, health_center, status, notes) VALUES
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'I10',   'Hipertensión esencial (primaria)',          CURRENT_DATE - 1460, 'Dra. Patricia Núñez Araya', 'EBAIS Barva Centro',           'CONTROLLED', 'Buena adherencia al tratamiento.'),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'E11.9', 'Diabetes mellitus tipo 2 sin complicaciones', CURRENT_DATE - 730,  'Dra. Patricia Núñez Araya', 'EBAIS Barva Centro',           'ACTIVE',     'Meta: HbA1c menor a 7 %.'),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'E78.5', 'Hiperlipidemia no especificada',            CURRENT_DATE - 120,  'Dra. Patricia Núñez Araya', 'EBAIS Barva Centro',           'ACTIVE',     'Inicia estatina y cambios en la dieta.'),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'J06.9', 'Infección aguda de vías respiratorias superiores', CURRENT_DATE - 90, 'Dr. Luis Fernández Mora', 'EBAIS Barva Centro',          'RESOLVED',   'Tratamiento sintomático.'),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'J45.9', 'Asma no especificada',                      CURRENT_DATE - 2190, 'Dra. Gabriela Rojas Soto',  'Hospital San Vicente de Paúl', 'CONTROLLED', 'Crisis ocasionales asociadas a cambios de clima.'),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'J30.4', 'Rinitis alérgica no especificada',          CURRENT_DATE - 60,   'Dr. Esteban Chaves León',   'EBAIS Rincón de Sabanilla',    'RESOLVED',   'Mejoría con antihistamínico.');

INSERT INTO allergies (patient_id, allergen, reaction, severity, recorded_at) VALUES
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Penicilina',      'Urticaria generalizada y dificultad respiratoria', 'SEVERE',   CURRENT_DATE - 3650),
    ((SELECT id FROM patients WHERE national_id = '112340567'), 'Mariscos',        'Inflamación de labios y picazón',                  'MODERATE', CURRENT_DATE - 2000),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'Ibuprofeno',      'Broncoespasmo',                                    'MODERATE', CURRENT_DATE - 1800),
    ((SELECT id FROM patients WHERE national_id = '402150893'), 'Ácaros del polvo', 'Estornudos y congestión nasal',                    'MILD',     CURRENT_DATE - 2190),
    ((SELECT id FROM patients WHERE national_id = '204560789'), 'Sulfas',          'Erupción cutánea',                                 'MODERATE', CURRENT_DATE - 1000);

INSERT INTO vital_signs (patient_id, recorded_at, systolic_pressure, diastolic_pressure, heart_rate, temperature_c, weight_kg, height_cm, oxygen_saturation, glucose_mg_dl) VALUES
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(-30, '09:10'),  128, 82, 76, 36.5, 71.2, 162.0, 98, 118),
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(-120, '07:50'), 135, 86, 80, 36.7, 72.8, 162.0, 97, 131),
    ((SELECT id FROM patients WHERE national_id = '112340567'), seed_local_time(-210, '08:20'), 142, 90, 84, 36.6, 74.1, 162.0, 97, 145),
    ((SELECT id FROM patients WHERE national_id = '402150893'), seed_local_time(-45, '08:10'),  118, 76, 98, 37.1, 78.5, 178.0, 94, NULL),
    ((SELECT id FROM patients WHERE national_id = '402150893'), seed_local_time(-200, '10:40'), 116, 74, 72, 36.4, 77.9, 178.0, 99, NULL);

-- La función auxiliar ya no se necesita después de cargar las semillas
DROP FUNCTION seed_local_time(INTEGER, TIME);

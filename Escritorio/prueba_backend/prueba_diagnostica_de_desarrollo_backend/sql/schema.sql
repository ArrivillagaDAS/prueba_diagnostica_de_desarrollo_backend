-- Creación de Tipos ENUM para PostgreSQL
CREATE TYPE vacancy_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE application_source AS ENUM ('REFERRAL', 'INTERNAL', 'JOB_BOARD', 'OTHER');
CREATE TYPE application_status AS ENUM ('RECEIVED', 'IN_REVIEW', 'REJECTED', 'HIRED');
CREATE TYPE priority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'TOP');

-- Tabla de Candidatos
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    years_experience INT NOT NULL CHECK (years_experience >= 0)
);

-- Tabla de Vacantes
CREATE TABLE vacancies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    min_years_experience INT NOT NULL CHECK (min_years_experience >= 0),
    status vacancy_status NOT NULL DEFAULT 'OPEN'
);

-- Tabla de Postulaciones
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    candidate_id INT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    vacancy_id INT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    source application_source NOT NULL,
    score INT NOT NULL CHECK (score >= 0),
    priority priority_level NOT NULL,
    status application_status NOT NULL DEFAULT 'RECEIVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba
INSERT INTO candidates (name, email, years_experience) VALUES
('Ana García', 'ana.garcia@email.com', 5),
('Carlos López', 'carlos.lopez@email.com', 2),
('María Rodríguez', 'maria.rodriguez@email.com', 8);

-- 2 vacantes: 1 OPEN y 1 CLOSED
INSERT INTO vacancies (title, min_years_experience, status) VALUES
('Backend Developer Senior', 4, 'OPEN'),
('Frontend Developer Junior', 1, 'CLOSED');
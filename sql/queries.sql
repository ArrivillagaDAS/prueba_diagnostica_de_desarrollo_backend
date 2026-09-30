-- Query 1: Obtener candidato por ID
SELECT id, name, email, years_experience FROM candidates WHERE id = $1;

-- Query 2: Obtener vacante por ID
SELECT id, title, min_years_experience, status FROM vacancies WHERE id = $1;

-- Query 3: Contar postulaciones activas del candidato (RECEIVED o IN_REVIEW) en OTRAS vacantes
SELECT COUNT(*) FROM applications 
WHERE candidate_id = $1 
  AND vacancy_id != $2 
  AND status IN ('RECEIVED', 'IN_REVIEW');

-- Query 4: Validar duplicidad para la misma vacante
SELECT status, status_updated_at 
FROM applications 
WHERE candidate_id = $1 AND vacancy_id = $2 
ORDER BY created_at DESC LIMIT 1;

-- Query 5: Insertar nueva postulación
INSERT INTO applications (candidate_id, vacancy_id, cover_letter, source, score, priority, status)
VALUES ($1, $2, $3, $4, $5, $6, 'RECEIVED') 
RETURNING *;

-- Query 6: Consultar postulaciones con filtros y join
SELECT 
    a.id, 
    a.cover_letter, 
    a.source, 
    a.score, 
    a.priority, 
    a.status, 
    a.created_at, 
    a.status_updated_at,
    c.name AS candidate_name, 
    c.email AS candidate_email,
    v.title AS vacancy_title
FROM applications a
JOIN candidates c ON a.candidate_id = c.id
JOIN vacancies v ON a.vacancy_id = v.id
WHERE ($1::text IS NULL OR a.status = $1::application_status)
  AND ($2::int IS NULL OR a.vacancy_id = $2)
ORDER BY a.score DESC, a.created_at ASC;

-- Query 7: Actualizar estado de la postulación
UPDATE applications 
SET status = $1, status_updated_at = CURRENT_TIMESTAMP 
WHERE id = $2 
RETURNING *;
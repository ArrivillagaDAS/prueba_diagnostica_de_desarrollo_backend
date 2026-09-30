const db = require('../database/connection');
const { calculateScoreAndPriority } = require('../utils/priorityCalculator');

const ALLOWED_SOURCES = ['REFERRAL', 'INTERNAL', 'JOB_BOARD', 'OTHER'];
const ALLOWED_STATUSES = ['RECEIVED', 'IN_REVIEW', 'REJECTED', 'HIRED'];

async function createApplication({ candidateId, vacancyId, source, coverLetter }) {
  // 1. Validaciones básicas
  if (!candidateId || !vacancyId || !source || !coverLetter) {
    throw { status: 400, message: 'Todos los campos obligatorios deben ser enviados.' };
  }

  if (!ALLOWED_SOURCES.includes(source)) {
    throw { status: 400, message: 'La fuente de la postulación no es válida.' };
  }

  // 2. Verificar existencia del candidato
  const candidateRes = await db.query(
    'SELECT id, years_experience FROM candidates WHERE id = $1',
    [candidateId]
  );
  if (candidateRes.rows.length === 0) {
    throw { status: 404, message: 'El candidato especificado no existe.' };
  }
  const candidate = candidateRes.rows[0];

  // 3. Verificar existencia de la vacante y que esté OPEN
  const vacancyRes = await db.query(
    'SELECT id, min_years_experience, status FROM vacancies WHERE id = $1',
    [vacancyId]
  );
  if (vacancyRes.rows.length === 0) {
    throw { status: 404, message: 'La vacante especificada no existe.' };
  }
  const vacancy = vacancyRes.rows[0];

  if (vacancy.status !== 'OPEN') {
    throw { status: 400, message: 'No es posible postularse a una vacante que se encuentra CERRADA.' };
  }

  // 4. Regla de duplicidad
  const previousAppRes = await db.query(
    'SELECT status, status_updated_at FROM applications WHERE candidate_id = $1 AND vacancy_id = $2 ORDER BY created_at DESC LIMIT 1',
    [candidateId, vacancyId]
  );

  if (previousAppRes.rows.length > 0) {
    const prevApp = previousAppRes.rows[0];
    if (['RECEIVED', 'IN_REVIEW', 'HIRED'].includes(prevApp.status)) {
      throw { status: 409, message: 'El candidato ya posee una postulación activa o contratada para esta vacante.' };
    }

    if (prevApp.status === 'REJECTED') {
      const rejectedDate = new Date(prevApp.status_updated_at);
      const now = new Date();
      const diffDays = Math.floor((now - rejectedDate) / (1000 * 60 * 60 * 24));
      if (diffDays < 30) {
        throw { 
          status: 409, 
          message: `Deben transcurrir al menos 30 días desde la fecha de rechazo para re-postularse. Han transcurrido ${diffDays} días.` 
        };
      }
    }
  }

  // 5. Consultar postulaciones activas en OTRAS vacantes
  const activeAppsRes = await db.query(
    `SELECT COUNT(*) FROM applications 
     WHERE candidate_id = $1 AND vacancy_id != $2 AND status IN ('RECEIVED', 'IN_REVIEW')`,
    [candidateId, vacancyId]
  );
  const activeApplicationsCount = parseInt(activeAppsRes.rows[0].count, 10);

  // 6. Calcular puntaje y prioridad
  const { score, priority } = calculateScoreAndPriority({
    candidateExperience: candidate.years_experience,
    requiredExperience: vacancy.min_years_experience,
    source,
    coverLetter,
    activeApplicationsCount
  });

  // 7. Guardar postulación
  const insertRes = await db.query(
    `INSERT INTO applications (candidate_id, vacancy_id, cover_letter, source, score, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'RECEIVED')
     RETURNING *`,
    [candidateId, vacancyId, coverLetter, source, score, priority]
  );

  return insertRes.rows[0];
}

async function getApplications({ status, vacancyId }) {
  let queryText = `
    SELECT 
      a.id, a.cover_letter, a.source, a.score, a.priority, a.status, 
      a.created_at, a.status_updated_at,
      c.name AS candidate_name, c.email AS candidate_email,
      v.title AS vacancy_title
    FROM applications a
    JOIN candidates c ON a.candidate_id = c.id
    JOIN vacancies v ON a.vacancy_id = v.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw { status: 400, message: 'Filtro de estado no válido.' };
    }
    params.push(status);
    queryText += ` AND a.status = $${params.length}`;
  }

  if (vacancyId) {
    params.push(parseInt(vacancyId, 10));
    queryText += ` AND a.vacancy_id = $${params.length}`;
  }

  queryText += ` ORDER BY a.score DESC, a.created_at ASC`;

  const result = await db.query(queryText, params);
  return result.rows;
}

async function updateApplicationStatus(id, newStatus) {
  if (!ALLOWED_STATUSES.includes(newStatus)) {
    throw { status: 400, message: 'El estado proporcionado no es válido.' };
  }

  const appRes = await db.query('SELECT status FROM applications WHERE id = $1', [id]);
  if (appRes.rows.length === 0) {
    throw { status: 404, message: 'La postulación no fue encontrada.' };
  }

  const currentStatus = appRes.rows[0].status;
  if (['REJECTED', 'HIRED'].includes(currentStatus)) {
    throw { status: 400, message: 'No se puede cambiar el estado de una postulación en estado final (REJECTED o HIRED).' };
  }

  const updateRes = await db.query(
    `UPDATE applications 
     SET status = $1, status_updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [newStatus, id]
  );

  return updateRes.rows[0];
}

module.exports = {
  createApplication,
  getApplications,
  updateApplicationStatus
};
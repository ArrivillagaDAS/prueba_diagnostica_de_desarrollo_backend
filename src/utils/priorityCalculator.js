/**
 * Calcula el puntaje y prioridad de una postulación con base en las reglas de negocio.
 */
function calculateScoreAndPriority({
  candidateExperience,
  requiredExperience,
  source,
  coverLetter,
  activeApplicationsCount
}) {
  let score = 0;

  // 1. Experiencia suficiente
  if (candidateExperience >= requiredExperience) {
    score += 4;
  }

  // 2. Fuente
  if (source === 'REFERRAL') {
    score += 3;
  } else if (source === 'INTERNAL') {
    score += 2;
  }

  // 3. Palabras clave en carta de presentación ("node", "sql", "api") - Case insensitive, suma 1 sola vez
  const lowerLetter = (coverLetter || '').toLowerCase();
  const hasKeywords = ['node', 'sql', 'api'].some(word => lowerLetter.includes(word));
  if (hasKeywords) {
    score += 2;
  }

  // 4. Longitud de carta de presentación
  if (coverLetter && coverLetter.length > 500) {
    score += 1;
  }

  // 5. Postulaciones activas previas
  if (activeApplicationsCount >= 3) {
    score -= 2;
  }

  // El puntaje no puede ser negativo
  if (score < 0) {
    score = 0;
  }

  // Determinar Prioridad
  let priority = 'LOW';
  if (score >= 7) {
    priority = 'TOP';
  } else if (score >= 5) {
    priority = 'HIGH';
  } else if (score >= 3) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  return { score, priority };
}

module.exports = { calculateScoreAndPriority };
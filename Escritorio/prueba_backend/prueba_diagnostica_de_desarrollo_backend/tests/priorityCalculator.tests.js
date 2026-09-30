const { calculateScoreAndPriority } = require('../src/utils/priorityCalculator');

describe('Pruebas unitarias para el cálculo de puntaje y prioridad', () => {
  
  test('Prueba 1: Candidato ideal con máxima puntuación (TOP)', () => {
    // Experiencia (4) + REFERRAL (3) + Keywords "Node" y "SQL" (2) + Carta > 500 chars (1) - Activas (0) = 10 puntos (TOP)
    const longLetter = 'Node '.repeat(105); // > 500 caracteres y contiene 'node'
    
    const result = calculateScoreAndPriority({
      candidateExperience: 5,
      requiredExperience: 3,
      source: 'REFERRAL',
      coverLetter: longLetter,
      activeApplicationsCount: 0
    });

    expect(result.score).toBe(10);
    expect(result.priority).toBe('TOP');
  });

  test('Prueba 2: Candidato con penalización por múltiples postulaciones activas y sin cumplir experiencia', () => {
    // Experiencia insuficiente (0) + OTHER (0) + Sin keywords (0) + Carta corta (0) - 3 activas (-2) = -2 -> Ajustado a 0 (LOW)
    const result = calculateScoreAndPriority({
      candidateExperience: 1,
      requiredExperience: 3,
      source: 'OTHER',
      coverLetter: 'Hola, me interesa la vacante.',
      activeApplicationsCount: 3
    });

    expect(result.score).toBe(0);
    expect(result.priority).toBe('LOW');
  });

  test('Prueba 3: Búsqueda de palabras clave insensible a mayúsculas y conteo único', () => {
    // Experiencia (4) + INTERNAL (2) + Keywords "NODE", "SQL", "API" en mayúsculas (suma solo +2) = 8 puntos (TOP)
    const result = calculateScoreAndPriority({
      candidateExperience: 4,
      requiredExperience: 2,
      source: 'INTERNAL',
      coverLetter: 'Tengo amplio conocimiento en NODE, SQL y REST API.',
      activeApplicationsCount: 0
    });

    expect(result.score).toBe(8);
    expect(result.priority).toBe('TOP');
  });

});
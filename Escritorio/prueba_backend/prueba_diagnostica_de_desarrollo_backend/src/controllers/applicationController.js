const applicationService = require('../services/applicationService');

async function createApplication(req, res) {
  try {
    const newApplication = await applicationService.createApplication(req.body);
    return res.status(201).json({
      message: 'Postulación registrada exitosamente.',
      data: newApplication
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error al crear postulación:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

async function getApplications(req, res) {
  try {
    const { status, vacancyId } = req.query;
    const applications = await applicationService.getApplications({ status, vacancyId });
    return res.status(200).json({ data: applications });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error al consultar postulaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'El campo status es requerido.' });
    }

    const updatedApp = await applicationService.updateApplicationStatus(id, status);
    return res.status(200).json({
      message: 'Estado de la postulación actualizado exitosamente.',
      data: updatedApp
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error al actualizar estado:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

module.exports = {
  createApplication,
  getApplications,
  updateApplicationStatus
};
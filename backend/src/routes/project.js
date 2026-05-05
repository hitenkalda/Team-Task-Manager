const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project');
const authenticateToken = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('../schemas/projectSchema');

router.use(authenticateToken);

router.post('/', validate(createProjectSchema), projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

router.post('/:id/members', validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);

module.exports = router;

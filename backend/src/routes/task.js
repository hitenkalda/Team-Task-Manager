const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/task');
const authenticateToken = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { createTaskSchema, updateTaskSchema } = require('../schemas/taskSchema');

router.use(authenticateToken);

router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:taskId', taskController.getTaskById);
router.put('/:taskId', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;

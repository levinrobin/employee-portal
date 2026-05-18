const express = require('express');

const router = express.Router();

const emp = require('../controllers/employeeControllers');

const dept = require('../controllers/departmentControllers');

// Employee routes

router.get('/employees/stats/summary', emp.getStats);

router.get('/employees', emp.getAll);

router.get('/employees/:id', emp.getById);

router.post('/employees', emp.create);

router.put('/employees/:id', emp.update);

router.delete('/employees/:id', emp.remove);

// Department routes

router.get('/departments', dept.getAll);

router.post('/departments', dept.create);

router.put('/departments/:id', dept.update);

router.delete('/departments/:id', dept.remove);

module.exports = router;
 
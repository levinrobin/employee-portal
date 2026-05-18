const pool = require('../db/pool');

// GET /api/employees

exports.getAll = async (req, res, next) => {

  try {

    const { status, department_id, search, page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const values = [];

    const conditions = [];

    if (status) {

      values.push(status);

      conditions.push(`e.status = $${values.length}`);

    }

    if (department_id) {

      values.push(parseInt(department_id));

      conditions.push(`e.department_id = $${values.length}`);

    }

    if (search) {

      values.push(`%${search.toLowerCase()}%`);

      conditions.push(`(LOWER(e.first_name) LIKE $${values.length} OR LOWER(e.last_name) LIKE $${values.length} OR LOWER(e.email) LIKE $${values.length} OR LOWER(e.position) LIKE $${values.length})`);

    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(

      `SELECT COUNT(*) FROM employees e ${where}`,

      values

    );

    const total = parseInt(countResult.rows[0].count);

    values.push(parseInt(limit));

    values.push(offset);

    const result = await pool.query(

      `SELECT e.*, d.name AS department_name

       FROM employees e

       LEFT JOIN departments d ON e.department_id = d.id

       ${where}

       ORDER BY e.created_at DESC

       LIMIT $${values.length - 1} OFFSET $${values.length}`,

      values

    );

    res.json({

      data: result.rows,

      pagination: {

        total,

        page: parseInt(page),

        limit: parseInt(limit),

        pages: Math.ceil(total / parseInt(limit)),

      },

    });

  } catch (err) {

    next(err);

  }

};

// GET /api/employees/:id

exports.getById = async (req, res, next) => {

  try {

    const result = await pool.query(

      `SELECT e.*, d.name AS department_name

       FROM employees e

       LEFT JOIN departments d ON e.department_id = d.id

       WHERE e.id = $1`,

      [req.params.id]

    );

    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });

    res.json(result.rows[0]);

  } catch (err) {

    next(err);

  }

};

// POST /api/employees

exports.create = async (req, res, next) => {

  try {

    const { first_name, last_name, email, phone, position, department_id, salary, status, hire_date } = req.body;

    const initials = `${first_name[0]}${last_name[0]}`.toUpperCase();

    const result = await pool.query(

      `INSERT INTO employees (first_name, last_name, email, phone, position, department_id, salary, status, hire_date, avatar_initials)

       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)

       RETURNING *`,

      [first_name, last_name, email, phone, position, department_id || null, salary || null, status || 'active', hire_date || new Date().toISOString().split('T')[0], initials]

    );

    await pool.query(

      `INSERT INTO audit_log (entity_type, entity_id, action, changes) VALUES ($1,$2,$3,$4)`,

      ['employee', result.rows[0].id, 'create', JSON.stringify(result.rows[0])]

    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });

    next(err);

  }

};

// PUT /api/employees/:id

exports.update = async (req, res, next) => {

  try {

    const { first_name, last_name, email, phone, position, department_id, salary, status, hire_date } = req.body;

    const result = await pool.query(

      `UPDATE employees SET

        first_name = COALESCE($1, first_name),

        last_name  = COALESCE($2, last_name),

        email      = COALESCE($3, email),

        phone      = COALESCE($4, phone),

        position   = COALESCE($5, position),

        department_id = COALESCE($6, department_id),

        salary     = COALESCE($7, salary),

        status     = COALESCE($8, status),

        hire_date  = COALESCE($9, hire_date),

        updated_at = NOW()

       WHERE id = $10 RETURNING *`,

      [first_name, last_name, email, phone, position, department_id, salary, status, hire_date, req.params.id]

    );

    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });

    await pool.query(

      `INSERT INTO audit_log (entity_type, entity_id, action, changes) VALUES ($1,$2,$3,$4)`,

      ['employee', result.rows[0].id, 'update', JSON.stringify(req.body)]

    );

    res.json(result.rows[0]);

  } catch (err) {

    next(err);

  }

};

// DELETE /api/employees/:id

exports.remove = async (req, res, next) => {

  try {

    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING id', [req.params.id]);

    if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });

    await pool.query(

      `INSERT INTO audit_log (entity_type, entity_id, action, changes) VALUES ($1,$2,$3,$4)`,

      ['employee', req.params.id, 'delete', JSON.stringify({ id: req.params.id })]

    );

    res.json({ message: 'Employee deleted', id: req.params.id });

  } catch (err) {

    next(err);

  }

};

// GET /api/employees/stats/summary

exports.getStats = async (req, res, next) => {

  try {

    const [total, byStatus, byDept, avgSalary] = await Promise.all([

      pool.query('SELECT COUNT(*) AS total FROM employees'),

      pool.query('SELECT status, COUNT(*) AS count FROM employees GROUP BY status'),

      pool.query(`SELECT d.name, COUNT(e.id) AS count FROM departments d

                  LEFT JOIN employees e ON e.department_id = d.id GROUP BY d.name ORDER BY count DESC`),

      pool.query('SELECT ROUND(AVG(salary)::numeric, 2) AS avg_salary FROM employees WHERE salary IS NOT NULL'),

    ]);

    res.json({

      total: parseInt(total.rows[0].total),

      by_status: byStatus.rows,

      by_department: byDept.rows,

      avg_salary: parseFloat(avgSalary.rows[0].avg_salary),

    });

  } catch (err) {

    next(err);

  }

};

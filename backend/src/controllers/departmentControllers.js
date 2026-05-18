const pool = require('../db/pool');

exports.getAll = async (req, res, next) => {

  try {

    const result = await pool.query(

      `SELECT d.*, COUNT(e.id) AS employee_count

       FROM departments d

       LEFT JOIN employees e ON e.department_id = d.id

       GROUP BY d.id

       ORDER BY d.name`

    );

    res.json(result.rows);

  } catch (err) { next(err); }

};

exports.create = async (req, res, next) => {

  try {

    const { name, description } = req.body;

    const result = await pool.query(

      'INSERT INTO departments (name, description) VALUES ($1,$2) RETURNING *',

      [name, description]

    );

    res.status(201).json(result.rows[0]);

  } catch (err) {

    if (err.code === '23505') return res.status(409).json({ error: 'Department name already exists' });

    next(err);

  }

};

exports.update = async (req, res, next) => {

  try {

    const { name, description } = req.body;

    const result = await pool.query(

      'UPDATE departments SET name=COALESCE($1,name), description=COALESCE($2,description), updated_at=NOW() WHERE id=$3 RETURNING *',

      [name, description, req.params.id]

    );

    if (!result.rows.length) return res.status(404).json({ error: 'Department not found' });

    res.json(result.rows[0]);

  } catch (err) { next(err); }

};

exports.remove = async (req, res, next) => {

  try {

    const result = await pool.query('DELETE FROM departments WHERE id=$1 RETURNING id', [req.params.id]);

    if (!result.rows.length) return res.status(404).json({ error: 'Department not found' });

    res.json({ message: 'Department deleted' });

  } catch (err) { next(err); }

};
 
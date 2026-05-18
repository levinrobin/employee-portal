require('dotenv').config();

const pool = require('./pool');

const migrations = `

  CREATE TABLE IF NOT EXISTS departments (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()

  );

  CREATE TABLE IF NOT EXISTS employees (

    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(20),

    position VARCHAR(150) NOT NULL,

    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,

    salary NUMERIC(12, 2),

    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),

    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,

    avatar_initials VARCHAR(3),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()

  );

  CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);

  CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

  CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

  CREATE TABLE IF NOT EXISTS audit_log (

    id SERIAL PRIMARY KEY,

    entity_type VARCHAR(50),

    entity_id INTEGER,

    action VARCHAR(20),

    changes JSONB,

    performed_at TIMESTAMPTZ DEFAULT NOW()

  );

  INSERT INTO departments (name, description) VALUES

    ('Engineering', 'Software development and infrastructure'),

    ('Product', 'Product management and strategy'),

    ('Design', 'UX, UI, and brand design'),

    ('Marketing', 'Growth, content, and campaigns'),

    ('HR', 'People operations and talent'),

    ('Finance', 'Accounting, budgeting, and reporting'),

    ('Sales', 'Revenue and customer acquisition'),

    ('Operations', 'Business operations and logistics')

  ON CONFLICT (name) DO NOTHING;

  INSERT INTO employees (first_name, last_name, email, phone, position, department_id, salary, status, hire_date, avatar_initials) VALUES

    ('Levin', 'Robin', 'levin.robin@company.com', '+1-555-0101', 'Senior Backend Engineer', 1, 125000, 'active', '2022-03-15', 'LR'),

    ('Sarah', 'Chen', 'sarah.chen@company.com', '+1-555-0102', 'Product Manager', 2, 115000, 'active', '2021-07-01', 'SC'),

    ('Marcus', 'Oliveira', 'marcus.oliveira@company.com', '+1-555-0103', 'Lead Designer', 3, 108000, 'active', '2022-01-10', 'MO'),

    ('Priya', 'Nair', 'priya.nair@company.com', '+1-555-0104', 'DevOps Engineer', 1, 118000, 'active', '2023-02-20', 'PN'),

    ('James', 'Whitfield', 'james.w@company.com', '+1-555-0105', 'Marketing Lead', 4, 95000, 'on_leave', '2020-11-05', 'JW'),

    ('Aiko', 'Tanaka', 'aiko.tanaka@company.com', '+1-555-0106', 'HR Director', 5, 130000, 'active', '2019-06-01', 'AT'),

    ('Carlos', 'Mendes', 'carlos.m@company.com', '+1-555-0107', 'Full Stack Engineer', 1, 105000, 'active', '2023-05-01', 'CM'),

    ('Nina', 'Petrova', 'nina.petrova@company.com', '+1-555-0108', 'Finance Analyst', 6, 88000, 'active', '2022-08-15', 'NP')

  ON CONFLICT (email) DO NOTHING;

`;

async function migrate() {

  const client = await pool.connect();

  try {

    console.log('Running migrations...');

    await client.query(migrations);

    console.log('Migrations completed successfully.');

  } catch (err) {

    console.error('Migration failed:', err);

    process.exit(1);

  } finally {

    client.release();

    await pool.end();

  }

}

migrate();
 
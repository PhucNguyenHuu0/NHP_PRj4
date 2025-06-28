const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'nhp_clothing_store_prj4',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully!');
  }
});

router.get('/test', (req, res) => {
  console.log('Test endpoint called');
  db.query('SELECT * FROM nhp_staff LIMIT 5', (err, results) => {
    if (err) {
      console.error('Test query error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    console.log('Test query results:', results);
    res.json({ 
      message: 'Database connection OK', 
      staffCount: results.length,
      sampleData: results 
    });
  });
});

router.post('/login', (req, res) => {
  console.log('=== LOGIN ATTEMPT START ===');
  
  const { nhp_name, nhp_password } = req.body;
  
  console.log('1. Received login request:', { 
    nhp_name, 
    hasPassword: !!nhp_password,
    passwordLength: nhp_password ? nhp_password.length : 0
  });
  console.log('2. Full request body:', req.body);

  if (!nhp_name || !nhp_password) {
    console.log('3. ❌ Missing required fields');
    return res.status(400).json({ 
      success: false,
      message: 'Tên đăng nhập và mật khẩu là bắt buộc' 
    });
  }

  console.log('3. ✅ Input validation passed');

  db.query('SELECT * FROM nhp_staff WHERE nhp_name = ?', [nhp_name], (err, results) => {
    console.log('5. Database query callback executed');
    
    if (err) {
      console.error('5. ❌ Database query error:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server khi truy vấn database',
        error: err.message 
      });
    }

    console.log('5. ✅ Query successful');
    console.log('6. Query results:', {
      resultCount: results.length,
      results: results.map(user => ({
        id: user.nhp_id,
        name: user.nhp_name,
        role: user.nhp_role,
        email: user.nhp_email,
        hasPassword: !!user.nhp_password,
        passwordLength: user.nhp_password ? user.nhp_password.length : 0
      }))
    });

    if (results.length === 0) {
      console.log('7. ❌ User not found');
      return res.status(401).json({ 
        success: false,
        message: 'Tài khoản không tồn tại' 
      });
    }

    console.log('7. ✅ User found');
    const user = results[0];

    let passwordMatch = false;
    try {
      if (user.nhp_password && user.nhp_password.startsWith('$2b$')) {
        passwordMatch = bcrypt.compareSync(nhp_password, user.nhp_password);
        console.log('   - Bcrypt comparison result:', passwordMatch);
      } else {
        passwordMatch = nhp_password === user.nhp_password;
        console.log('   - Direct comparison result:', passwordMatch);
      }
    } catch (bcryptError) {
      console.error('   - Bcrypt error:', bcryptError);
      passwordMatch = nhp_password === user.nhp_password;
      console.log('   - Fallback comparison result:', passwordMatch);
    }

    if (!passwordMatch) {
      console.log('9. ❌ Password mismatch');
      return res.status(401).json({ 
        success: false,
        message: 'Mật khẩu không đúng' 
      });
    }

    console.log('9. ✅ Password verified');

    const secretKey = process.env.JWT_SECRET || 'your_jwt_secret';
    console.log('10. Creating JWT with secret:', secretKey.substring(0, 10) + '...');
    
    const token = jwt.sign(
      { id: user.nhp_id, role: user.nhp_role, name: user.nhp_name },
      secretKey,
      { expiresIn: '1h' }
    );

    console.log('11. ✅ JWT created successfully');
    console.log('12. ✅ Login successful for user:', nhp_name);

    const response = {
      success: true,
      token,
      user: {
        id: user.nhp_id,
        role: user.nhp_role,
        name: user.nhp_name,
        email: user.nhp_email,
      }
    };
    
    console.log('13. Sending response:', { ...response, token: token.substring(0, 20) + '...' });
    res.json(response);
    
    console.log('=== LOGIN ATTEMPT END ===');
  });
});

module.exports = router;
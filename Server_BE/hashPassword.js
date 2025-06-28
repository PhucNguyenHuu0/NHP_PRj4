const bcrypt = require('bcrypt');
const saltRounds = 10;

const passwords = ['nhphuc123', 'admin123', 'staff123', 'employee123', 'guest123'];
passwords.forEach(password => {
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  console.log(`Mật khẩu: ${password} -> Hash: ${hashedPassword}`);
});
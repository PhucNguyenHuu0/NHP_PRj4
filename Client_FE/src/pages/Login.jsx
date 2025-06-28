import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [credentials, setCredentials] = useState({
    name: '', // Thay username thành name để khớp với nhp_name
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError(''); // Xóa lỗi khi người dùng thay đổi input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        nhp_name: credentials.name, // Sử dụng nhp_name thay vì nhp_username
        nhp_password: credentials.password,
      });
      const { token, role, name, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      setAuth({ token, role, name, email });
      navigate('/dashboard', { replace: true }); // Sử dụng replace để tránh quay lại login
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-5 text-center text-indigo-700">Đăng Nhập Hệ Thống</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tên Đăng Nhập</label>
            <input
              type="text"
              name="name" // Thay username thành name
              value={credentials.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nhập tên đăng nhập"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Mật Khẩu</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
            disabled={loading}
          >
            {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Quên mật khẩu?{' '}
          <Link to="/reset-password" className="text-indigo-600 hover:underline font-medium">
            Lấy lại mật khẩu
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
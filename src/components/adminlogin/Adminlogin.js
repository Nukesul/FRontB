import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './adminney.css';

const Adminlogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/AdminPanel');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://nukesul-brepb-651f.twc1.net/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка входа');
        setLoading(false);
        setEmail('');
        setPassword('');
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/AdminPanel');
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
      setError('Ошибка сети');
      setLoading(false);
    }
  };

  return (
    <div className='admin-page12'>
      <div className='login-box15'>
        <h1 className='heading'>Вход в админку</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label className='form-label5' htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              className='form-input1'
              value={email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='form-group'>
            <label className='form-label5' htmlFor='password'>Пароль</label>
            <input
              type='password'
              id='password'
              name='password'
              className='form-input1'
              value={password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className='action-buttons'>
            <button type='submit' className='submit-button' disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Adminlogin;
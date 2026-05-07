import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/auth';
import { createUser } from '../services/firestore';

export default function RegisterPage({ onSwitchPage }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    gender: 'male',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await createUser(userCredential.user.uid, {
        email: formData.email,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        university: '',
        profileImage: ''
      });
    } catch (err) {
      setError('登録に失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>新規登録</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          name="email"
          placeholder="メールアドレス"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="パスワード（8文字以上）"
          value={formData.password}
          onChange={handleChange}
          minLength="8"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="ニックネーム"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="年齢"
          value={formData.age}
          onChange={handleChange}
          min="18"
          max="30"
          required
        />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="male">男性</option>
          <option value="female">女性</option>
        </select>
        <textarea
          name="bio"
          placeholder="自己紹介（100字以内）"
          value={formData.bio}
          onChange={handleChange}
          maxLength="100"
        />
        <button type="submit" disabled={loading}>
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="switch">
        既にアカウントをお持ちの方は
        <button className="link-btn" onClick={onSwitchPage}>
          ログイン
        </button>
      </p>
    </div>
  );
}

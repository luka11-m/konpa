import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/auth';

export default function LoginPage({ onSwitchPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('ログインに失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>KONPA</h1>
      <p className="subtitle">大学生向け合コンマッチングアプリ</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="switch">
        アカウントがない方は
        <button className="link-btn" onClick={onSwitchPage}>
          新規登録
        </button>
      </p>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/auth';
import { getUserGroups, createGroup } from '../services/firestore';
import GroupPage from './GroupPage';

export default function HomePage({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
    } catch (err) {
      console.error('グループ読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      const gender = user.email?.includes('male') ? 'male' : 'female';
      const newGroup = await createGroup(groupName, user.uid, gender);
      setGroupName('');
      setShowCreateForm(false);
      await loadGroups();
    } catch (err) {
      console.error('グループ作成エラー:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('ログアウトエラー:', err);
    }
  };

  if (selectedGroup) {
    return (
      <GroupPage
        groupId={selectedGroup.id}
        group={selectedGroup}
        user={user}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="home-container">
      <header className="header">
        <h1>KONPA</h1>
        <button className="logout-btn" onClick={handleLogout}>ログアウト</button>
      </header>

      <div className="content">
        <h2>マイグループ</h2>

        {loading ? (
          <p>読み込み中...</p>
        ) : groups.length === 0 ? (
          <p className="empty">グループがまだありません</p>
        ) : (
          <div className="group-list">
            {groups.map(group => (
              <div
                key={group.id}
                className="group-card"
                onClick={() => setSelectedGroup(group)}
              >
                <h3>{group.groupName}</h3>
                <p>メンバー: {group.members?.length || 0} 人</p>
                <p className="status">{group.status}</p>
              </div>
            ))}
          </div>
        )}

        {!showCreateForm ? (
          <button
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            新しいグループを作成
          </button>
        ) : (
          <form onSubmit={handleCreateGroup} className="create-form">
            <input
              type="text"
              placeholder="グループ名（例：渋谷合コン班）"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
            <button type="submit">作成</button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="cancel-btn"
            >
              キャンセル
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { addGroupMember, saveMatchingConditions } from '../services/firestore';
import PaymentPage from './PaymentPage';

const AREAS = ['渋谷', '新宿', '六本木', '恵比寿', '銀座'];
const BUDGETS = [3000, 4000, 5000];
const DATES = [
  '5月10日（土）19時',
  '5月11日（日）20時',
  '5月12日（月）21時'
];

export default function GroupPage({ group, user, onBack }) {
  const [showConditions, setShowConditions] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    setInviteLink(
      `${window.location.origin}?group=${group.id}&join=true`
    );
  }, [group.id]);

  const handleDateToggle = (date) => {
    setSelectedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const handleSaveConditions = async (e) => {
    e.preventDefault();
    if (!selectedArea || !selectedBudget || selectedDates.length === 0) {
      alert('すべての条件を選択してください');
      return;
    }

    setLoading(true);
    try {
      await saveMatchingConditions(
        group.id,
        selectedDates,
        selectedArea,
        selectedBudget
      );
      setShowConditions(false);
      setShowPayment(true);
    } catch (err) {
      console.error('条件保存エラー:', err);
      alert('条件の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (showPayment) {
    return <PaymentPage groupId={group.id} onBack={onBack} />;
  }

  return (
    <div className="group-container">
      <button className="back-btn" onClick={onBack}>← 戻る</button>

      <h2>{group.groupName}</h2>

      <div className="group-info">
        <h3>メンバー ({group.members?.length || 0}人)</h3>
        <ul>
          {group.members?.map(memberId => (
            <li key={memberId}>
              {memberId === user.uid ? 'あなた' : `メンバー: ${memberId}`}
            </li>
          ))}
        </ul>
      </div>

      {group.members?.length < 5 && (
        <div className="invite-section">
          <h3>友人を招待</h3>
          <p className="invite-link">{inviteLink}</p>
          <button
            onClick={() => navigator.clipboard.writeText(inviteLink)}
            className="copy-btn"
          >
            コピー
          </button>
        </div>
      )}

      {!showConditions ? (
        <button
          className="conditions-btn"
          onClick={() => setShowConditions(true)}
          disabled={group.members?.length < 2}
        >
          条件入力へ
        </button>
      ) : (
        <form onSubmit={handleSaveConditions} className="conditions-form">
          <div className="form-group">
            <label>希望日時（複数選択可）</label>
            {DATES.map(date => (
              <label key={date} className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedDates.includes(date)}
                  onChange={() => handleDateToggle(date)}
                />
                {date}
              </label>
            ))}
          </div>

          <div className="form-group">
            <label>希望エリア</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              required
            >
              <option value="">選択してください</option>
              {AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>予算</label>
            {BUDGETS.map(budget => (
              <label key={budget} className="radio">
                <input
                  type="radio"
                  name="budget"
                  value={budget}
                  checked={selectedBudget === String(budget)}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                />
                ¥{budget.toLocaleString()}
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? '処理中...' : '条件確定'}
          </button>
          <button
            type="button"
            onClick={() => setShowConditions(false)}
            className="cancel-btn"
          >
            キャンセル
          </button>
        </form>
      )}
    </div>
  );
}

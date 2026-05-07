import React, { useState, useEffect } from 'react';
import { getGroupById } from '../services/firestore';
import { createCheckoutSession, redirectToCheckout } from '../services/stripe';

export default function PaymentPage({ groupId, onBack }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      const groupData = await getGroupById(groupId);
      setGroup(groupData);
    } catch (err) {
      console.error('グループ読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('メールアドレスを入力してください');
      return;
    }

    setProcessing(true);
    try {
      const memberCount = group.members?.length || 0;
      const amount = memberCount * 1500;

      const session = await createCheckoutSession(groupId, amount, email);
      await redirectToCheckout(session.id);
    } catch (err) {
      console.error('決済エラー:', err);
      alert('決済の処理に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (!group) return <p>グループが見つかりません</p>;

  const memberCount = group.members?.length || 0;
  const totalAmount = memberCount * 1500;

  return (
    <div className="payment-container">
      <button className="back-btn" onClick={onBack}>← 戻る</button>

      <h2>合コン予約金</h2>

      <div className="payment-details">
        <p>グループ: {group.groupName}</p>
        <p>人数: {memberCount}人</p>
        <p>1人あたり: ¥1,500</p>
        <h3>合計: ¥{totalAmount.toLocaleString()}</h3>
      </div>

      <form onSubmit={handlePayment} className="payment-form">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={processing}>
          {processing ? '処理中...' : 'クレジットカードで支払う'}
        </button>
      </form>

      <p className="payment-note">
        ※ Stripe によるセキュアな決済です
      </p>
    </div>
  );
}

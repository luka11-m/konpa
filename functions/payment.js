const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const matchId = session.metadata?.matchId;

      if (!matchId) {
        console.log('No matchId in session metadata');
        return res.status(400).json({ error: 'No matchId' });
      }

      // Update match document
      await db.collection('matches').doc(matchId).update({
        paymentStatus: 'completed',
        status: 'confirmed',
        paymentId: session.payment_intent,
        paidAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Payment confirmed for match: ${matchId}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const { matchId, amount, userEmail } = data;

  if (!matchId || !amount || !userEmail) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields'
    );
  }

  // In production, use the Stripe library
  // For now, return a mock session ID
  // You'll need to implement actual Stripe integration
  return {
    id: `cs_test_${Date.now()}`,
    url: null
  };
});

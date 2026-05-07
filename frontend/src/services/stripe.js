import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

export async function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);
  }
  return stripePromise;
}

export async function createCheckoutSession(matchId, amount, userEmail) {
  const response = await fetch('/.netlify/functions/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, amount, userEmail })
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return await response.json();
}

export async function redirectToCheckout(sessionId) {
  const stripe = await getStripe();
  return await stripe.redirectToCheckout({ sessionId });
}

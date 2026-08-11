import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { packageType, childName, userEmail } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Brak klucza STRIPE_SECRET_KEY w zmiennych środowiskowych!");
    return res.status(500).json({ error: "Brak skonfigurowanego klucza STRIPE_SECRET_KEY" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Przeliczenie kwot w groszach
  let amountInGrosze = 1200;
  if (packageType === '3_stories') amountInGrosze = 2900;
  if (packageType === '6_stories') amountInGrosze = 4900;
  if (packageType === '12_stories') amountInGrosze = 8900;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Podstawowa i bezbłędna metoda na start
      customer_email: userEmail || undefined,
      line_items: [{
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Pakiet Bajek - Malowana Opowieść`,
            description: `Spersonalizowana kolorowanka dla: ${childName || 'dziecka'}`,
          },
          unit_amount: amountInGrosze,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/?payment=success&package=${packageType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?payment=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Błąd tworzenia sesji Stripe:", error.message);
    return res.status(500).json({ error: error.message });
  }
}

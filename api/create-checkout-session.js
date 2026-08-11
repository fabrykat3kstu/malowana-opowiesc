const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { packageType, childName, userEmail } = req.body;

    let amountInGrosze = 2900; // default for 3 stories
    if (packageType === '1_story') amountInGrosze = 1200;
    else if (packageType === '3_stories') amountInGrosze = 2900;
    else if (packageType === '6_stories') amountInGrosze = 4900;
    else if (packageType === '12_stories') amountInGrosze = 8900;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [{
        price_data: {
          currency: 'pln',
          product_data: {
            name: `Pakiet Bajek - Malowana Opowieść (${packageType})`,
            description: `Spersonalizowana kolorowanka dla: ${childName}`,
          },
          unit_amount: amountInGrosze,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/?payment=success&package=${packageType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?payment=cancelled`,
      customer_email: userEmail || undefined,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: error.message || 'Błąd tworzenia sesji Stripe.' });
  }
};

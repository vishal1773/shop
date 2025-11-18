import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  const line_items = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.title,
        images: [`${req.protocol}://${req.get('host')}/${item.product.image}`],
      },
      unit_amount: item.product.price * 100,
    },
    quantity: item.qty,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
    metadata: {
      userId: req.user._id.toString(),
      shippingAddress: JSON.stringify(shippingAddress),
    },
  });

  res.json({ url: session.url });
});
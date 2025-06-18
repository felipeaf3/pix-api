
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.sthevamefelipe.com.br');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    const body = req.body;
    const nome = body.nome;
    const email = body.email;
    const celular = body.celular;
    const produto = body.produto;
    const valor = body.valor;

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        payer: { name: nome, email: email },
        items: [{ title: produto, quantity: 1, unit_price: Number(valor) }],
        payment_methods: {
          excluded_payment_types: [{ id: 'credit_card' }],
          default_payment_method_id: 'pix',
        },
      }),
    });

    const data = await response.json();

    res.status(200).json({
      qr_code_image: data.point_of_interaction.transaction_data.qr_code_base64,
      qr_code_text: data.point_of_interaction.transaction_data.qr_code,
    });

  } catch (error) {
    console.error('Erro ao criar PIX:', error);
    res.status(500).json({ error: 'Erro interno ao criar PIX' });
  }
}

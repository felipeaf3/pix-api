import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  const { titulo, valor, email } = req.body;

  if (!titulo || !valor || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios: titulo, valor e email.' });
  }

  try {
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': Date.now().toString()
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: titulo,
        payment_method_id: "pix",
        payer: {
          email: email,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error, message: data.message, cause: data.cause });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
      payment_type: data.payment_method_id,
      detail: data
    });

  } catch (err) {
    console.error('Erro ao criar pagamento Pix:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar Pix.' });
  }
}
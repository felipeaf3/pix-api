
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Permitir CORS só para seu domínio
  res.setHeader('Access-Control-Allow-Origin', 'https://www.sthevamefelipe.com.br');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { titulo, valor, nome, email, telefone } = req.body;

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        payment_method_id: 'pix',
        description: titulo,
        payer: {
          email: email,
          first_name: nome,
        },
      }),
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar pagamento PIX', detalhe: error.message });
  }
}

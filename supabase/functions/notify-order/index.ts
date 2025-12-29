import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderNotificationRequest {
  customer_email: string;
  customer_name?: string;
  order_id: string;
  items: OrderItem[];
  total: number;
  payment_method?: string;
  payment_status?: string;
  transaction_id?: string;
  shipping_address?: string;
  pix_key?: string;
}

const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = () => {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const generateOrderEmailHtml = (data: OrderNotificationRequest, isAdmin: boolean) => {
  const itemsList = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px;" />` : ''}
          <span style="color: #333;">${item.name}</span>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #E60000; font-weight: bold;">${formatPrice(item.price)}</td>
    </tr>
  `).join('');

  const paymentInfo = data.payment_method ? `
    <div style="margin: 16px 0; padding: 16px; background: #f9f9f9; border-radius: 8px;">
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #666;">Informações de Pagamento</h3>
      <p style="margin: 4px 0; color: #333;"><strong>Método:</strong> ${data.payment_method}</p>
      <p style="margin: 4px 0; color: #333;"><strong>Status:</strong> ${data.payment_status || 'Pendente'}</p>
      ${data.transaction_id ? `<p style="margin: 4px 0; color: #333;"><strong>ID da Transação:</strong> ${data.transaction_id}</p>` : ''}
      ${data.pix_key ? `<p style="margin: 4px 0; color: #333;"><strong>Chave PIX (Copia e Cola):</strong> ${data.pix_key}</p>` : ''}
    </div>
  ` : '';

  const shippingInfo = data.shipping_address ? `
    <div style="margin: 16px 0; padding: 16px; background: #f9f9f9; border-radius: 8px;">
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #666;">Endereço de Entrega</h3>
      <p style="margin: 0; color: #333;">${data.shipping_address}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: #E60000; padding: 20px; text-align: center;">
          <img src="https://www.balao.info/media/wysiwyg/balao500.png" alt="Balão da Informática" style="height: 50px; filter: brightness(0) invert(1);" />
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <h1 style="color: #333; font-size: 24px; margin: 0 0 8px;">
            ${isAdmin ? '🔔 Novo Pedido Recebido!' : 'Pedido Confirmado!'}
          </h1>
          <p style="color: #666; margin: 0 0 24px;">
            ${isAdmin 
              ? `Um novo pedido foi realizado em ${formatDate()}`
              : `Olá${data.customer_name ? ` ${data.customer_name}` : ''}, seu pedido foi recebido com sucesso!`
            }
          </p>
          
          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; color: #666;">
              <strong>Pedido:</strong> #${data.order_id.slice(0, 8).toUpperCase()}
            </p>
            <p style="margin: 4px 0 0; color: #666;">
              <strong>Data:</strong> ${formatDate()}
            </p>
            ${isAdmin && data.customer_email ? `<p style="margin: 4px 0 0; color: #666;"><strong>Cliente:</strong> ${data.customer_email}</p>` : ''}
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 12px; text-align: left; color: #666; font-size: 12px;">PRODUTO</th>
                <th style="padding: 12px; text-align: center; color: #666; font-size: 12px;">QTD</th>
                <th style="padding: 12px; text-align: right; color: #666; font-size: 12px;">PREÇO</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 16px 12px; text-align: right; font-size: 18px; font-weight: bold; color: #333;">TOTAL:</td>
                <td style="padding: 16px 12px; text-align: right; font-size: 20px; font-weight: bold; color: #E60000;">${formatPrice(data.total)}</td>
              </tr>
            </tfoot>
          </table>
          
          ${paymentInfo}
          ${shippingInfo}
          
          <!-- Contact -->
          <div style="text-align: center; margin: 32px 0; padding: 20px; background: #25D36610; border-radius: 8px;">
            <p style="margin: 0 0 8px; color: #333; font-weight: bold;">Dúvidas? Entre em contato!</p>
            <a href="https://wa.me/5519987510267" style="display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
              WhatsApp: (19) 98751-0267
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Balão da Informática - Obrigado pela preferência!
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "contato@balao.info", name: "Balão da Informática" },
      subject: subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to send email');
  }

  return { success: true };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderNotificationRequest = await req.json();
    
    console.log(`Sending order notification for order ${data.order_id} via SendGrid`);

    const results = {
      customer: { sent: false, error: null as string | null },
      admin: { sent: false, error: null as string | null },
    };

    // Send to customer (if email provided)
    if (data.customer_email) {
      try {
        const customerHtml = generateOrderEmailHtml(data, false);
        await sendEmail(
          data.customer_email,
          `Pedido Confirmado #${data.order_id.slice(0, 8).toUpperCase()} - Balão da Informática`,
          customerHtml
        );
        results.customer.sent = true;
        console.log(`Customer email sent to ${data.customer_email}`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to send customer email:', errorMessage);
        results.customer.error = errorMessage;
      }
    }

    // Wait 300ms to respect rate limit
    await new Promise(resolve => setTimeout(resolve, 300));

    // Send to admin
    try {
      const adminHtml = generateOrderEmailHtml(data, true);
      await sendEmail(
        "balaocastelo@gmail.com",
        `🔔 Novo Pedido #${data.order_id.slice(0, 8).toUpperCase()} - ${formatPrice(data.total)}`,
        adminHtml
      );
      results.admin.sent = true;
      console.log('Admin email sent');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to send admin email:', errorMessage);
      results.admin.error = errorMessage;
    }

    return new Response(JSON.stringify({
      success: results.customer.sent || results.admin.sent,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in notify-order function:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CampaignRequest {
  subject: string;
  content: string;
  recipient_emails: string[];
  products: Product[];
}

const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const generateEmailHtml = (content: string, products: Product[]) => {
  const productCards = products.map(product => `
    <div style="display: inline-block; width: 200px; margin: 10px; vertical-align: top; background: #f9f9f9; border-radius: 8px; overflow: hidden; text-align: center;">
      <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: contain; background: white; padding: 10px;" />
      <div style="padding: 12px;">
        <h3 style="margin: 0 0 8px; font-size: 14px; color: #333; line-height: 1.3; height: 36px; overflow: hidden;">${product.name}</h3>
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #E60000;">${formatPrice(product.price)}</p>
      </div>
    </div>
  `).join('');

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
          <img src="https://www.balao.info/media/wysiwyg/balao500.png" alt="Balão da Informática" style="height: 60px; filter: brightness(0) invert(1);" />
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            ${content.replace(/\n/g, '<br>')}
          </p>
          
          <!-- Products -->
          <div style="text-align: center; margin: 24px 0;">
            ${productCards}
          </div>
          
          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://www.balao.info" style="display: inline-block; background: #E60000; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Ver Todas as Ofertas
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Balão da Informática - Ofertas exclusivas para você!<br>
            <a href="https://wa.me/5519987510267" style="color: #25D366;">WhatsApp: (19) 98751-0267</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, content, recipient_emails, products }: CampaignRequest = await req.json();

    console.log(`Sending campaign to ${recipient_emails.length} recipients via SendGrid`);

    const html = generateEmailHtml(content, products);
    
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails sequentially with delay to respect rate limit
    for (let i = 0; i < recipient_emails.length; i++) {
      const email = recipient_emails[i];
      
      try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: "contato@balao.info", name: "Balão da Informática" },
            subject: subject,
            content: [{ type: "text/html", value: html }],
          }),
        });
          
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send to ${email}:`, errorText);
          results.failed++;
          results.errors.push(`${email}: ${errorText}`);
        } else {
          results.sent++;
          console.log(`Sent to ${email}`);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error sending to ${email}:`, err);
        results.failed++;
        results.errors.push(`${email}: ${errorMessage}`);
      }

      // Delay 300ms between emails
      if (i < recipient_emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log(`Campaign sent: ${results.sent} success, ${results.failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.slice(0, 10),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-campaign function:", error);
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

import { Resend } from "npm:resend@2.0.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 EDGE FUNCTION SIMPLIFICADA INICIADA");
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar API key
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("🔑 API Key status:", {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      starts_with_re: apiKey?.startsWith('re_') || false
    });

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: "RESEND_API_KEY não configurada",
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Parse body
    let requestData: any = {};
    try {
      const bodyText = await req.text();
      requestData = JSON.parse(bodyText);
      console.log("📦 Dados recebidos:", Object.keys(requestData));
    } catch (parseError) {
      console.error("❌ Erro parse JSON:", parseError);
      return new Response(JSON.stringify({
        success: false,
        message: "JSON inválido",
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // TESTE SIMPLES
    if (requestData.test || requestData.simple) {
      console.log("🧪 TESTE DETECTADO");
      return new Response(JSON.stringify({
        success: true,
        message: "✅ Edge Function funcionando!\nAPI Key configurada corretamente",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // ENVIO REAL - SUPER FLEXÍVEL
    console.log("📧 Processando envio real...");
    
    const resend = new Resend(apiKey);
    
    // Dados flexíveis
    const emailTo = requestData.to || 'admudrive2025@gavresorts.com.br';
    const emailSubject = requestData.subject || 'PDFs - Ficha de Negociação';
    const clientName = requestData.clientName || requestData.clientData?.nome || 'Cliente';
    
    // PDFs
    const pdfData1 = requestData.pdfData1 || '';
    const pdfData2 = requestData.pdfData2 || '';
    
    if (!pdfData1 && !pdfData2) {
      console.log("⚠️ Nenhum PDF fornecido, enviando email básico...");
    }

    // Preparar anexos (apenas se tiver PDFs)
    const attachments = [];
    
    if (pdfData1) {
      attachments.push({
        filename: 'Cadastro-Cliente.pdf',
        content: pdfData1,
        type: 'application/pdf',
        disposition: 'attachment'
      });
    }
    
    if (pdfData2) {
      attachments.push({
        filename: 'Negociacao-Cota.pdf',
        content: pdfData2,
        type: 'application/pdf',
        disposition: 'attachment'
      });
    }

    // Construir email
    const emailContent = {
      from: 'GAV Resorts <no-reply@gavresorts.com.br>',
      to: emailTo,
      subject: emailSubject,
      html: `
        <h2>📄 Documentos - GAV Resorts</h2>
        <p><strong>Cliente:</strong> ${clientName}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        
        ${attachments.length > 0 ? 
          `<p>📎 <strong>Anexos:</strong> ${attachments.length} arquivo(s) PDF</p>` : 
          '<p>📧 Email de teste/confirmação</p>'
        }
        
        <hr>
        <p><small>Enviado automaticamente pelo sistema GAV Resorts</small></p>
      `,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    console.log("📤 Enviando email...", {
      to: emailTo,
      subject: emailSubject,
      attachments: attachments.length
    });

    // Enviar email
    const emailResult = await resend.emails.send(emailContent);
    
    console.log("📧 Resultado do envio:", emailResult);

    if (emailResult.error) {
      console.error("❌ Erro do Resend:", emailResult.error);
      return new Response(JSON.stringify({
        success: false,
        message: `Erro do Resend: ${emailResult.error.message}`,
        error: emailResult.error,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Sucesso!
    return new Response(JSON.stringify({
      success: true,
      message: `✅ Email enviado com sucesso!\nID: ${emailResult.data?.id}`,
      messageId: emailResult.data?.id,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error: any) {
    console.error("❌ ERRO CRÍTICO:", error);
    return new Response(JSON.stringify({
      success: false,
      message: `Erro crítico: ${error.message}`,
      error: error.name,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

Deno.serve(handler);

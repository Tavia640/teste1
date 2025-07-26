import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPDFRequest {
  clientData: {
    nome?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    [key: string]: any;
  };
  fichaData: {
    liner?: string;
    closer?: string;
    tipoVenda?: string;
    [key: string]: any;
  };
  pdfData1: string; // base64 encoded PDF
  pdfData2: string; // base64 encoded PDF
}

interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 Send PDFs function iniciada");
  console.log("��� Método da requisição:", req.method);
  console.log("🔍 Headers da requisição:", Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📨 Processando requisição de envio de PDFs...");

    // Verificar variáveis de ambiente disponíveis
    console.log("🔍 Verificando variáveis de ambiente...");
    const envObject = Deno.env.toObject();
    const availableEnvVars = Object.keys(envObject).filter(key =>
      key.includes('RESEND') || key.includes('API') || key.includes('SUPABASE')
    );
    console.log("📋 Variáveis relacionadas disponíveis:", availableEnvVars);

    // Verificar se a API key está configurada
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("🔑 RESEND_API_KEY status:", {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      startsWithRe: apiKey?.startsWith('re_') || false,
      preview: apiKey ? `${apiKey.substring(0, 8)}...` : 'NÃO CONFIGURADA'
    });

    if (!apiKey) {
      console.error("❌ RESEND_API_KEY não configurada!");
      console.error("🔍 Todas as variáveis de ambiente:", Object.keys(envObject));

      const errorResponse: EmailResponse = {
        success: false,
        message: "❌ RESEND_API_KEY não configurada no Supabase.\n\n📋 Passos para configurar:\n1. Acesse o painel do Supabase\n2. Settings → Edge Functions\n3. Adicione: RESEND_API_KEY = sua_chave_do_resend",
        error: "RESEND_API_KEY não configurada",
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
      });
    }

    if (!apiKey.startsWith('re_')) {
      console.error("❌ RESEND_API_KEY parece estar incorreta! Deve começar com 're_'");
      const errorResponse: EmailResponse = {
        success: false,
        message: "❌ RESEND_API_KEY parece estar incorreta.\n\nA chave deve começar com 're_'\nVerifique se copiou a chave correta do painel do Resend.",
        error: "RESEND_API_KEY inválida",
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
      });
    }

    console.log("✅ RESEND_API_KEY parece estar configurada corretamente");

    // Inicializar Resend
    const resend = new Resend(apiKey);
    console.log("✅ Resend inicializado com sucesso");
    
    const requestData: SendPDFRequest | { test?: boolean } = await req.json();

    // Se é um teste de conectividade
    if ('test' in requestData && requestData.test) {
      console.log("🧪 Executando teste de conectividade...");

      const testResponse: EmailResponse = {
        success: true,
        message: "Sistema de email está funcionando. API Key configurada corretamente.",
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(testResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    const { clientData, fichaData, pdfData1, pdfData2 } = requestData as SendPDFRequest;

    // Validação rigorosa dos dados recebidos
    if (!clientData) {
      throw new Error("Dados do cliente são obrigatórios");
    }
    
    if (!fichaData) {
      throw new Error("Dados da negociação são obrigatórios");
    }
    
    if (!pdfData1 || !pdfData2) {
      throw new Error("Ambos os PDFs são obrigatórios");
    }

    if (!clientData.nome) {
      throw new Error("Nome do cliente é obrigatório");
    }

    console.log("✅ Dados validados:", {
      cliente: clientData.nome,
      temPdf1: !!pdfData1,
      temPdf2: !!pdfData2,
      sizePdf1: pdfData1.length,
      sizePdf2: pdfData2.length
    });

    // Limpar possível prefixo data:application/pdf;base64, dos PDFs
    const cleanPdf1 = pdfData1.startsWith('data:') ? pdfData1.split(',')[1] : pdfData1;
    const cleanPdf2 = pdfData2.startsWith('data:') ? pdfData2.split(',')[1] : pdfData2;

    // Validar se os PDFs não estão vazios
    if (cleanPdf1.length < 1000 || cleanPdf2.length < 1000) {
      throw new Error("Os PDFs parecem estar vazios ou corrompidos");
    }

    console.log("🔄 Preparando anexos para envio...");

    // Preparar anexos
    const attachments = [
      {
        filename: `Ficha_Cadastro_${clientData.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        content: cleanPdf1,
        contentType: 'application/pdf',
      },
      {
        filename: `Ficha_Negociacao_${clientData.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        content: cleanPdf2,
        contentType: 'application/pdf',
      },
    ];

    console.log("📧 Enviando email para admudrive2025@gavresorts.com.br...");

    // Construir o email
    const emailResponse = await resend.emails.send({
      from: "GAV Resorts <onboarding@resend.dev>",
      to: ["admudrive2025@gavresorts.com.br"],
      subject: `🏖️ Nova Ficha de Negociação - ${clientData.nome}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
              🏖️ GAV RESORTS
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
              Nova Ficha de Negociação Recebida
            </p>
          </div>

          <!-- Conteúdo Principal -->
          <div style="background-color: white; padding: 30px;">
            <!-- Dados do Cliente -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #0d1b2a; margin: 0 0 15px 0; font-size: 22px; border-bottom: 2px solid #58e1c1; padding-bottom: 8px;">
                👤 Dados do Cliente
              </h2>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #58e1c1;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 120px;">Nome:</td>
                    <td style="padding: 8px 0; color: #212529;">${clientData.nome || 'Não informado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #495057;">CPF:</td>
                    <td style="padding: 8px 0; color: #212529;">${clientData.cpf || 'Não informado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #495057;">Email:</td>
                    <td style="padding: 8px 0; color: #212529;">${clientData.email || 'Não informado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #495057;">Telefone:</td>
                    <td style="padding: 8px 0; color: #212529;">${clientData.telefone || 'Não informado'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Dados da Negociação -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #0d1b2a; margin: 0 0 15px 0; font-size: 22px; border-bottom: 2px solid #ffc107; padding-bottom: 8px;">
                🤝 Dados da Negociação
              </h2>
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #856404; width: 120px;">Liner:</td>
                    <td style="padding: 8px 0; color: #212529;">${fichaData.liner || 'Não informado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #856404;">Closer:</td>
                    <td style="padding: 8px 0; color: #212529;">${fichaData.closer || 'Não informado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #856404;">Tipo de Venda:</td>
                    <td style="padding: 8px 0; color: #212529;">${fichaData.tipoVenda || 'Não informado'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Anexos -->
            <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; margin-bottom: 25px;">
              <h3 style="color: #0c5460; margin: 0 0 10px 0; font-size: 18px;">
                📎 Documentos Anexados
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
                <li style="margin: 5px 0;">Ficha de Cadastro do Cliente</li>
                <li style="margin: 5px 0;">Ficha de Negociação Completa</li>
              </ul>
              <p style="margin: 15px 0 0 0; color: #0c5460; font-weight: bold;">
                ✅ Total: 2 documentos PDF anexados
              </p>
            </div>

            <!-- Status -->
            <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; text-align: center;">
              <p style="margin: 0; color: #155724; font-weight: bold; font-size: 16px;">
                ✅ Processamento Concluído com Sucesso!
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #dee2e6;">
            <p style="margin: 0; color: #6c757d; font-size: 12px;">
              📧 Email gerado automaticamente pelo Sistema GAV Resorts<br>
              📅 ${new Date().toLocaleString('pt-BR', { 
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      `,
      attachments: attachments
    });

    console.log("📊 Resposta do Resend:", emailResponse);

    if (emailResponse.error) {
      console.error("❌ Erro no Resend:", emailResponse.error);
      throw new Error(`Falha no envio do email: ${emailResponse.error.message}`);
    }

    if (!emailResponse.data?.id) {
      console.error("❌ Resposta inválida do Resend:", emailResponse);
      throw new Error("Resposta inválida do serviço de email");
    }

    console.log("✅ Email enviado com sucesso! ID:", emailResponse.data.id);

    const successResponse: EmailResponse = {
      success: true,
      message: "PDFs enviados com sucesso para admudrive2025@gavresorts.com.br",
      messageId: emailResponse.data.id,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ ERRO CRÍTICO na função send-pdfs:", error);
    console.error("📋 Stack trace:", error.stack);
    
    const errorResponse: EmailResponse = {
      success: false,
      message: error.message || "Erro interno do servidor",
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      },
    });
  }
};

serve(handler);

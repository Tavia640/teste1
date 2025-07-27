import { supabase } from '@/integrations/supabase/client';

interface EmailPayload {
  clientData?: any;
  fichaData?: any;
  pdfData1?: string;
  pdfData2?: string;
  to?: string;
  subject?: string;
}

class EmailServiceDirect {
  
  // Sistema de email extremamente simplificado - sem validações restritivas
  static async enviarEmailDireto(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
    console.log('🚀 SISTEMA DIRETO - Iniciando envio de email...');
    console.log('📦 Payload recebido:', {
      hasClientData: !!payload.clientData,
      hasFichaData: !!payload.fichaData,
      hasPdf1: !!payload.pdfData1,
      hasPdf2: !!payload.pdfData2,
      to: payload.to
    });

    try {
      // Preparar dados mínimos para envio
      const emailData = {
        // Dados obrigatórios mínimos
        to: payload.to || 'admudrive2025@gavresorts.com.br',
        subject: payload.subject || 'PDFs - Ficha de Negociação',
        
        // Dados do cliente (flexível)
        clientName: payload.clientData?.nome || 'Cliente',
        clientEmail: payload.clientData?.email || 'email@exemplo.com',
        
        // PDFs (obrigatórios)
        pdfData1: payload.pdfData1 || '',
        pdfData2: payload.pdfData2 || '',
        
        // Dados extras (opcionais)
        liner: payload.fichaData?.liner || '',
        closer: payload.fichaData?.closer || '',
        tipoVenda: payload.fichaData?.tipoVenda || '',
        
        // Metadados
        timestamp: new Date().toISOString(),
        simplified: true
      };

      console.log('📧 Enviando para Edge Function...');
      console.log('📊 Email data keys:', Object.keys(emailData));

      // Chamar Edge Function diretamente
      const response = await supabase.functions.invoke('send-pdfs', {
        body: emailData
      });

      console.log('📥 Resposta da Edge Function:', {
        error: response.error,
        data: response.data,
        hasData: !!response.data
      });

      // Verificar sucesso
      if (response.error) {
        console.error('❌ Erro na Edge Function:', response.error);
        
        // Tentar extrair mensagem de erro mais específica
        let errorMessage = 'Erro desconhecido no envio';
        
        if (response.error.message?.includes('non-2xx')) {
          errorMessage = 'Edge Function retornou erro HTTP';
        } else if (response.error.message) {
          errorMessage = response.error.message;
        }
        
        return {
          success: false,
          message: `❌ Falha no envio: ${errorMessage}`
        };
      }

      if (response.data && response.data.success) {
        return {
          success: true,
          message: `✅ Email enviado com sucesso!\n\n📧 Para: ${emailData.to}\n📄 PDFs anexados\n⏰ ${new Date().toLocaleString()}`
        };
      }

      return {
        success: false,
        message: 'Resposta inesperada da Edge Function'
      };

    } catch (error: any) {
      console.error('❌ Erro crítico no envio:', error);
      return {
        success: false,
        message: `❌ Erro crítico: ${error.message}`
      };
    }
  }

  // Teste super simples
  static async testarEmailDireto(): Promise<{ success: boolean; message: string }> {
    console.log('🧪 Teste direto do sistema de email...');
    
    try {
      const response = await supabase.functions.invoke('send-pdfs', {
        body: { test: true, simple: true }
      });

      console.log('📥 Resposta do teste:', response);

      if (response.error) {
        return {
          success: false,
          message: `❌ Teste falhou: ${response.error.message || 'Erro desconhecido'}`
        };
      }

      return {
        success: true,
        message: '✅ Teste direto funcionou! Sistema pronto.'
      };

    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erro no teste: ${error.message}`
      };
    }
  }

  // Fallback 1: Envio com dados mínimos
  static async enviarMinimo(pdfData1: string, pdfData2: string): Promise<{ success: boolean; message: string }> {
    console.log('🔄 Tentativa com dados mínimos...');
    
    return this.enviarEmailDireto({
      pdfData1,
      pdfData2,
      to: 'admudrive2025@gavresorts.com.br',
      subject: 'PDFs - Envio Automático',
      clientData: { nome: 'Cliente' },
      fichaData: { liner: '', closer: '' }
    });
  }

  // Fallback 2: Apenas alertar sucesso e baixar PDFs
  static async fallbackDownload(pdfData1: string, pdfData2: string): Promise<{ success: boolean; message: string }> {
    console.log('📥 Executando fallback de download...');
    
    try {
      // Criar links de download
      const link1 = document.createElement('a');
      link1.href = `data:application/pdf;base64,${pdfData1}`;
      link1.download = 'Cadastro-Cliente.pdf';
      link1.click();

      setTimeout(() => {
        const link2 = document.createElement('a');
        link2.href = `data:application/pdf;base64,${pdfData2}`;
        link2.download = 'Negociacao-Cota.pdf';
        link2.click();
      }, 500);

      return {
        success: true,
        message: '✅ PDFs baixados com sucesso!\n\n📥 2 arquivos foram salvos no seu computador:\n• Cadastro-Cliente.pdf\n• Negociacao-Cota.pdf\n\n📧 Envie-os manualmente para: admudrive2025@gavresorts.com.br'
      };

    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erro no download: ${error.message}`
      };
    }
  }
}

export { EmailServiceDirect };

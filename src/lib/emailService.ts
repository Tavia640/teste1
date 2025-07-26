import { supabase } from '@/integrations/supabase/client';
import { DadosCliente, DadosNegociacao } from './pdfGenerator';

export interface EmailPayload {
  clientData: DadosCliente;
  fichaData: DadosNegociacao;
  pdfData1: string;
  pdfData2: string;
}

export class EmailService {
  // Função para testar a conectividade do sistema de email
  static async testarConectividade(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Testando conectividade do sistema de email...');

      const response = await supabase.functions.invoke('send-pdfs', {
        body: { test: true }
      });

      console.log('📡 Resultado do teste:', response);

      if (response.error) {
        return {
          success: false,
          message: `Erro de conectividade: ${response.error.message}`
        };
      }

      return {
        success: true,
        message: '✅ Sistema de email está funcionando corretamente!\n\n🔑 Chave API do Resend configurada com sucesso\n📧 Pronto para enviar PDFs por email'
      };

    } catch (error: any) {
      console.error('❌ Erro no teste de conectividade:', error);
      return {
        success: false,
        message: `Erro no teste: ${error.message}`
      };
    }
  }
  static async enviarPDFs(payload: EmailPayload): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      console.log('🚀 Iniciando envio de PDFs via email...');
      console.log('📋 Dados do payload:', {
        temClientData: !!payload.clientData,
        temFichaData: !!payload.fichaData,
        nomeCliente: payload.clientData?.nome,
        tamanhoPdf1: payload.pdfData1?.length || 0,
        tamanhoPdf2: payload.pdfData2?.length || 0
      });

      // Validar dados antes do envio
      this.validarPayload(payload);

      // Invocar edge function com timeout
      console.log('🔄 Invocando edge function do Supabase...');
      const response = await supabase.functions.invoke('send-pdfs', {
        body: payload
      });

      console.log('📨 Resposta completa da edge function:', {
        error: response.error,
        data: response.data,
        status: response.status
      });

      // Verificar erros da edge function
      if (response.error) {
        console.error('❌ Erro da edge function:', response.error);
        console.error('📊 Dados de resposta:', response.data);

        // Melhor diagnóstico do erro
        if (response.error.message?.includes('Edge Function returned a non-2xx status code')) {
          // Se temos dados de erro na resposta, usar essa informação
          if (response.data && typeof response.data === 'object') {
            console.error('📋 Detalhes do erro do servidor:', response.data);
            const errorMsg = response.data.error || response.data.message || 'Erro interno';
            throw new Error(`❌ Erro do servidor: ${errorMsg}`);
          }
          throw new Error('❌ Erro interno no servidor de email. A Edge Function não conseguiu processar a requisição.');
        }

        throw new Error(`❌ Erro no envio: ${response.error.message}`);
      }

      // Verificar resposta de sucesso
      if (!response.data) {
        throw new Error('Resposta vazia da edge function');
      }

      if (!response.data.success) {
        console.error('❌ Falha reportada pela edge function:', response.data);
        throw new Error(response.data.error || response.data.message || 'Erro desconhecido no servidor');
      }

      console.log('✅ PDFs enviados com sucesso!');

      return {
        success: true,
        message: '✅ PDFs enviados com sucesso!\n\n📧 Destinatário: admudrive2025@gavresorts.com.br\n🆔 ID da mensagem: ' + (response.data.messageId || 'Não disponível'),
        messageId: response.data.messageId
      };

    } catch (error: any) {
      console.error('❌ Erro no envio de PDFs:', error);
      console.error('📚 Stack trace completo:', error.stack);

      // Tratamento de erros específicos
      let errorMessage = 'Erro desconhecido no envio de PDFs';

      if (error.message?.includes('RESEND_API_KEY')) {
        errorMessage = 'Problema com a chave API do Resend. Verifique se a chave está correta e tem as permissões necessárias.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
      } else if (error.message?.includes('non-2xx status code')) {
        errorMessage = 'Erro interno no servidor de email. Verifique as configurações da API key do Resend no painel do Supabase.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }
  
  private static validarPayload(payload: EmailPayload): void {
    if (!payload.clientData) {
      throw new Error('Dados do cliente são obrigatórios');
    }
    
    if (!payload.fichaData) {
      throw new Error('Dados da negociação são obrigatórios');
    }
    
    if (!payload.pdfData1 || !payload.pdfData2) {
      throw new Error('PDFs são obrigatórios para o envio');
    }
    
    if (!payload.clientData.nome) {
      throw new Error('Nome do cliente é obrigatório');
    }
    
    // Validar se os PDFs não estão vazios (devem ter conteúdo base64 válido)
    const minPdfSize = 1000; // Tamanho mínimo esperado para um PDF válido
    
    if (payload.pdfData1.length < minPdfSize) {
      throw new Error('PDF de cadastro parece estar vazio ou corrompido');
    }
    
    if (payload.pdfData2.length < minPdfSize) {
      throw new Error('PDF de negociação parece estar vazio ou corrompido');
    }
    
    console.log('✅ Payload validado com sucesso');
  }
}

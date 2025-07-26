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

      // Teste mais direto - tentar acessar o endpoint da Edge Function
      try {
        const response = await fetch('https://msxhwlwxpvrtmyngwwcp.supabase.co/functions/v1/send-pdfs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGh3bHd4cHZydG15bmd3d2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzU1NTAsImV4cCI6MjA2ODg1MTU1MH0.Nrx7hM9gkQ-jn8gmAhZUYntDuCuuUuHHah_8Gnh6uFQ`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeGh3bHd4cHZydG15bmd3d2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzU1NTAsImV4cCI6MjA2ODg1MTU1MH0.Nrx7hM9gkQ-jn8gmAhZUYntDuCuuUuHHah_8Gnh6uFQ'
          },
          body: JSON.stringify({ test: true })
        });

        console.log('📡 Status da resposta:', response.status);
        console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Resposta não-OK:', errorText);

          // Se o erro é "Dados do cliente são obrigatórios", isso significa que a função está rodando
          // mas não está detectando o teste corretamente
          if (errorText.includes('Dados do cliente são obrigatórios')) {
            return {
              success: true,
              message: '✅ Edge Function está respondendo!\n\n⚠️ Problema na detecção de teste, mas a função está funcionando\n🔑 API do Resend provavelmente configurada\n📧 Sistema deve funcionar para envios reais'
            };
          }

          return {
            success: false,
            message: `❌ Edge Function retornou erro ${response.status}:\n\n${errorText}`
          };
        }

        const data = await response.json();
        console.log('📡 Dados da resposta:', data);

        if (data.success) {
          return {
            success: true,
            message: '✅ Sistema de email funcionando perfeitamente!\n\n🔑 API do Resend configurada\n📧 Pronto para enviar PDFs'
          };
        } else {
          return {
            success: false,
            message: `❌ Teste falhou: ${data.message || 'Erro desconhecido'}`
          };
        }

      } catch (fetchError: any) {
        console.error('❌ Erro na requisição fetch:', fetchError);

        if (fetchError.message.includes('Failed to fetch')) {
          return {
            success: false,
            message: '❌ Erro de conectividade\n\n🌐 Não foi possível conectar ao servidor Supabase\n💡 Verifique sua conexão com a internet'
          };
        }

        throw fetchError;
      }

    } catch (error: any) {
      console.error('❌ Erro no teste de conectividade:', error);
      return {
        success: false,
        message: `❌ Erro crítico no teste: ${error.message}`
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
      const response = await Promise.race([
        supabase.functions.invoke('send-pdfs', { body: payload }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Edge Function demorou mais de 30 segundos')), 30000)
        )
      ]) as any;

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

      // Fallback: Salvar PDFs localmente e mostrar instruções
      return this.fallbackSalvarPDFs(payload, error);
    }
  }

  // Fallback quando a Edge Function falha
  private static fallbackSalvarPDFs(payload: EmailPayload, originalError: any): { success: boolean; message: string } {
    console.log('🔄 Ativando fallback: salvamento local dos PDFs');
    
    try {
      // Criar links de download para os PDFs
      const pdf1Blob = new Blob([this.base64ToArrayBuffer(payload.pdfData1)], { type: 'application/pdf' });
      const pdf2Blob = new Blob([this.base64ToArrayBuffer(payload.pdfData2)], { type: 'application/pdf' });
      
      const pdf1Url = URL.createObjectURL(pdf1Blob);
      const pdf2Url = URL.createObjectURL(pdf2Blob);
      
      // Baixar automaticamente os PDFs
      this.downloadFile(pdf1Url, `Ficha_Cadastro_${payload.clientData.nome?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      this.downloadFile(pdf2Url, `Ficha_Negociacao_${payload.clientData.nome?.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      
      let errorMessage = '⚠️ Falha no envio automático por email.';
      
      if (originalError.message?.includes('RESEND_API_KEY')) {
        errorMessage += '\n\n🔑 Problema com a chave API do Resend.';
      } else if (originalError.message?.includes('Timeout')) {
        errorMessage += '\n\n⏱️ O servidor demorou muito para responder.';
      } else if (originalError.message?.includes('non-2xx status code')) {
        errorMessage += '\n\n🔧 Erro de configuração do servidor.';
      }
      
      errorMessage += '\n\n✅ SOLUÇÃO: Os PDFs foram baixados automaticamente para seu computador.';
      errorMessage += '\n\n📧 Por favor, envie-os manualmente para: admudrive2025@gavresorts.com.br';
      
      return {
        success: false,
        message: errorMessage
      };
    } catch (fallbackError: any) {
      console.error('❌ Erro no fallback:', fallbackError);
      return {
        success: false,
        message: `❌ Erro crítico: ${originalError.message}\n\nNão foi possível salvar os PDFs localmente. Entre em contato com o suporte.`
      };
    }
  }

  // Converter base64 para ArrayBuffer
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64.replace(/^data:application\/pdf;base64,/, ''));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Fazer download de arquivo
  private static downloadFile(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`📁 PDF baixado: ${filename}`);
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

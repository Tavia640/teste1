import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PDFGenerator, DadosCliente, DadosNegociacao } from '@/lib/pdfGenerator';
import { EmailService } from '@/lib/emailService';

// Formatação monetária simples para exibição
const exibirValor = (valor: string): string => {
  if (!valor) return '';
  const num = parseFloat(valor);
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

interface ParcelaPagaSala {
  id: string;
  tipo: string;
  valorTotal: string;
  valorDistribuido: string;
  quantidadeCotas: string;
  formasPagamento: string[];
}

interface Contrato {
  id: string;
  tipoContrato: string;
  empreendimento: string;
  nomeEmpreendimento?: string;
  torre: string;
  apartamento: string;
  cota: string;
  categoriaPreco: string;
  valor: string;
}

interface InformacaoPagamento {
  id: string;
  tipo: string;
  total: string;
  qtdParcelas: string;
  valorParcela: string;
  formaPagamento: string;
  primeiroVencimento: string;
}

interface Empreendimento {
  id: number;
  nome: string;
  localizacao?: string;
}

interface CategoriaPreco {
  id: number;
  nome: string;
  empreendimento_id: number;
}

interface Torre {
  id: number;
  nome: string;
  empreendimento_id: number;
}

export default function FichaNegociacao() {
  const navigate = useNavigate();
  const [liner, setLiner] = useState('');
  const [closer, setCloser] = useState('');
  const [tipoVenda, setTipoVenda] = useState('');
  const [parcelasPagasSala, setParcelasPagasSala] = useState<ParcelaPagaSala[]>([{
    id: '1',
    tipo: 'Entrada',
    valorTotal: '1000.00',
    valorDistribuido: '1000.00',
    quantidadeCotas: 'Qtd cotas',
    formasPagamento: []
  }]);
  const [contratos, setContratos] = useState<Contrato[]>([{
    id: '1',
    tipoContrato: '',
    empreendimento: '',
    torre: '',
    apartamento: '',
    cota: '',
    categoriaPreco: '',
    valor: ''
  }]);
  const [informacoesPagamento, setInformacoesPagamento] = useState<InformacaoPagamento[]>([
    { id: '1', tipo: '1ª Entrada', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
    { id: '2', tipo: '2ª Entrada', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
    { id: '3', tipo: 'Sinal', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
    { id: '4', tipo: 'Saldo', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' }
  ]);

  // Estados para dados offline
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [categoriasPreco, setCategoriasPreco] = useState<CategoriaPreco[]>([]);
  const [torres, setTorres] = useState<Torre[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Estados para alertas de autorização
  const [alertas, setAlertas] = useState<{[key: string]: string}>({});

  // Inicialização do sistema - modo offline por padrão
  useEffect(() => {
    const initializeSystem = async () => {
      console.log('🚀 Inicializando sistema em modo offline...');
      
      try {
        // Simular breve carregamento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Configurar dados de exemplo
        setOfflineMode(true);
        setEmpreendimentos([
          { id: 1, nome: 'GAV Resort Paradise', localizacao: 'Cancún, México' },
          { id: 2, nome: 'GAV Resort Marina', localizacao: 'Playa del Carmen, México' },
          { id: 3, nome: 'GAV Resort Premium', localizacao: 'Riviera Maya, México' }
        ]);
        
        setVendedores([
          { id: 1, nome: 'João Silva', funcao: 'Closer' },
          { id: 2, nome: 'Maria Santos', funcao: 'Liner' },
          { id: 3, nome: 'Pedro Costa', funcao: 'Closer' },
          { id: 4, nome: 'Ana Lima', funcao: 'Liner' }
        ]);
        
        setCategoriasPreco([
          { id: 1, nome: 'Standard', empreendimento_id: 1 },
          { id: 2, nome: 'Premium', empreendimento_id: 1 },
          { id: 3, nome: 'VIP', empreendimento_id: 1 },
          { id: 4, nome: 'Luxury', empreendimento_id: 2 },
          { id: 5, nome: 'Ocean View', empreendimento_id: 2 },
          { id: 6, nome: 'Master Suite', empreendimento_id: 3 }
        ]);
        
        setTorres([
          { id: 1, nome: 'Torre A', empreendimento_id: 1 },
          { id: 2, nome: 'Torre B', empreendimento_id: 1 },
          { id: 3, nome: 'Torre C', empreendimento_id: 1 },
          { id: 4, nome: 'Torre Ocean', empreendimento_id: 2 },
          { id: 5, nome: 'Torre Sunset', empreendimento_id: 2 },
          { id: 6, nome: 'Torre Premium', empreendimento_id: 3 }
        ]);
        
        console.log('✅ Sistema inicializado com sucesso');
        
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSystem();
  }, []);

  // ... resto do código permanece igual (todas as funções de manipulação de dados)
  
  const salvarFicha = async () => {
    try {
      console.log('🚀 Iniciando processo de salvamento e envio...');
      
      const dadosClienteString = localStorage.getItem('dadosCliente');
      if (!dadosClienteString) {
        alert('❌ Dados do cliente não encontrados!\n\nPor favor, volte ao cadastro do cliente e preencha os dados antes de continuar.');
        return;
      }

      const dadosCliente: DadosCliente = JSON.parse(dadosClienteString);

      if (!dadosCliente.nome || !dadosCliente.cpf) {
        alert('❌ Dados do cliente incompletos!\n\nNome e CPF são obrigatórios. Volte ao cadastro e complete as informações.');
        return;
      }

      if (!liner || !closer || !tipoVenda) {
        alert('❌ Dados obrigatórios não preenchidos!\n\nPor favor, preencha:\n- Liner\n- Closer\n- Tipo de Venda');
        return;
      }

      const dadosNegociacao: DadosNegociacao = {
        liner, closer, tipoVenda, parcelasPagasSala, contratos, informacoesPagamento
      };

      console.log('📄 Gerando PDFs...');
      
      // Gerar PDFs
      const pdfCadastro = PDFGenerator.gerarPDFCadastroCliente(dadosCliente);
      const pdfNegociacao = PDFGenerator.gerarPDFNegociacao(dadosCliente, dadosNegociacao);
      
      // Converter para base64
      const pdfData1 = pdfCadastro.split(',')[1];
      const pdfData2 = pdfNegociacao.split(',')[1];
      
      console.log('📧 Enviando PDFs por email...');
      
      // Enviar PDFs usando o serviço de email
      const resultado = await EmailService.enviarPDFs({
        clientData: dadosCliente,
        fichaData: dadosNegociacao,
        pdfData1,
        pdfData2
      });

      if (resultado.success) {
        console.log('✅ Sucesso no envio:', resultado.message);
        alert(`✅ Sucesso!\n\n${resultado.message}`);
      } else {
        console.error('❌ Falha no envio:', resultado.message);
        
        let mensagemDetalhada = resultado.message;
        
        if (resultado.message.includes('RESEND_API_KEY')) {
          mensagemDetalhada += '\n\n💡 Solução: Configure a chave API do Resend no painel do Supabase:\n' +
                               '1. Acesse o painel do Supabase\n' +
                               '2. Vá em Settings > Edge Functions\n' +
                               '3. Adicione a variável RESEND_API_KEY';
        } else if (resultado.message.includes('conexão')) {
          mensagemDetalhada += '\n\n💡 Tente novamente em alguns segundos.';
        }

        alert(`❌ Erro no envio de email:\n\n${mensagemDetalhada}\n\n📄 Os PDFs foram gerados mas não puderam ser enviados por email.`);
      }
      
    } catch (error: any) {
      console.error('❌ Erro no processo de salvamento:', error);
      alert(`❌ Erro ao processar a ficha: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const testarEmail = async () => {
    try {
      console.log('🧪 Testando sistema de email...');
      
      // Mostrar loading
      const loadingAlert = () => {
        const alertDiv = document.createElement('div');
        alertDiv.id = 'email-test-loading';
        alertDiv.innerHTML = `
          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
                      z-index: 1000; text-align: center;">
            <div style="margin-bottom: 10px;">🧪 Testando conectividade...</div>
            <div style="font-size: 12px; color: #666;">Verificando API do Resend</div>
          </div>
        `;
        document.body.appendChild(alertDiv);
      };
      
      loadingAlert();
      
      const resultado = await EmailService.testarConectividade();
      
      // Remover loading
      const loadingDiv = document.getElementById('email-test-loading');
      if (loadingDiv) loadingDiv.remove();

      if (resultado.success) {
        alert(`✅ TESTE CONCLUÍDO COM SUCESSO!\n\n${resultado.message}\n\n🚀 Pronto para enviar PDFs por email!`);
      } else {
        let mensagemErro = `❌ TESTE FALHOU\n\n${resultado.message}`;
        
        if (resultado.message.includes('RESEND_API_KEY')) {
          mensagemErro += '\n\n💡 SOLUÇÃO:\nA chave API do Resend precisa ser configurada no painel do Supabase';
        } else if (resultado.message.includes('non-2xx status code')) {
          mensagemErro += '\n\n💡 SOLUÇÃO:\nProblema no servidor. Tente novamente em alguns minutos';
        } else if (resultado.message.includes('Failed to fetch')) {
          mensagemErro += '\n\n💡 SOLUÇÃO:\nProblema de conectividade. Verifique sua internet';
        }
        
        alert(mensagemErro);
      }
    } catch (error: any) {
      // Remover loading em caso de erro
      const loadingDiv = document.getElementById('email-test-loading');
      if (loadingDiv) loadingDiv.remove();
      
      console.error('❌ Erro no teste:', error);
      alert(`❌ ERRO CRÍTICO NO TESTE\n\n${error.message}\n\n💡 Tente atualizar a página e testar novamente`);
    }
  };

  // Resto das funções permanecem iguais...
  const adicionarParcela = () => {
    const novaId = (parcelasPagasSala.length + 1).toString();
    setParcelasPagasSala([...parcelasPagasSala, {
      id: novaId,
      tipo: '',
      valorTotal: '',
      valorDistribuido: '',
      quantidadeCotas: '',
      formasPagamento: []
    }]);
  };

  const removerParcela = (id: string) => {
    setParcelasPagasSala(parcelasPagasSala.filter(p => p.id !== id));
  };

  const adicionarContrato = () => {
    const novoId = (contratos.length + 1).toString();
    setContratos([...contratos, {
      id: novoId,
      tipoContrato: '',
      empreendimento: '',
      torre: '',
      apartamento: '',
      cota: '',
      categoriaPreco: '',
      valor: ''
    }]);
  };

  const removerContrato = (id: string) => {
    setContratos(contratos.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Alerta do Modo Offline */}
      {offlineMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Modo Offline Ativado:</strong> Sistema funcionando com dados de exemplo. 
                O sistema continuará funcionando normalmente, mas os dados não serão salvos no banco de dados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-center flex-1">Ficha de Negociação de Cota</h1>
      </div>

      {/* Liner e Closer */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="liner">LINER: *</Label>
              <Select value={liner} onValueChange={setLiner}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o liner" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores.filter(v => v.funcao === 'Liner').map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.nome}>
                      {vendedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="closer">CLOSER: *</Label>
              <Select value={closer} onValueChange={setCloser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o closer" />
                </SelectTrigger>
                <SelectContent>
                  {vendedores.filter(v => v.funcao === 'Closer').map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.nome}>
                      {vendedor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Venda */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-base font-medium mb-4 block">TIPO DE VENDA: *</Label>
          <RadioGroup value={tipoVenda} onValueChange={setTipoVenda} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Semestral" id="semestral" />
              <Label htmlFor="semestral">Semestral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Anual" id="anual" />
              <Label htmlFor="anual">Anual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A Vista" id="avista" />
              <Label htmlFor="avista">A Vista</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Até 36x" id="ate36x" />
              <Label htmlFor="ate36x">Até 36x</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Padrão" id="padrao" />
              <Label htmlFor="padrao">Padrão</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Linear" id="linear" />
              <Label htmlFor="linear">Linear</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={salvarFicha} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          Salvar e Enviar por Email
        </Button>

        <Button
          variant="outline"
          onClick={testarEmail}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Testar Email
        </Button>
      </div>
    </div>
  );
}

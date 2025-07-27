import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { ArrowLeft, Download, Mail, TestTube } from 'lucide-react';
import { PDFGenerator, DadosCliente, DadosNegociacao } from '@/lib/pdfGenerator';
import { EmailService } from '@/lib/emailService';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  liner: z.string().min(2, 'Liner é obrigatório'),
  closer: z.string().min(2, 'Closer é obrigatório'),
  tipoVenda: z.string().min(1, 'Tipo de venda é obrigatório'),
  // Parcelas pagas em sala
  parcelasPagasSala: z.array(z.object({
    tipo: z.string(),
    valorTotal: z.string().default(''),
    valorDistribuido: z.string().default(''),
    quantidadeCotas: z.string().default(''),
    formasPagamento: z.array(z.string()).default([])
  })).default([
    { tipo: 'Entrada', valorTotal: '', valorDistribuido: '', quantidadeCotas: '', formasPagamento: [] },
    { tipo: 'Sinal', valorTotal: '', valorDistribuido: '', quantidadeCotas: '', formasPagamento: [] },
    { tipo: 'Saldo', valorTotal: '', valorDistribuido: '', quantidadeCotas: '', formasPagamento: [] }
  ]),
  // Contratos
  contratos: z.array(z.object({
    empreendimento: z.string().default(''),
    nomeEmpreendimento: z.string().default(''),
    categoriaPreco: z.string().default(''),
    valor: z.string().default(''),
    torre: z.string().default(''),
    apartamento: z.string().default(''),
    cota: z.string().default('')
  })).default([
    { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' },
    { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' },
    { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' },
    { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' }
  ]),
  // Informações de pagamento
  informacoesPagamento: z.array(z.object({
    tipo: z.string(),
    total: z.string().default(''),
    qtdParcelas: z.string().default(''),
    valorParcela: z.string().default(''),
    formaPagamento: z.string().default(''),
    primeiroVencimento: z.string().default('')
  })).default([
    { tipo: '1ª Entrada', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
    { tipo: '2ª Entrada', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
    { tipo: 'Entrada Restante', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
    { tipo: 'Sinal', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
    { tipo: 'Saldo', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' }
  ])
});

const FichaNegociacao = () => {
  const navigate = useNavigate();
  const [dadosCliente, setDadosCliente] = useState<DadosCliente | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [empreendimentos, setEmpreendimentos] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      liner: '',
      closer: '',
      tipoVenda: '',
      parcelasPagasSala: [
        { tipo: 'Entrada', valorTotal: '', valorDistribuido: '', quantidadeCotas: '', formasPagamento: [] },
        { tipo: 'Sinal', valorTotal: '', valorDistribuido: '', quantidadeCotas: '', formasPagamento: [] },
        { tipo: 'Saldo', valorTotal: '', valorDistribuido: '', quantidadeCotas: '', formasPagamento: [] }
      ],
      contratos: [
        { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' },
        { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' },
        { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' },
        { empreendimento: '', nomeEmpreendimento: '', categoriaPreco: '', valor: '', torre: '', apartamento: '', cota: '' }
      ],
      informacoesPagamento: [
        { tipo: '1ª Entrada', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
        { tipo: '2ª Entrada', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
        { tipo: 'Entrada Restante', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
        { tipo: 'Sinal', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' },
        { tipo: 'Saldo', total: '', qtdParcelas: '', valorParcela: '', formaPagamento: '', primeiroVencimento: '' }
      ]
    },
  });

  useEffect(() => {
    // Carregar dados do cliente do localStorage
    const dadosClienteString = localStorage.getItem('dadosCliente');
    if (dadosClienteString) {
      try {
        const dados = JSON.parse(dadosClienteString);
        setDadosCliente(dados);
        console.log('✅ Dados do cliente carregados:', dados);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do cliente:', error);
        toast.error('Erro ao carregar dados do cliente');
      }
    } else {
      console.warn('⚠️ Nenhum dado de cliente encontrado no localStorage');
      toast.error('Dados do cliente não encontrados. Redirecionando...');
      navigate('/cadastro-cliente');
    }

    // Carregar empreendimentos
    carregarEmpreendimentos();
  }, [navigate]);

  const carregarEmpreendimentos = async () => {
    try {
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar empreendimentos:', error);
        return;
      }

      setEmpreendimentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error);
    }
  };

  const handleTestarEmail = async () => {
    setIsTestingEmail(true);
    try {
      console.log('🧪 Iniciando teste de conectividade do email...');
      const resultado = await EmailService.testarConectividade();
      
      if (resultado.success) {
        toast.success(resultado.message);
      } else {
        toast.error(resultado.message);
      }
    } catch (error: any) {
      console.error('❌ Erro no teste de email:', error);
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleGerarPDFs = async () => {
    if (!dadosCliente) {
      toast.error('Dados do cliente não encontrados');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      console.log('📄 Iniciando geração de PDFs...');
      
      const formData = form.getValues();
      console.log('📋 Dados do formulário:', formData);

      // Preparar dados da negociação
      const dadosNegociacao: DadosNegociacao = {
        liner: formData.liner,
        closer: formData.closer,
        tipoVenda: formData.tipoVenda,
        parcelasPagasSala: formData.parcelasPagasSala,
        contratos: formData.contratos,
        informacoesPagamento: formData.informacoesPagamento
      };

      console.log('🔄 Gerando PDF de cadastro...');
      const pdfCadastro = PDFGenerator.gerarPDFCadastroCliente(dadosCliente);
      console.log('✅ PDF de cadastro gerado, tamanho:', pdfCadastro.length);

      console.log('🔄 Gerando PDF de negociação...');
      const pdfNegociacao = PDFGenerator.gerarPDFNegociacao(dadosCliente, dadosNegociacao);
      console.log('✅ PDF de negociação gerado, tamanho:', pdfNegociacao.length);

      // Fazer download dos PDFs
      const linkCadastro = document.createElement('a');
      linkCadastro.href = pdfCadastro;
      linkCadastro.download = `Ficha_Cadastro_${dadosCliente.nome?.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente'}.pdf`;
      linkCadastro.click();

      const linkNegociacao = document.createElement('a');
      linkNegociacao.href = pdfNegociacao;
      linkNegociacao.download = `Ficha_Negociacao_${dadosCliente.nome?.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente'}.pdf`;
      linkNegociacao.click();

      toast.success('PDFs gerados e baixados com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao gerar PDFs:', error);
      toast.error(`Erro ao gerar PDFs: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!dadosCliente) {
      toast.error('Dados do cliente não encontrados');
      return;
    }

    setIsSendingEmail(true);
    try {
      console.log('📧 Iniciando envio de email...');
      
      const formData = form.getValues();
      
      // Preparar dados da negociação
      const dadosNegociacao: DadosNegociacao = {
        liner: formData.liner,
        closer: formData.closer,
        tipoVenda: formData.tipoVenda,
        parcelasPagasSala: formData.parcelasPagasSala,
        contratos: formData.contratos,
        informacoesPagamento: formData.informacoesPagamento
      };

      console.log('🔄 Gerando PDFs para envio...');
      
      // Gerar PDFs em formato base64 limpo
      const pdfCadastroDataUri = PDFGenerator.gerarPDFCadastroCliente(dadosCliente);
      const pdfNegociacaoDataUri = PDFGenerator.gerarPDFNegociacao(dadosCliente, dadosNegociacao);
      
      // Extrair apenas o base64 (remover o prefixo data:application/pdf;base64,)
      const pdfCadastroBase64 = pdfCadastroDataUri.split(',')[1];
      const pdfNegociacaoBase64 = pdfNegociacaoDataUri.split(',')[1];
      
      console.log('📊 Tamanhos dos PDFs:', {
        cadastro: pdfCadastroBase64.length,
        negociacao: pdfNegociacaoBase64.length
      });

      // Validar se os PDFs foram gerados corretamente
      if (!pdfCadastroBase64 || pdfCadastroBase64.length < 1000) {
        throw new Error('PDF de cadastro não foi gerado corretamente');
      }
      
      if (!pdfNegociacaoBase64 || pdfNegociacaoBase64.length < 1000) {
        throw new Error('PDF de negociação não foi gerado corretamente');
      }

      // Preparar payload para envio
      const emailPayload = {
        clientData: dadosCliente,
        fichaData: dadosNegociacao,
        pdfData1: pdfCadastroBase64,
        pdfData2: pdfNegociacaoBase64
      };

      console.log('📤 Enviando email...');
      const resultado = await EmailService.enviarPDFs(emailPayload);
      
      if (resultado.success) {
        toast.success(resultado.message);
        console.log('✅ Email enviado com sucesso!', resultado.messageId);
      } else {
        toast.error(resultado.message);
        console.error('❌ Falha no envio:', resultado.message);
      }
    } catch (error: any) {
      console.error('❌ Erro ao enviar email:', error);
      toast.error(`Erro ao enviar email: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Dados da negociação:', values);
    toast.success('Ficha de negociação salva com sucesso!');
  };

  if (!dadosCliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Carregando dados do cliente...</p>
          <Button onClick={() => navigate('/cadastro-cliente')}>
            Ir para Cadastro de Cliente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cadastro-cliente')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <CardTitle className="text-2xl font-bold">
              Ficha de Negociação
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleTestarEmail}
                disabled={isTestingEmail}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isTestingEmail ? 'Testando...' : 'Testar Email'}
              </Button>
              <Button
                variant="outline"
                onClick={handleGerarPDFs}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingPDF ? 'Gerando...' : 'Baixar PDFs'}
              </Button>
              <Button
                onClick={handleEnviarEmail}
                disabled={isSendingEmail}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {isSendingEmail ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Cliente: <strong>{dadosCliente.nome}</strong> | CPF: <strong>{dadosCliente.cpf}</strong>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados básicos da negociação */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados da Negociação</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="liner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Liner</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="closer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closer</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tipoVenda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Venda</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="padrao">Padrão</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                            <SelectItem value="a-vista">À Vista</SelectItem>
                            <SelectItem value="ate-36x">Até 36x</SelectItem>
                            <SelectItem value="linear">Linear</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Parcelas Pagas em Sala */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Parcelas Pagas em Sala</h3>
                
                {form.watch('parcelasPagasSala').map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <Input 
                        value={form.watch(`parcelasPagasSala.${index}.tipo`)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`parcelasPagasSala.${index}.valorTotal`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Total</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`parcelasPagasSala.${index}.quantidadeCotas`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd. Cotas</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`parcelasPagasSala.${index}.valorDistribuido`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Distribuído</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Contratos */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Contratos</h3>
                
                {form.watch('contratos').map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`contratos.${index}.empreendimento`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empreendimento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {empreendimentos.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contratos.${index}.torre`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Torre</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contratos.${index}.apartamento`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apartamento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contratos.${index}.cota`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cota</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`contratos.${index}.valor`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              {/* Informações de Pagamento */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Informações de Pagamento</h3>
                
                {form.watch('informacoesPagamento').map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <Input 
                        value={form.watch(`informacoesPagamento.${index}.tipo`)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`informacoesPagamento.${index}.total`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`informacoesPagamento.${index}.qtdParcelas`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd. Parcelas</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="0" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`informacoesPagamento.${index}.valorParcela`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Parcela</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="R$ 0,00" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`informacoesPagamento.${index}.formaPagamento`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Forma Pagamento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`informacoesPagamento.${index}.primeiroVencimento`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1º Vencimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <Button type="submit" className="w-full md:w-auto px-12">
                  Salvar Ficha de Negociação
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FichaNegociacao;
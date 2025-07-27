import jsPDF from 'jspdf';

export interface DadosCliente {
  nome?: string;
  cpf?: string;
  rg?: string;
  orgaoEmissor?: string;
  estadoEmissor?: string;
  profissao?: string;
  dataNascimento?: string;
  estadoCivil?: string;
  email?: string;
  telefone?: string;
  logradouro?: string;
  numeroEndereco?: string;
  bairro?: string;
  complemento?: string;
  cep?: string;
  cidade?: string;
  ufEndereco?: string;
  nomeConjuge?: string;
  cpfConjuge?: string;
  rgConjuge?: string;
  orgaoEmissorConjuge?: string;
  estadoEmissorConjuge?: string;
  profissaoConjuge?: string;
  emailConjuge?: string;
  telefoneConjuge?: string;
  [key: string]: any;
}

export interface DadosNegociacao {
  liner?: string;
  closer?: string;
  tipoVenda?: string;
  parcelasPagasSala: Array<{
    tipo: string;
    valorTotal: string;
    valorDistribuido: string;
    quantidadeCotas: string;
    formasPagamento: string[];
  }>;
  contratos: Array<{
    empreendimento: string;
    nomeEmpreendimento?: string;
    categoriaPreco: string;
    valor: string;
    torre?: string;
    apartamento?: string;
    cota?: string;
    [key: string]: any;
  }>;
  informacoesPagamento: Array<{
    tipo: string;
    total: string;
    qtdParcelas: string;
    valorParcela: string;
    formaPagamento: string;
    primeiroVencimento: string;
  }>;
}

export class PDFGenerator {
  // Função para validar dados antes da geração
  private static validarDados(dadosCliente: DadosCliente, dadosNegociacao?: DadosNegociacao): void {
    if (!dadosCliente) {
      throw new Error('Dados do cliente são obrigatórios');
    }
    
    if (!dadosCliente.nome) {
      throw new Error('Nome do cliente é obrigatório');
    }
    
    if (dadosNegociacao) {
      if (!dadosNegociacao.liner) {
        console.warn('⚠️ Liner não informado');
      }
      if (!dadosNegociacao.closer) {
        console.warn('⚠️ Closer não informado');
      }
    }
    
    console.log('✅ Dados validados com sucesso');
  }

  // Função para formatar data no padrão brasileiro
  private static formatarDataBrasileira(data: string): string {
    if (!data) return '';

    try {
      // Se já está no formato brasileiro, retornar como está
      if (data.includes('/')) {
        return data;
      }

      const date = new Date(data);

      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return data;
      }

      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const ano = date.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;

      console.log(`📅 Convertendo data: ${data} → ${dataFormatada}`);
      return dataFormatada;
    } catch (error) {
      console.error('❌ Erro ao formatar data:', error);
      return data; // Retorna original se não conseguir converter
    }
  }

  // Função para buscar nome do empreendimento
  private static buscarNomeEmpreendimento(empreendimentoId: string, dadosNegociacao: DadosNegociacao): string {
    // Mapear IDs para nomes dos empreendimentos
    const mapeamentoEmpreendimentos: { [key: string]: string } = {
      '1': 'Gran Garden',
      '2': 'Gran Valley',
      '3': 'Paradise Resort',
      'gran-garden': 'Gran Garden',
      'gran-valley': 'Gran Valley',
      'paradise-resort': 'Paradise Resort'
    };

    // Buscar nome no mapeamento
    const nomeEncontrado = mapeamentoEmpreendimentos[empreendimentoId];
    if (nomeEncontrado) {
      console.log(`🏢 Empreendimento encontrado: ${empreendimentoId} → ${nomeEncontrado}`);
      return nomeEncontrado;
    }

    // Se não encontrar, retornar o próprio ID ou uma versão formatada
    if (empreendimentoId) {
      // Tentar formatar o ID para um nome legível
      const nomeFormatado = empreendimentoId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`🏢 Empreendimento formatado: ${empreendimentoId} → ${nomeFormatado}`);
      return nomeFormatado;
    }

    console.log(`⚠️ Empreendimento vazio ou não encontrado: ${empreendimentoId}`);
    return '';
  }

  // Função para tratar erros de geração de PDF
  private static tratarErroGeracaoPDF(error: any, tipoPDF: string): never {
    console.error(`❌ Erro ao gerar ${tipoPDF}:`, error);
    
    if (error.message?.includes('jsPDF')) {
      throw new Error(`Erro na biblioteca de PDF: ${error.message}`);
    }
    
    if (error.message?.includes('canvas')) {
      throw new Error('Erro de renderização do PDF. Tente novamente.');
    }
    
    throw new Error(`Falha na geração do ${tipoPDF}: ${error.message || 'Erro desconhecido'}`);
  }

  private static createFormHeader(pdf: jsPDF, title: string, pageInfo: string) {
    try {
    // Header principal com 3 colunas
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    
    // Coluna 1 - Logo GAV
    pdf.rect(10, 10, 40, 20);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("GAV", 25, 19);
    pdf.setFontSize(8);
    pdf.text("RESORTS", 22, 25);

    // Coluna 2 - Título
    pdf.rect(50, 10, 110, 20);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("FORMULÁRIO", 95, 16);
    pdf.setFontSize(12);
    pdf.text(title, 70, 24);

    // Coluna 3 - Código e info
    pdf.rect(160, 10, 40, 20);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("Código:FOR.02.01.002", 162, 15);
    pdf.text("Rev.: 24/07/2025-Ver.02", 162, 19);
    pdf.text(pageInfo, 162, 23);
    } catch (error) {
      console.error('❌ Erro ao criar header do PDF:', error);
      throw new Error('Erro ao criar cabeçalho do PDF');
    }
  }

  private static createTableField(
    pdf: jsPDF,
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
    height: number = 8
  ) {
    try {
    // Borda do campo
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(x, y, width, height);
    
    // Label
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(label + ":", x + 1, y + 4);
    
    // Valor (se existir)
    if (value) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(value, x + 1, y + height - 1);
    }
  }

  private static createTableCell(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fontSize: number = 7,
    bold: boolean = false
  ) {
    // Borda
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(x, y, width, height);
    
    // Texto
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(fontSize);
    
    // Quebrar texto se muito longo
    const lines = pdf.splitTextToSize(text, width - 2);
    let textY = y + 4;
    
    for (let i = 0; i < lines.length && i < Math.floor(height / 3); i++) {
      pdf.text(lines[i], x + 1, textY);
      textY += 3;
    }
  }

  // PDF 1: Cadastro de Cliente
  static gerarPDFCadastroCliente(dadosCliente: DadosCliente): string {
    const pdf = this.createPDFCadastroCliente(dadosCliente);
    return pdf.output('datauristring');
  }

  static gerarPDFCadastroClienteBlob(dadosCliente: DadosCliente): Blob {
    const pdf = this.createPDFCadastroCliente(dadosCliente);
    return pdf.output('blob');
  }

  private static createPDFCadastroCliente(dadosCliente: DadosCliente): jsPDF {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    try {
      // Header oficial
      this.createFormHeader(pdf, "Ficha de Cadastro de Cliente", "Página: 1 de 2");

      let yPos = 40;

      // DADOS DO CLIENTE
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("DADOS DO CLIENTE:", 10, yPos);
      yPos += 5;

      // Campos do cliente com dados reais
      this.createTableField(pdf, "Nome", dadosCliente.nome || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "CPF", dadosCliente.cpf || "", 10, yPos, 190, 10);
      yPos += 10;

      // RG, ÓRGÃO, UF na mesma linha
      this.createTableField(pdf, "RG", dadosCliente.rg || "", 10, yPos, 100, 10);
      this.createTableField(pdf, "ÓRGÃO", dadosCliente.orgaoEmissor || "", 110, yPos, 40, 10);
      this.createTableField(pdf, "UF", dadosCliente.estadoEmissor || "", 150, yPos, 50, 10);
      yPos += 10;

      this.createTableField(pdf, "Profissão", dadosCliente.profissao || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "Estado Civil", dadosCliente.estadoCivil || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "E-mail", dadosCliente.email || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "Telefone", dadosCliente.telefone || "", 10, yPos, 190, 10);
      yPos += 20;

      // DADOS DO CÔNJUGE
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("DADOS DO CÔNJUGE:", 10, yPos);
      yPos += 5;

      this.createTableField(pdf, "Nome", dadosCliente.nomeConjuge || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "CPF", dadosCliente.cpfConjuge || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "RG", dadosCliente.rgConjuge || "", 10, yPos, 100, 10);
      this.createTableField(pdf, "ÓRGÃO", dadosCliente.orgaoEmissorConjuge || "", 110, yPos, 40, 10);
      this.createTableField(pdf, "UF", dadosCliente.estadoEmissorConjuge || "", 150, yPos, 50, 10);
      yPos += 10;

      this.createTableField(pdf, "Profissão", dadosCliente.profissaoConjuge || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "Estado Civil", "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "E-mail", dadosCliente.emailConjuge || "", 10, yPos, 190, 10);
      yPos += 10;

      this.createTableField(pdf, "Telefone", dadosCliente.telefoneConjuge || "", 10, yPos, 190, 10);
      yPos += 20;

      // ENDEREÇO
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("ENDEREÇO:", 10, yPos);
      yPos += 5;

      // Logradouro e Nº
      this.createTableField(pdf, "Logradouro", dadosCliente.logradouro || "", 10, yPos, 140, 10);
      this.createTableField(pdf, "Nº", dadosCliente.numeroEndereco || "", 150, yPos, 50, 10);
      yPos += 10;

      // Bairro
      this.createTableField(pdf, "Bairro", dadosCliente.bairro || "", 10, yPos, 190, 10);
      yPos += 10;

      // Complemento e CEP
      this.createTableField(pdf, "Complemento", dadosCliente.complemento || "", 10, yPos, 140, 10);
      this.createTableField(pdf, "CEP", dadosCliente.cep || "", 150, yPos, 50, 10);
      yPos += 10;

      // Cidade e UF
      this.createTableField(pdf, "Cidade", dadosCliente.cidade || "", 10, yPos, 140, 10);
      this.createTableField(pdf, "UF", dadosCliente.ufEndereco || "", 150, yPos, 50, 10);
      yPos += 25;

      // SALA DE VENDAS
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("SALA DE VENDAS:", 10, yPos);
      // Checkbox BEEBACK
      pdf.rect(165, yPos - 5, 4, 4);
      pdf.text("BEEBACK", 172, yPos);
      yPos += 10;

      // Campos com linhas
      pdf.text("LINER:", 10, yPos);
      pdf.line(30, yPos, 200, yPos);
      yPos += 8;

      pdf.text("EMPRESA (Liner):", 10, yPos);
      pdf.line(50, yPos, 200, yPos);
      yPos += 8;

      pdf.text("CLOSER:", 10, yPos);
      pdf.line(30, yPos, 200, yPos);
      yPos += 8;

      pdf.text("EMPRESA (Closer):", 10, yPos);
      pdf.line(55, yPos, 200, yPos);
      yPos += 8;

      pdf.text("PEP:", 10, yPos);
      pdf.line(25, yPos, 200, yPos);
      yPos += 8;

      pdf.text("EMPRESA (PEP):", 10, yPos);
      pdf.line(50, yPos, 200, yPos);
      yPos += 8;

      pdf.text("LIDER DE SALA:", 10, yPos);
      pdf.line(50, yPos, 200, yPos);
      yPos += 8;

      pdf.text("SUB LIDER DE SALA:", 10, yPos);
      pdf.line(65, yPos, 200, yPos);

      return pdf;
      
    } catch (error) {
      console.error('Erro ao gerar PDF de cadastro:', error);
      throw new Error('Falha na geração do PDF de cadastro do cliente');
    }
        // Garantir que o texto não seja muito longo
        const maxWidth = width - 2;
        const lines = pdf.splitTextToSize(value.toString(), maxWidth);
        if (lines.length > 0) {
    try {
          pdf.text(lines[0], x + 1, y + height - 1);
        }

    } catch (error) {
      console.error('❌ Erro ao criar campo da tabela:', error);
      // Não interromper a geração por erro em um campo específico
    }
  // PDF 2: Negociação Página 2 (página 2 do formulário original)
  static gerarPDFNegociacao(dadosCliente: DadosCliente, dadosNegociacao: DadosNegociacao): string {
      const lines = pdf.splitTextToSize(text.toString(), width - 2);
    return pdf.output('datauristring');
  }

  static gerarPDFNegociacaoBlob(dadosCliente: DadosCliente, dadosNegociacao: DadosNegociacao): Blob {
    const pdf = this.createPDFNegociacao(dadosCliente, dadosNegociacao);
    return pdf.output('blob');
    } catch (error) {
      console.error('❌ Erro ao criar célula da tabela:', error);
      // Não interromper a geração por erro em uma célula específica
    }
  }

  // PDF 3: Negociação Página 3 (página 3 do formulário original - campos vazios)
  static gerarPDFPagina3(dadosCliente: DadosCliente, dadosNegociacao: DadosNegociacao): string {
    try {
      console.log('🔄 Iniciando geração do PDF de cadastro...');
      this.validarDados(dadosCliente);
      
    const pdf = this.createPDFPagina3(dadosCliente, dadosNegociacao);
      const result = pdf.output('datauristring');
      
      console.log('✅ PDF de cadastro gerado com sucesso');
      return result;
    } catch (error: any) {
      this.tratarErroGeracaoPDF(error, 'PDF de cadastro');
    }
  }

  static gerarPDFPagina3Blob(dadosCliente: DadosCliente, dadosNegociacao: DadosNegociacao): Blob {
    try {
      this.validarDados(dadosCliente);
    const pdf = this.createPDFPagina3(dadosCliente, dadosNegociacao);
    return pdf.output('blob');
    } catch (error: any) {
      this.tratarErroGeracaoPDF(error, 'PDF de cadastro (blob)');
    }
  }

    } catch (error: any) {
      this.tratarErroGeracaoPDF(error, 'PDF de negociação (blob)');
    }
  private static createPDFNegociacao(dadosCliente: DadosCliente, dadosNegociacao: DadosNegociacao): jsPDF {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    try {
    try {
      this.validarDados(dadosCliente, dadosNegociacao);
      console.log('📄 Criando PDF de cadastro para:', dadosCliente.nome);
      
    } catch (error: any) {
      this.tratarErroGeracaoPDF(error, 'PDF página 3');
    }
      // PÁGINA 1 do PDF de Negociação (página 2 do formulário original)
      this.createFormHeader(pdf, "Ficha de Negociação de Cota", "Página: 2 de 2");

    try {
      this.validarDados(dadosCliente, dadosNegociacao);
      let yPos = 40;

    } catch (error: any) {
      this.tratarErroGeracaoPDF(error, 'PDF página 3 (blob)');
    }
      // CLIENTE e CPF com dados reais
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("CLIENTE:", 10, yPos);
      pdf.line(30, yPos, 200, yPos);
      if (dadosCliente.nome) {
      console.log('📄 Criando PDF de negociação para:', dadosCliente.nome);
      
        pdf.setFont("helvetica", "normal");
        pdf.text(dadosCliente.nome, 32, yPos);
      }
      yPos += 8;

      pdf.setFont("helvetica", "bold");
      pdf.text("CPF:", 10, yPos);
      pdf.line(25, yPos, 200, yPos);
      if (dadosCliente.cpf) {
        pdf.setFont("helvetica", "normal");
        pdf.text(dadosCliente.cpf, 27, yPos);
      }
      yPos += 8;

      pdf.setFont("helvetica", "bold");
      pdf.text("SALA DE VENDAS:", 10, yPos);
      pdf.line(50, yPos, 200, yPos);
      yPos += 10;

      // Checkboxes de tipos de venda com dados reais
      const tipos = [
        { label: "PADRÃO", value: "padrao" },
        { label: "SEMESTRAL", value: "semestral" },
        { label: "ANUAL", value: "anual" },
        { label: "À VISTA", value: "a-vista" },
        { label: "ATÉ 36x", value: "ate-36x" },
        { label: "LINEAR", value: "linear" }
      ];

      let xPos = 10;
      tipos.forEach(tipo => {
        const isSelected = dadosNegociacao.tipoVenda === tipo.value;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(`( ${isSelected ? 'X' : ' '} ) ${tipo.label}`, xPos, yPos);
        xPos += 32;
      });
      yPos += 15;

      // Tabela: Tipo de Parcela Paga em Sala com dados reais
      const headers1 = [
        "Tipo de Parcela Paga em Sala",
        "Valor Total Pago em Sala", 
        "Quantidade de cotas",
        "Valor distribuido para cada Unidade",
        "Forma de Pagamento"
      ];
      const widths1 = [38, 38, 38, 38, 38];

      // Cabeçalho
      let currentX = 10;
      headers1.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, widths1[i], 12, 7, true);
        currentX += widths1[i];
      });
      yPos += 12;

      // 3 linhas de dados com informações reais
      const tiposFixos = ["( ) Entrada", "( ) Sinal", "( ) Saldo"];
      for (let i = 0; i < 3; i++) {
      console.log('✅ PDF de cadastro criado com sucesso');
        currentX = 10;
        const parcela = dadosNegociacao.parcelasPagasSala[i];
        
        this.createTableCell(pdf, tiposFixos[i], currentX, yPos, widths1[0], 8);
        currentX += widths1[0];
        
        this.createTableCell(pdf, parcela?.valorTotal || "", currentX, yPos, widths1[1], 8);
        currentX += widths1[1];
        
        this.createTableCell(pdf, parcela?.quantidadeCotas || "", currentX, yPos, widths1[2], 8);
        currentX += widths1[2];
        const parcela = dadosNegociacao.parcelasPagasSala?.[i] || {};
        this.createTableCell(pdf, parcela?.valorDistribuido || "", currentX, yPos, widths1[3], 8);
        currentX += widths1[3];
        
        this.createTableCell(pdf, parcela?.formasPagamento?.[0] || "", currentX, yPos, widths1[4], 8);
        
        yPos += 8;
      }
      yPos += 10;

      // Primeira tabela de contratos com dados reais
      const contratoHeaders = ["Contrato", "Empreendimento", "Torre/Bloco", "Apt.", "Cota", "Vista da UH.", "PCD", "Valor"];
      const contratoWidths = [20, 30, 25, 20, 20, 25, 20, 30];

      // Cabeçalho da tabela de contratos
      currentX = 10;
      contratoHeaders.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, contratoWidths[i], 10, 7, true);
        currentX += contratoWidths[i];
      });
      yPos += 10;

      // 4 linhas de contratos com dados reais
      for (let i = 0; i < 4; i++) {
        currentX = 10;
        const contrato = dadosNegociacao.contratos[i];
        
        this.createTableCell(pdf, "( ) Físico\n( ) Digital", currentX, yPos, contratoWidths[0], 12, 6);
        currentX += contratoWidths[0];
        
        this.createTableCell(pdf, contrato?.nomeEmpreendimento || this.buscarNomeEmpreendimento(contrato?.empreendimento || "", dadosNegociacao), currentX, yPos, contratoWidths[1], 12, 6);
        currentX += contratoWidths[1];
        
        this.createTableCell(pdf, contrato?.torre || "", currentX, yPos, contratoWidths[2], 12, 6);
        currentX += contratoWidths[2];
        const contrato = dadosNegociacao.contratos?.[i] || {};
        this.createTableCell(pdf, contrato?.apartamento || "", currentX, yPos, contratoWidths[3], 12, 6);
        currentX += contratoWidths[3];
        
        this.createTableCell(pdf, contrato?.cota || "", currentX, yPos, contratoWidths[4], 12, 6);
        currentX += contratoWidths[4];
        
        this.createTableCell(pdf, "( ) Sim\n( ) Não", currentX, yPos, contratoWidths[5], 12, 6);
        currentX += contratoWidths[5];
        
        this.createTableCell(pdf, "( ) Sim\n( ) Não", currentX, yPos, contratoWidths[6], 12, 6);
        currentX += contratoWidths[6];
        
        this.createTableCell(pdf, contrato?.valor || "", currentX, yPos, contratoWidths[7], 12, 6);
        
        yPos += 12;
      }
      yPos += 5;

      // Texto explicativo
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("O financeiro descrito abaixo é referente a cada unidade separadamente.", 10, yPos);
      yPos += 8;

      // Tabela de informações de pagamento com dados reais
      const pagHeaders = ["Tipo", "Total", "Qtd. Parcelas", "Valor Parcela", "Forma de Pag.", "1º Vencimento"];
      const pagWidths = [30, 25, 25, 25, 25, 30];

      // Cabeçalho
      currentX = 10;
      pagHeaders.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, pagWidths[i], 8, 7, true);
        currentX += pagWidths[i];
      });
      yPos += 8;

      // 5 linhas fixas de informações de pagamento com dados reais
      const tiposPagamento = ["Entrada", "Entrada", "Entrada Restante", "Sinal", "Saldo"];
      for (let i = 0; i < 5; i++) {
        currentX = 10;
        
        // Buscar a informação correspondente
        let info;
        if (tiposPagamento[i] === "Entrada" && i === 0) {
          info = dadosNegociacao.informacoesPagamento.find(inf => inf.tipo === "1ª Entrada");
        } else if (tiposPagamento[i] === "Entrada" && i === 1) {
          info = dadosNegociacao.informacoesPagamento.find(inf => inf.tipo === "2ª Entrada");
        } else {
          info = dadosNegociacao.informacoesPagamento.find(inf => inf.tipo === tiposPagamento[i]);
        }
        
        this.createTableCell(pdf, tiposPagamento[i], currentX, yPos, pagWidths[0], 8, 6);
        currentX += pagWidths[0];
        if (dadosNegociacao.informacoesPagamento) {
          if (tiposPagamento[i] === "Entrada" && i === 0) {
            info = dadosNegociacao.informacoesPagamento.find(inf => inf.tipo === "1ª Entrada");
          } else if (tiposPagamento[i] === "Entrada" && i === 1) {
            info = dadosNegociacao.informacoesPagamento.find(inf => inf.tipo === "2ª Entrada");
          } else {
            info = dadosNegociacao.informacoesPagamento.find(inf => inf.tipo === tiposPagamento[i]);
          }
        
        this.createTableCell(pdf, info?.valorParcela || "", currentX, yPos, pagWidths[3], 8, 6);
        currentX += pagWidths[3];
        
        this.createTableCell(pdf, info?.formaPagamento || "", currentX, yPos, pagWidths[4], 8, 6);
        currentX += pagWidths[4];
        
        this.createTableCell(pdf, this.formatarDataBrasileira(info?.primeiroVencimento || ""), currentX, yPos, pagWidths[5], 8, 6);
        
        yPos += 8;
      }

      // ADICIONAR PÁGINA 3 (campos vazios)
      pdf.addPage();

      // Header da página 3
      this.createFormHeader(pdf, "Ficha de Negociação de Cota", "Página: 2 de 2");

      yPos = 50;

      // Primeira seção: Tipo de Parcela Paga em Sala (cabeçalhos)
      const headers1Page3 = [
        "Tipo de Parcela Paga em Sala",
        "Valor Total Pago em Sala",
        "Quantidade de cotas",
        "Valor distribuido para cada Unidade",
        "Forma de Pagamento"
      ];
      const widths1Page3 = [38, 38, 38, 38, 38];

      // Cabeçalho da tabela
      currentX = 10;
      headers1Page3.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, widths1Page3[i], 12, 7, true);
        currentX += widths1Page3[i];
      });
      yPos += 12;

      // 3 linhas para parcelas (vazias)
      const tiposFixosPage3 = ["( ) Entrada", "( ) Sinal", "( ) Saldo"];
      for (let i = 0; i < 3; i++) {
        currentX = 10;

        this.createTableCell(pdf, tiposFixosPage3[i], currentX, yPos, widths1Page3[0], 8);
        currentX += widths1Page3[0];

        this.createTableCell(pdf, "", currentX, yPos, widths1Page3[1], 8);
        currentX += widths1Page3[1];

        this.createTableCell(pdf, "", currentX, yPos, widths1Page3[2], 8);
        currentX += widths1Page3[2];

        this.createTableCell(pdf, "", currentX, yPos, widths1Page3[3], 8);
        currentX += widths1Page3[3];

        this.createTableCell(pdf, "", currentX, yPos, widths1Page3[4], 8);

        yPos += 8;
      }
      yPos += 10;

      // Tabela de contratos (vazia)
      currentX = 10;
      contratoHeaders.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, contratoWidths[i], 10, 7, true);
        currentX += contratoWidths[i];
      });
      yPos += 10;

      // 4 linhas de contratos vazias
      for (let i = 0; i < 4; i++) {
        currentX = 10;

        this.createTableCell(pdf, "( ) Físico\n( ) Digital", currentX, yPos, contratoWidths[0], 12, 6);
        currentX += contratoWidths[0];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[1], 12, 6);
        currentX += contratoWidths[1];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[2], 12, 6);
        currentX += contratoWidths[2];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[3], 12, 6);
        currentX += contratoWidths[3];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[4], 12, 6);
        currentX += contratoWidths[4];

        this.createTableCell(pdf, "( ) Sim\n( ) Não", currentX, yPos, contratoWidths[5], 12, 6);
        currentX += contratoWidths[5];

        this.createTableCell(pdf, "( ) Sim\n( ) Não", currentX, yPos, contratoWidths[6], 12, 6);
        currentX += contratoWidths[6];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[7], 12, 6);

        yPos += 12;
      }
      yPos += 5;

      // Texto explicativo
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("O financeiro descrito abaixo é referente a cada unidade separadamente.", 10, yPos);
      yPos += 8;

      // Tabela de informações de pagamento (vazia)
      currentX = 10;
      pagHeaders.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, pagWidths[i], 8, 7, true);
        currentX += pagWidths[i];
      });
      yPos += 8;

      // 5 linhas vazias de informações de pagamento
      const tiposPagamentoPage3 = ["Entrada", "Entrada", "Entrada Restante", "Sinal", "Saldo"];
      for (let i = 0; i < 5; i++) {
        currentX = 10;

        this.createTableCell(pdf, tiposPagamentoPage3[i], currentX, yPos, pagWidths[0], 8, 6);
        currentX += pagWidths[0];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[1], 8, 6);
        currentX += pagWidths[1];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[2], 8, 6);
        currentX += pagWidths[2];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[3], 8, 6);
        currentX += pagWidths[3];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[4], 8, 6);
        currentX += pagWidths[4];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[5], 8, 6);

        yPos += 8;
      }

      // Linha de assinatura no final
      yPos += 20;
      pdf.line(10, yPos, 200, yPos);
      yPos += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Assinatura do Cliente", 90, yPos);

      return pdf;

    } catch (error) {
      console.error('❌ Erro ao criar PDF de cadastro:', error);
      throw new Error(`Falha na geração do PDF de cadastro: ${error.message}`);
    }
  }

  // Função específica para criar a página 3 (campos vazios)
  private static createPDFPagina3(dadosCliente: DadosCliente, dadosNegociacao: DadosNegociacao): jsPDF {
      console.log('✅ PDF de negociação criado com sucesso');
    const pdf = new jsPDF('p', 'mm', 'a4');

    try {
      console.error('❌ Erro ao criar PDF de negociação:', error);
      throw new Error(`Falha na geração do PDF de negociação: ${error.message}`);

      let yPos = 50;

      // Primeira seção: Tipo de Parcela Paga em Sala (cabeçalhos manuais)
      const headers1 = [
        "Tipo de Parcela Paga em Sala",
        "Valor Total Pago em Sala",
        "Quantidade de cotas",
      console.log('📄 Criando PDF página 3 para:', dadosCliente.nome);
      
        "Valor distribuido para cada Unidade",
        "Forma de Pagamento"
      ];
      const widths1 = [38, 38, 38, 38, 38];

      // Cabeçalho da tabela
      let currentX = 10;
      headers1.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, widths1[i], 12, 7, true);
        currentX += widths1[i];
      });
      yPos += 12;

      // 3 linhas para parcelas (vazias conforme página 3)
      const tiposFixos = ["( ) Entrada", "( ) Sinal", "( ) Saldo"];
      for (let i = 0; i < 3; i++) {
        currentX = 10;

        this.createTableCell(pdf, tiposFixos[i], currentX, yPos, widths1[0], 8);
        currentX += widths1[0];

        this.createTableCell(pdf, "", currentX, yPos, widths1[1], 8);
        currentX += widths1[1];

        this.createTableCell(pdf, "", currentX, yPos, widths1[2], 8);
        currentX += widths1[2];

        this.createTableCell(pdf, "", currentX, yPos, widths1[3], 8);
        currentX += widths1[3];

        this.createTableCell(pdf, "", currentX, yPos, widths1[4], 8);

        yPos += 8;
      }
      yPos += 10;

      // Tabela de contratos (vazia conforme página 3)
      const contratoHeaders = ["Contrato", "Empreendimento", "Torre/Bloco", "Apt.", "Cota", "Vista da UH.", "PCD", "Valor"];
      const contratoWidths = [20, 30, 25, 20, 20, 25, 20, 30];

      // Cabeçalho da tabela de contratos
      currentX = 10;
      contratoHeaders.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, contratoWidths[i], 10, 7, true);
        currentX += contratoWidths[i];
      });
      yPos += 10;

      // 4 linhas de contratos vazias
      for (let i = 0; i < 4; i++) {
        currentX = 10;

        this.createTableCell(pdf, "( ) Físico\n( ) Digital", currentX, yPos, contratoWidths[0], 12, 6);
        currentX += contratoWidths[0];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[1], 12, 6);
        currentX += contratoWidths[1];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[2], 12, 6);
        currentX += contratoWidths[2];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[3], 12, 6);
        currentX += contratoWidths[3];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[4], 12, 6);
        currentX += contratoWidths[4];

        this.createTableCell(pdf, "( ) Sim\n( ) Não", currentX, yPos, contratoWidths[5], 12, 6);
        currentX += contratoWidths[5];

        this.createTableCell(pdf, "( ) Sim\n( ) Não", currentX, yPos, contratoWidths[6], 12, 6);
        currentX += contratoWidths[6];

        this.createTableCell(pdf, "", currentX, yPos, contratoWidths[7], 12, 6);

        yPos += 12;
      }
      yPos += 5;

      // Texto explicativo
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("O financeiro descrito abaixo é referente a cada unidade separadamente.", 10, yPos);
      yPos += 8;

      // Tabela de informações de pagamento (vazia conforme página 3)
      const pagHeaders = ["Tipo", "Total", "Qtd. Parcelas", "Valor Parcela", "Forma de Pag.", "1º Vencimento"];
      const pagWidths = [30, 25, 25, 25, 25, 30];

      // Cabeçalho
      currentX = 10;
      pagHeaders.forEach((header, i) => {
        this.createTableCell(pdf, header, currentX, yPos, pagWidths[i], 8, 7, true);
        currentX += pagWidths[i];
      });
      yPos += 8;

      // 5 linhas vazias de informações de pagamento
      const tiposPagamento = ["Entrada", "Entrada", "Entrada Restante", "Sinal", "Saldo"];
      for (let i = 0; i < 5; i++) {
        currentX = 10;

        this.createTableCell(pdf, tiposPagamento[i], currentX, yPos, pagWidths[0], 8, 6);
        currentX += pagWidths[0];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[1], 8, 6);
        currentX += pagWidths[1];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[2], 8, 6);
        currentX += pagWidths[2];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[3], 8, 6);
        currentX += pagWidths[3];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[4], 8, 6);
        currentX += pagWidths[4];

        this.createTableCell(pdf, "", currentX, yPos, pagWidths[5], 8, 6);

        yPos += 8;
      }

      // Linha de assinatura no final
      yPos += 20;
      pdf.line(10, yPos, 200, yPos);
      yPos += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("Assinatura do Cliente", 90, yPos);

      return pdf;

    } catch (error) {
      console.error('Erro ao gerar PDF da página 3:', error);
    try {
      console.log('🔄 Iniciando geração do PDF de negociação...');
      this.validarDados(dadosCliente, dadosNegociacao);
      
      throw new Error('Falha na geração do PDF da página 3');
      const result = pdf.output('datauristring');
      console.log('✅ PDF página 3 criado com sucesso');
      
      console.log('✅ PDF de negociação gerado com sucesso');
      return result;
      console.error('❌ Erro ao criar PDF página 3:', error);
      throw new Error(`Falha na geração do PDF da página 3: ${error.message}`);
    }
  }
}

    try {
      this.validarDados(dadosCliente, dadosNegociacao);
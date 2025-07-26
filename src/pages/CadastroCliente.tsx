import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF é obrigatório'),
  rg: z.string().min(5, 'RG é obrigatório'),
  orgaoEmissor: z.string().min(2, 'Órgão emissor é obrigatório'),
  estadoEmissor: z.string().min(2, 'Estado é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone é obrigatório'),
  profissao: z.string().min(2, 'Profissão é obrigatória'),
  dataNascimento: z.string().min(10, 'Data de nascimento é obrigatória'),
  estadoCivil: z.string().min(1, 'Estado civil é obrigatório'),
  // Campos de endereço
  logradouro: z.string().default(''),
  numeroEndereco: z.string().default(''),
  bairro: z.string().default(''),
  complemento: z.string().default(''),
  cep: z.string().default(''),
  cidade: z.string().default(''),
  ufEndereco: z.string().default(''),
  // Campos do cônjuge (opcionais)
  nomeConjuge: z.string().default(''),
  cpfConjuge: z.string().default(''),
  rgConjuge: z.string().default(''),
  orgaoEmissorConjuge: z.string().default(''),
  estadoEmissorConjuge: z.string().default(''),
  emailConjuge: z.string().default(''),
  telefoneConjuge: z.string().default(''),
  profissaoConjuge: z.string().default(''),
  dataNascimentoConjuge: z.string().default(''),
  estadoCivilConjuge: z.string().default(''),
});

const CadastroCliente = () => {
  const navigate = useNavigate();
  const [showConjugeFields, setShowConjugeFields] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      cpf: '',
      rg: '',
      orgaoEmissor: '',
      estadoEmissor: '',
      email: '',
      telefone: '',
      profissao: '',
      dataNascimento: '',
      estadoCivil: '',
      // Campos de endereço
      logradouro: '',
      numeroEndereco: '',
      bairro: '',
      complemento: '',
      cep: '',
      cidade: '',
      ufEndereco: '',
      // Campos do cônjuge
      nomeConjuge: '',
      cpfConjuge: '',
      rgConjuge: '',
      orgaoEmissorConjuge: '',
      estadoEmissorConjuge: '',
      emailConjuge: '',
      telefoneConjuge: '',
      profissaoConjuge: '',
      dataNascimentoConjuge: '',
      estadoCivilConjuge: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Dados do cliente:', values);
    // Salvar dados do cliente no localStorage para usar na ficha de negociação
    localStorage.setItem('dadosCliente', JSON.stringify(values));
    toast.success('Cliente cadastrado com sucesso!');
    navigate('/ficha-negociacao');
  };

  const handleEstadoCivilChange = (value: string) => {
    form.setValue('estadoCivil', value);
    setShowConjugeFields(value === 'casado' || value === 'uniao_estavel');
  };

  const estadosCivis = [
    { value: 'solteiro', label: 'Solteiro' },
    { value: 'casado', label: 'Casado' },
    { value: 'divorciado', label: 'Divorciado' },
    { value: 'uniao_estavel', label: 'União Estável' },
    { value: 'desquitado', label: 'Desquitado' },
    { value: 'separado', label: 'Separado' },
    { value: 'viuvo', label: 'Viúvo' },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <CardTitle className="text-2xl font-bold">
              Cadastro do Cliente
            </CardTitle>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="orgaoEmissor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Órgão Emissor</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="estadoEmissor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="profissao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profissão</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="estadoCivil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Civil</FormLabel>
                        <Select onValueChange={handleEstadoCivilChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estadosCivis.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>
                                {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Dados de Endereço */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Endereço</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroEndereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ufEndereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Dados do Cônjuge */}
              {showConjugeFields && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Dados do Cônjuge</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nomeConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cpfConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="rgConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="orgaoEmissorConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Órgão Emissor</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estadoEmissorConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emailConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="telefoneConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profissaoConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dataNascimentoConjuge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-6">
                <Button type="submit" className="w-full md:w-auto px-12">
                  Continuar para Ficha de Negociação
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastroCliente;

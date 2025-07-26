export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      categorias_preco: {
        Row: {
          created_at: string
          empreendimento_id: number
          id: string
          nome: string
          qtd_parcelas_max_saldo: number | null
          qtd_parcelas_sinal: number | null
          tipo_venda: string
          updated_at: string
          valor_cota: number | null
          valor_sinal: number | null
        }
        Insert: {
          created_at?: string
          empreendimento_id: number
          id?: string
          nome: string
          qtd_parcelas_max_saldo?: number | null
          qtd_parcelas_sinal?: number | null
          tipo_venda: string
          updated_at?: string
          valor_cota?: number | null
          valor_sinal?: number | null
        }
        Update: {
          created_at?: string
          empreendimento_id?: number
          id?: string
          nome?: string
          qtd_parcelas_max_saldo?: number | null
          qtd_parcelas_sinal?: number | null
          tipo_venda?: string
          updated_at?: string
          valor_cota?: number | null
          valor_sinal?: number | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          apartamento: string | null
          cota: string
          created_at: string
          empreendimento_id: string
          ficha_id: string
          id: string
          tipo_contrato: string
          tipo_venda_id: string | null
          tipo_venda_linear_id: string | null
          torre_id: string | null
          valor: number
        }
        Insert: {
          apartamento?: string | null
          cota: string
          created_at?: string
          empreendimento_id: string
          ficha_id: string
          id?: string
          tipo_contrato: string
          tipo_venda_id?: string | null
          tipo_venda_linear_id?: string | null
          torre_id?: string | null
          valor: number
        }
        Update: {
          apartamento?: string | null
          cota?: string
          created_at?: string
          empreendimento_id?: string
          ficha_id?: string
          id?: string
          tipo_contrato?: string
          tipo_venda_id?: string | null
          tipo_venda_linear_id?: string | null
          torre_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_tipo_venda_id_fkey"
            columns: ["tipo_venda_id"]
            isOneToOne: false
            referencedRelation: "tipos_venda_normal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_tipo_venda_linear_id_fkey"
            columns: ["tipo_venda_linear_id"]
            isOneToOne: false
            referencedRelation: "tipos_venda_linear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_torre_id_fkey"
            columns: ["torre_id"]
            isOneToOne: false
            referencedRelation: "torres"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimentos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fichas_negociacao: {
        Row: {
          closer: string
          created_at: string
          id: string
          liner: string
          tipo_venda: string
          updated_at: string
        }
        Insert: {
          closer: string
          created_at?: string
          id?: string
          liner: string
          tipo_venda: string
          updated_at?: string
        }
        Update: {
          closer?: string
          created_at?: string
          id?: string
          liner?: string
          tipo_venda?: string
          updated_at?: string
        }
        Relationships: []
      }
      formas_pagamento_sala: {
        Row: {
          created_at: string
          ficha_id: string
          forma_pagamento: string | null
          id: string
          quantidade_cotas: number | null
          valor_distribuido: number | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string
          ficha_id: string
          forma_pagamento?: string | null
          id?: string
          quantidade_cotas?: number | null
          valor_distribuido?: number | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string
          ficha_id?: string
          forma_pagamento?: string | null
          id?: string
          quantidade_cotas?: number | null
          valor_distribuido?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formas_pagamento_sala_ficha_id_fkey"
            columns: ["ficha_id"]
            isOneToOne: false
            referencedRelation: "fichas_negociacao"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string
          ficha_id: string
          forma_pagamento: string | null
          id: string
          primeiro_vencimento: string | null
          qtd_parcelas: number | null
          tipo: string
          total: number | null
          valor_parcela: number | null
        }
        Insert: {
          created_at?: string
          ficha_id: string
          forma_pagamento?: string | null
          id?: string
          primeiro_vencimento?: string | null
          qtd_parcelas?: number | null
          tipo: string
          total?: number | null
          valor_parcela?: number | null
        }
        Update: {
          created_at?: string
          ficha_id?: string
          forma_pagamento?: string | null
          id?: string
          primeiro_vencimento?: string | null
          qtd_parcelas?: number | null
          tipo?: string
          total?: number | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_ficha_id_fkey"
            columns: ["ficha_id"]
            isOneToOne: false
            referencedRelation: "fichas_negociacao"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_comercializacao: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          observacoes: string | null
          percentual_desconto: number | null
          tipo_venda_id: string
          valor_maximo: number | null
          valor_minimo: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          percentual_desconto?: number | null
          tipo_venda_id: string
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          percentual_desconto?: number | null
          tipo_venda_id?: string
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "regras_comercializacao_tipo_venda_id_fkey"
            columns: ["tipo_venda_id"]
            isOneToOne: false
            referencedRelation: "tipos_venda_normal"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_venda_linear: {
        Row: {
          categoria_preco: string
          created_at: string
          empreendimento_id: string
          entrada_linear_qtd: number | null
          entrada_linear_vir: number | null
          id: string
          linear: number | null
          percentual_entrada_linear: number | null
          percentual_saldo_linear: number | null
          percentual_sinal_linear: number | null
          qtd_apos: number | null
          qtd_cotas: number | null
          qtd_semanas: number | null
          saldo_linear_qtd: number | null
          sinal_linear_qtd: number | null
          sinal_linear_vir: number | null
          updated_at: string
          vir_cota: number | null
          vir_parc_linear: number | null
        }
        Insert: {
          categoria_preco: string
          created_at?: string
          empreendimento_id: string
          entrada_linear_qtd?: number | null
          entrada_linear_vir?: number | null
          id?: string
          linear?: number | null
          percentual_entrada_linear?: number | null
          percentual_saldo_linear?: number | null
          percentual_sinal_linear?: number | null
          qtd_apos?: number | null
          qtd_cotas?: number | null
          qtd_semanas?: number | null
          saldo_linear_qtd?: number | null
          sinal_linear_qtd?: number | null
          sinal_linear_vir?: number | null
          updated_at?: string
          vir_cota?: number | null
          vir_parc_linear?: number | null
        }
        Update: {
          categoria_preco?: string
          created_at?: string
          empreendimento_id?: string
          entrada_linear_qtd?: number | null
          entrada_linear_vir?: number | null
          id?: string
          linear?: number | null
          percentual_entrada_linear?: number | null
          percentual_saldo_linear?: number | null
          percentual_sinal_linear?: number | null
          qtd_apos?: number | null
          qtd_cotas?: number | null
          qtd_semanas?: number | null
          saldo_linear_qtd?: number | null
          sinal_linear_qtd?: number | null
          sinal_linear_vir?: number | null
          updated_at?: string
          vir_cota?: number | null
          vir_parc_linear?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tipos_venda_linear_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_venda_normal: {
        Row: {
          categoria_preco: string
          created_at: string
          empreendimento_id: string
          id: string
          percentual_entrada: number | null
          percentual_saldo: number | null
          percentual_sinal: number | null
          qtd_apos: number | null
          qtd_cotas: number | null
          qtd_semanas: number | null
          saldo_qtd: number | null
          saldo_vir: number | null
          sinal_qtd: number | null
          sinal_vir: number | null
          total_entrada: number | null
          total_saldo: number | null
          total_sinal: number | null
          updated_at: string
          vir_cota: number | null
        }
        Insert: {
          categoria_preco: string
          created_at?: string
          empreendimento_id: string
          id?: string
          percentual_entrada?: number | null
          percentual_saldo?: number | null
          percentual_sinal?: number | null
          qtd_apos?: number | null
          qtd_cotas?: number | null
          qtd_semanas?: number | null
          saldo_qtd?: number | null
          saldo_vir?: number | null
          sinal_qtd?: number | null
          sinal_vir?: number | null
          total_entrada?: number | null
          total_saldo?: number | null
          total_sinal?: number | null
          updated_at?: string
          vir_cota?: number | null
        }
        Update: {
          categoria_preco?: string
          created_at?: string
          empreendimento_id?: string
          id?: string
          percentual_entrada?: number | null
          percentual_saldo?: number | null
          percentual_sinal?: number | null
          qtd_apos?: number | null
          qtd_cotas?: number | null
          qtd_semanas?: number | null
          saldo_qtd?: number | null
          saldo_vir?: number | null
          sinal_qtd?: number | null
          sinal_vir?: number | null
          total_entrada?: number | null
          total_saldo?: number | null
          total_sinal?: number | null
          updated_at?: string
          vir_cota?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tipos_venda_normal_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      torres: {
        Row: {
          created_at: string
          descricao: string | null
          empreendimento_id: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          empreendimento_id: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          empreendimento_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "torres_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

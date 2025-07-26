#!/bin/bash

echo "🚀 Fazendo redeploy da edge function send-pdfs..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale com:"
    echo "npm install -g supabase"
    exit 1
fi

# Fazer deploy da função
echo "📦 Deployando função send-pdfs..."
supabase functions deploy send-pdfs

echo "✅ Deploy concluído!"
echo ""
echo "🔍 Para testar, clique no botão 'Testar Email' na aplicação."
echo ""
echo "📋 Se ainda não configurou a RESEND_API_KEY:"
echo "1. Acesse o painel do Supabase"
echo "2. Settings → Edge Functions"
echo "3. Adicione: RESEND_API_KEY = sua_chave_do_resend"

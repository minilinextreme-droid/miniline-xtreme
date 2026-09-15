#!/bin/bash

# ChatGPT Integration Setup Script
# Configura a integração com ChatGPT.com no seu repositório

echo "🚀 Iniciando configuração de integração com ChatGPT..."

# Verificar se OPENAI_API_KEY existe
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ ERRO: Variável OPENAI_API_KEY não está definida"
    echo "📝 Como corrigir:"
    echo "1. Vá para: https://github.com/minilinextreme-droid/miniline-xtreme/settings/secrets/actions"
    echo "2. Clique em 'New repository secret'"
    echo "3. Nome: OPENAI_API_KEY"
    echo "4. Valor: Sua chave do OpenAI (https://platform.openai.com/api-keys)"
    exit 1
fi

echo "✅ OPENAI_API_KEY encontrada"

# Testar conexão com ChatGPT
echo "🔄 Testando conexão com ChatGPT API..."

RESPONSE=$(curl -s -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }')

if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ ERRO na conexão com ChatGPT:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Conexão com ChatGPT estabelecida com sucesso!"
echo "✅ Integração configurada e funcionando!"

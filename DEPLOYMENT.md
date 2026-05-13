# 🚀 Guia de Implantação e Teste

Este guia fornece instruções detalhadas para implantar e testar o add-in do Outlook.

## 🔧 Configuração Inicial

### Passo 1: Instalar Dependências

```bash
# No diretório do projeto
npm install
```

### Passo 2: Gerar Ícones

```bash
node generate-icons.js
```

Ou crie os ícones manualmente:
- Use ferramentas como Adobe XD, Figma ou Photoshop
- Crie dois conjuntos de ícones (vermelho e verde)
- Tamanhos: 16x16, 25x25, 32x32, 80x80 pixels
- Formato: PNG com fundo transparente

### Passo 3: Gerar Certificado SSL (Desenvolvimento)

```bash
# Criar certificado auto-assinado
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Ou use um serviço como ngrok para HTTPS
ngrok http 3000
```

### Passo 4: Iniciar Servidor Web

```bash
# Opção 1: Using npm
npm start

# Opção 2: Using Node.js (com HTTPS)
npx http-server -p 3000 -c-1 --cors --ssl

# Opção 3: Using Python
python -m http.server 3000

# Opção 4: Usar ngrok (recomendado para teste)
ngrok http 3000
```

O servidor estará acessível em:
- `http://localhost:3000` (desenvolvimento)
- `https://localhost:3000` (com SSL)
- `https://xxxx-xxxx-xxxx.ngrok.io` (com ngrok)

## 📋 Atualizar Manifest

Se usar uma URL diferente de localhost, atualize o `manifest.xml`:

```xml
<bt:Url id="functionfile" DefaultValue="https://seu-dominio.com/function-file/function-file.html"/>
<bt:Url id="taskpaneUrl" DefaultValue="https://seu-dominio.com/taskpane.html"/>

<bt:Image id="icon16" DefaultValue="https://seu-dominio.com/icons/red-flag-16.png"/>
<bt:Image id="icon25" DefaultValue="https://seu-dominio.com/icons/red-flag-25.png"/>
<bt:Image id="icon32" DefaultValue="https://seu-dominio.com/icons/red-flag-32.png"/>
<bt:Image id="icon80" DefaultValue="https://seu-dominio.com/icons/red-flag-80.png"/>
```

## 🧪 Implantar em Outlook Web

### Método 1: Sideload (Teste)

1. Abra [Outlook Web](https://outlook.office.com)
2. Abra uma mensagem de email
3. Clique no menu **"..."** > **"Obter Complementos"** (Get Add-ins)
4. Procure por **"Meus complementos"** (My add-ins)
5. Clique em **"+"** e selecione **"Fazer upload de meu manifesto"** (Upload my manifest)
6. Selecione o arquivo `manifest.xml`
7. Clique em **"Upload"**

O add-in agora deve aparecer na faixa de opções.

### Método 2: AppSource (Produção)

1. Submeta o manifest para o [Office Store](https://appsource.microsoft.com)
2. Aguarde aprovação
3. Uma vez aprovado, estará disponível para todos os usuários

## 🎯 Testar o Add-in

### Teste 1: Verificar Aparição na Faixa de Opções

1. Abra uma mensagem de reunião no Outlook
2. Procure na faixa de opções por "Marcar Reunião Pública"
3. Verifique se o ícone está visível e é uma bandeira vermelha

### Teste 2: Carregar Informações da Reunião

1. Abra uma mensagem de reunião
2. Clique no botão "Marcar Reunião Pública"
3. Verifique se as informações aparecem corretamente:
   - ✓ Assunto da reunião
   - ✓ Data e hora
   - ✓ Organizador
   - ✓ ID da reunião

### Teste 3: Enviar para Power Automate

1. Clique no botão "Marcar como Pública"
2. Aguarde a resposta do servidor
3. Verifique se a mensagem de sucesso aparece
4. Confirme no Power Automate que o fluxo foi acionado

### Teste 4: Alteração de Ícone

1. Após clicar com sucesso, verifique se:
   - ✓ O ícone muda para verde
   - ✓ O botão mostra "✅ Reunião Marcada como Pública"
   - ✓ O botão fica desabilitado (não pode clicar novamente)

## 🔍 Debug e Logs

### Acessar Console do Navegador

1. Abra o Outlook
2. Abra as Ferramentas do Desenvolvedor (F12)
3. Vá para a aba **"Console"**
4. Procure por mensagens de log do add-in

### Logs Disponíveis

```javascript
// Inicialização
"Add-in carregado no Outlook"
"Detalhes da reunião carregados com sucesso"

// Envio para Power Automate
"Enviando payload para Power Automate:" + payload
"Erro ao marcar como pública:" + erro
```

### Ativar Modo de Debug

No arquivo `taskpane.js`, descomente ou adicione:

```javascript
// Logs detalhados
console.log("Estado da aplicação:", appState);
console.log("Resposta do servidor:", response);
console.log("Erro na requisição:", error);
```

## 🌐 Usar ngrok para Teste Remoto

Se precisar testar com outros usuários:

```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Iniciar ngrok
ngrok http 3000

# 3. Copiar a URL (ex: https://xxxx-xxxx-xxxx.ngrok.io)

# 4. Atualizar manifest.xml com a URL do ngrok

# 5. Fazer upload do manifest novamente no Outlook
```

## 📊 Validar Dados Enviados

### No Power Automate

1. Abra o histórico de execução do fluxo
2. Clique em uma execução bem-sucedida
3. Expanda o acionador "Quando um pedido HTTP é recebido"
4. Você deve ver o JSON enviado:

```json
{
  "meetingId": "AAMkADM...",
  "subject": "Reunião de Teste",
  "userId": "usuario@example.com",
  "dateTime": "2026-05-13T10:00:00Z",
  ...
}
```

### Usando Postman

Se quiser testar a URL do webhook direto:

1. Abra [Postman](https://postman.com)
2. Crie uma nova requisição POST
3. Cole a URL do webhook
4. Vá para "Body" > "raw" > "JSON"
5. Cole o JSON de teste:

```json
{
  "meetingId": "TEST-ID-123",
  "subject": "Teste de Reunião",
  "userId": "teste@example.com",
  "userEmail": "teste@example.com",
  "dateTime": "2026-05-13T10:00:00Z",
  "organizer": "organizador@example.com",
  "timestamp": "2026-05-13T10:30:00Z",
  "action": "mark_as_public"
}
```

6. Clique em "Send"
7. Você deve receber uma resposta 200 OK

## 🐛 Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "Add-in não aparece na faixa de opções" | Manifest inválido | Verifique sintaxe XML |
| "Erro CORS" | Servidor não tem HTTPS | Use ngrok ou certifi auto-assinado |
| "Dados não carregam" | Office.js não encontrado | Verifique conexão com CDN |
| "Fluxo não executa" | URL incorreta | Copie a URL exata do Power Automate |
| "Ícone não aparece" | Caminho errado | Verifique URLs em manifest.xml |

## ✅ Checklist de Teste

- [ ] Servidor rodando em HTTPS
- [ ] manifest.xml validado
- [ ] Add-in aparece em Outlook
- [ ] Dados da reunião carregam corretamente
- [ ] Botão funciona sem erros
- [ ] Ícone muda de vermelho para verde
- [ ] Fluxo Power Automate é acionado
- [ ] Resposta é recebida com sucesso
- [ ] Logs aparecem no console
- [ ] Email de confirmação é enviado (se configurado)

## 🚀 Implantação em Produção

1. **Certificado SSL Válido**: Use um certificado de uma CA confiável
2. **Domínio**: Configure um domínio HTTPS permanente
3. **Autenticação**: Implemente OAuth 2.0
4. **Segurança**: Valide todas as entradas no Power Automate
5. **Monitoramento**: Configure logs e alertas
6. **Backup**: Faça backup regular dos dados
7. **Documentação**: Mantenha documentação atualizada

## 📞 Suporte

- [Documentação Office JavaScript](https://docs.microsoft.com/en-us/javascript/api/office)
- [Fórum da Comunidade Microsoft 365](https://techcommunity.microsoft.com)
- [GitHub Issues](https://github.com/OfficeDev/Office-Add-in-samples/issues)

---

**Sucesso! 🎉 Seu add-in está pronto para uso.**

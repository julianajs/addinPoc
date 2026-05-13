# ⚡ Guia Rápido - Começar em 5 Minutos

Siga estes passos para ter o add-in rodando rapidamente.

## 🎯 Passos Essenciais

### 1️⃣ Configurar Power Automate (5 min)

```
1. Acesse https://make.powerautomate.com
2. Clique em "Novo fluxo" > "Fluxo em nuvem instantâneo"
3. Selecione "Quando um pedido HTTP é recebido"
4. Copie a URL do webhook
5. Cole em taskpane.js linha 5:
   
   const POWER_AUTOMATE_URL = "COLE_AQUI";
```

### 2️⃣ Iniciar Servidor (2 min)

```bash
# Terminal PowerShell/CMD
npm install
npm start

# Ou acesse https://localhost:3000 em outro terminal:
npx http-server -p 3000 -c-1 --cors --ssl
```

### 3️⃣ Testar Localmente (2 min)

```
1. Abra Outlook Web (https://outlook.office.com)
2. Abra uma reunião
3. Procure por "Obter Complementos" > "Meus complementos" > "+"
4. Clique em "Fazer upload de meu manifesto"
5. Selecione "manifest.xml"
6. Clique no botão "Marcar Reunião Pública"
```

## 📋 Arquivos Importantes

| Arquivo | O que fazer |
|---------|-----------|
| `manifest.xml` | Configuração do add-in (deixe como está) |
| `taskpane.js` | **EDITE:** Atualize URL do Power Automate (linha 5) |
| `taskpane.html` | Interface (deixe como está) |
| `styles.css` | Estilos (deixe como está) |
| `icons/` | Ícones SVG prontos para usar |

## ✅ Verificação Rápida

Após clicar no botão, você deve ver:

- [ ] Informações da reunião carregam
- [ ] Botão fica vermelho
- [ ] Ao clicar, ícone muda para verde ✅
- [ ] Mensagem de sucesso aparece
- [ ] Fluxo Power Automate é acionado

## 🚨 Problemas Comuns

### "Add-in não aparece"
→ Servidor não está rodando em HTTPS
→ Solução: Use `npm start` (HTTP com SSL) ou ngrok

### "Dados não carregam"
→ Verifique se selecionou uma mensagem de REUNIÃO
→ Reuniões normalmente têm campo "Organizador"

### "Fluxo não executa"
→ Verifique se a URL Power Automate está correta
→ Teste a URL no Postman/Insomnia

## 🌐 Usar ngrok para Teste Remoto

```bash
# Instalar (primeira vez)
npm install -g ngrok

# Executar
ngrok http 3000

# Copiar URL (ex: https://xxxx-1234.ngrok.io)
# Atualizar manifest.xml
# Fazer upload novamente no Outlook
```

## 🔐 Antes de Ir para Produção

```
☐ Usar certificado SSL válido (não auto-assinado)
☐ Substituir a URL do webhook permanente
☐ Implementar autenticação OAuth
☐ Validar dados no Power Automate
☐ Testar com múltiplos usuários
☐ Documentar processo
☐ Fazer backup regular
```

## 📱 Próximos Passos

### Personalizar Ícones
```bash
# Se quiser PNG em vez de SVG:
npm install sharp
node generate-icons.js
```

### Adicionar Mais Funcionalidades
- Enviar email de confirmação
- Registrar em banco de dados
- Integrar com Teams
- Adicionar logging

### Implantar em Produção
- Usar domínio permanente
- Certificado SSL válido
- Múltiplos ambientes (dev, test, prod)
- Monitoramento e alertas

## 📞 Suporte Rápido

**Erro no Console?**
```
F12 > Console > Procure por mensagens de erro
```

**Fluxo não executa?**
```
Power Automate > Seu Fluxo > Histórico de Execução
Verifique o último "Não executado" para ver o erro
```

**Precisa de Help?**
- [Documentação Office JS](https://docs.microsoft.com/en-us/javascript/api/office)
- [Power Automate Docs](https://docs.microsoft.com/en-us/power-automate/)
- [Stack Overflow - office-addins](https://stackoverflow.com/questions/tagged/office-addins)

---

**Sucesso! 🚀** Seu add-in está pronto. Dúvidas? Consulte os guias completos:
- [README.md](README.md) - Documentação completa
- [POWER-AUTOMATE-SETUP.md](POWER-AUTOMATE-SETUP.md) - Integração Power Automate
- [DEPLOYMENT.md](DEPLOYMENT.md) - Implantação e testes

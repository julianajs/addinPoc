# Add-in Outlook - Monitorar Reunião

Um add-in para Microsoft Outlook que marca reuniões para monitoramento através do Power Automate.

## 📋 Funcionalidades

- ✅ Aparece na faixa de opções do Outlook
- ✅ Exibe informações da reunião (assunto, data/hora, organizador)
- ✅ Envia dados via JSON para Power Automate
- ✅ Muda o ícone de vermelho para verde após clique
- ✅ Exibe confirmação de sucesso ao usuário
- ✅ Integração completa com Office JavaScript API

## 🎯 Dados Enviados para Power Automate

```json
{
    "meetingId": "ITEM_ID",
    "subject": "Assunto da Reunião",
    "userId": "usuario@example.com",
    "userEmail": "usuario@example.com",
    "dateTime": "2026-05-13T10:00:00Z",
    "organizer": "organizador@example.com",
    "timestamp": "2026-05-13T10:30:00Z",
    "action": "mark_as_public"
}
```

## 📁 Estrutura do Projeto

```
AddInReformulacao/
├── manifest.xml                 # Configuração do add-in
├── taskpane.html               # Interface do painel de tarefas
├── taskpane.js                 # Lógica principal
├── styles.css                  # Estilos CSS
├── function-file/
│   └── function-file.html      # Arquivo de funções (obrigatório)
├── icons/                      # Pasta para ícones
│   ├── red-flag-16.png        # Ícone 16x16px (vermelho)
│   ├── red-flag-25.png        # Ícone 25x25px (vermelho)
│   ├── red-flag-32.png        # Ícone 32x32px (vermelho)
│   ├── red-flag-80.png        # Ícone 80x80px (vermelho)
│   ├── green-flag-16.png      # Ícone 16x16px (verde)
│   ├── green-flag-25.png      # Ícone 25x25px (verde)
│   ├── green-flag-32.png      # Ícone 32x32px (verde)
│   └── green-flag-80.png      # Ícone 80x80px (verde)
└── README.md                    # Este arquivo

```

## 🚀 Configuração

### 1. Gerar Ícones

Execute o script para gerar os ícones SVG em PNG:

```bash
node generate-icons.js
```

Ou crie manualmente os ícones:
- **Ícone Vermelho**: Uma bandeira vermelha (representa reunião não marcada)
- **Ícone Verde**: Uma bandeira verde com checkmark (representa reunião marcada)

Tamanhos necessários: 16, 25, 32 e 80 pixels

### 2. Atualizar URL do Power Automate

No arquivo `taskpane.js`, atualize a constante:

```javascript
const POWER_AUTOMATE_URL = "https://prod-xx.brazilsouth.logic.azure.com:443/workflows/xxxxx/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxx";
```

Você pode obter esta URL:
1. Abra seu fluxo no Power Automate
2. Vá para "Acionador" manual
3. Copie a "URL do webhook"

### 3. Configurar Certificado SSL (Localhost)

Para desenvolvimento local com HTTPS:

```bash
# Gerar certificado auto-assinado
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

### 4. Iniciar Servidor Local

```bash
# Com Python 3
python -m http.server 3000

# Com Node.js
npx http-server -p 3000 -c-1 --cors --ssl

# Com Live Server (VS Code)
# Clique com botão direito em manifest.xml > Open with Live Server
```

## 📝 Integração com Power Automate

### Criar um Fluxo de Nuvem Instantâneo

1. Acesse [Power Automate](https://make.powerautomate.com)
2. Crie um novo fluxo em nuvem instantâneo com acionador "Solicitação HTTP"
3. Configure o corpo esperado:

```json
{
    "type": "object",
    "properties": {
        "meetingId": { "type": "string" },
        "subject": { "type": "string" },
        "userId": { "type": "string" },
        "userEmail": { "type": "string" },
        "dateTime": { "type": "string" },
        "organizer": { "type": "string" },
        "timestamp": { "type": "string" },
        "action": { "type": "string" }
    }
}
```

4. Adicione as ações desejadas:
   - Enviar email de confirmação
   - Registrar em banco de dados
   - Atualizar planilha Excel
   - Etc.

5. Copie a URL do webhook e atualize em `taskpane.js`

## 🔐 Segurança

- O add-in solicita permissão `ReadWriteMailbox`
- Recomenda-se usar Azure Key Vault para armazenar a URL do Power Automate
- Implemente validação de entrada no Power Automate
- Use autenticação OAuth para ambientes de produção

## 🧪 Teste Local

1. Implante para localhost:3000
2. No Outlook Web, vá para "Configurações" > "Complementos"
3. Procure por "Meus complementos" e clique em "+ Meus complementos"
4. Selecione "Adicionar um complemento personalizado"
5. Escolha "Fazer upload de meu manifesto"
6. Selecione o arquivo `manifest.xml`
7. Abra uma mensagem de reunião para testar

## 📱 Compatibilidade

- ✅ Outlook Web (Windows, Mac)
- ✅ Outlook Desktop (Windows)
- ✅ Outlook Desktop (Mac)
- ⚠️ Outlook Mobile (versão limitada)

## 🐛 Troubleshooting

### Erro: "CORS policy blocked"
- Certifique-se de que o servidor está rodando em HTTPS
- Verifique se o CORS está habilitado no Power Automate

### Ícone não aparece
- Verifique os caminhos dos ícones em manifest.xml
- Certifique-se de que os ícones estão acessíveis via HTTPS

### Add-in não aparece na faixa de opções
- Verifique o manifest.xml para erros de sintaxe
- Recarregue o Outlook
- Limpe o cache do navegador

## 📞 Suporte

Para questões sobre o Office JavaScript API, consulte:
- [Documentação Office JS](https://docs.microsoft.com/en-us/javascript/api/office)
- [Exemplos de add-ins](https://github.com/OfficeDev/Office-Add-in-samples)

## 📄 Licença

MIT

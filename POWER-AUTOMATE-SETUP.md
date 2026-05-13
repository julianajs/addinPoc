# 🔄 Guia de Integração com Power Automate

Este guia ajudará você a criar e configurar um fluxo no Power Automate para receber dados do add-in do Outlook.

## 📋 Pré-requisitos

- Uma conta Microsoft 365 ativa
- Acesso ao [Power Automate](https://make.powerautomate.com)
- O add-in já deve estar instalado no Outlook

## 🚀 Passos para Criar o Fluxo

### 1. Acessar Power Automate

1. Acesse [https://make.powerautomate.com](https://make.powerautomate.com)
2. Clique em **"Meus fluxos"** no menu lateral
3. Clique em **"+ Novo fluxo"** > **"Fluxo em nuvem instantâneo"**

### 2. Configurar o Acionador

1. Procure por **"Solicitação HTTP"**
2. Selecione **"Quando um pedido HTTP é recebido"**
3. Configure o corpo de entrada com o seguinte JSON:

```json
{
    "type": "object",
    "properties": {
        "meetingId": {
            "type": "string",
            "description": "ID único da reunião"
        },
        "subject": {
            "type": "string",
            "description": "Assunto da reunião"
        },
        "userId": {
            "type": "string",
            "description": "Email do usuário que marcou a reunião"
        },
        "userEmail": {
            "type": "string",
            "description": "Email do usuário"
        },
        "dateTime": {
            "type": "string",
            "description": "Data e hora da reunião em ISO 8601"
        },
        "organizer": {
            "type": "string",
            "description": "Email do organizador da reunião"
        },
        "timestamp": {
            "type": "string",
            "description": "Timestamp de quando a ação foi executada"
        },
        "action": {
            "type": "string",
            "description": "Tipo de ação (ex: mark_as_public)"
        }
    },
    "required": ["meetingId", "subject", "userId", "action"]
}
```

### 3. Copiar a URL do Webhook

1. Após salvar o acionador, clique no botão **"..."** do acionador
2. Copie a **URL HTTP POST** completa
3. Atualize este valor no arquivo `taskpane.js`:

```javascript
const POWER_AUTOMATE_URL = "COLE_A_URL_AQUI";
```

### 4. Adicionar Ações ao Fluxo

Escolha as ações que deseja executar quando a reunião for marcada como pública:

#### Opção A: Enviar Email de Confirmação

1. Clique em **"+ Nova etapa"**
2. Procure por **"Enviar um email (V3)"**
3. Configure:
   - **Para**: `@{triggerBody()['userEmail']}`
   - **Assunto**: `Reunião marcada como pública: @{triggerBody()['subject']}`
   - **Corpo**:
   ```
   Olá,

   A seguinte reunião foi marcada como pública para monitoramento:

   Assunto: @{triggerBody()['subject']}
   Data/Hora: @{triggerBody()['dateTime']}
   Organizador: @{triggerBody()['organizer']}

   Esta reunião agora está sendo monitorada conforme os protocolos de segurança.

   Atenciosamente,
   Sistema de Classificação de Reuniões
   ```

#### Opção B: Registrar em Planilha Excel

1. Clique em **"+ Nova etapa"**
2. Procure por **"Adicionar uma linha"** (Excel Online)
3. Configure:
   - **Local**: Selecione seu OneDrive/SharePoint
   - **Documento**: Crie uma planilha chamada "ReunioesPublicas"
   - Mapeie os campos:
     - Data Marcação: `@{triggerBody()['timestamp']}`
     - Assunto: `@{triggerBody()['subject']}`
     - Usuário: `@{triggerBody()['userId']}`
     - ID Reunião: `@{triggerBody()['meetingId']}`
     - Organizador: `@{triggerBody()['organizer']}`

#### Opção C: Notificação via Teams

1. Clique em **"+ Nova etapa"**
2. Procure por **"Publicar mensagem de chat"**
3. Configure:
   - **Canal**: Selecione o canal de auditoria
   - **Mensagem**: 
   ```
   🚩 Reunião Marcada como Pública
   Assunto: @{triggerBody()['subject']}
   Usuário: @{triggerBody()['userId']}
   Data: @{triggerBody()['dateTime']}
   ```

#### Opção D: Criar Alerta em SharePoint

1. Clique em **"+ Nova etapa"**
2. Procure por **"Criar item"** (SharePoint)
3. Configure conforme necessário para sua estrutura

### 5. Testar o Fluxo

1. Clique em **"Salvar"**
2. Clique em **"Testar"** > **"Manualmente"**
3. Cole o seguinte JSON de teste:

```json
{
  "meetingId": "AAMkADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM=",
  "subject": "Reunião de Teste",
  "userId": "usuario@example.com",
  "userEmail": "usuario@example.com",
  "dateTime": "2026-05-13T10:00:00Z",
  "organizer": "organizador@example.com",
  "timestamp": "2026-05-13T10:30:00Z",
  "action": "mark_as_public"
}
```

4. Clique em **"Executar fluxo"**
5. Verifique se as ações foram executadas corretamente

## 🔐 Segurança Recomendada

### 1. Usar Azure Key Vault

Para armazenar a URL do webhook com segurança:

```javascript
// Em vez de:
const POWER_AUTOMATE_URL = "URL_DIRETA";

// Use:
const POWER_AUTOMATE_URL = await fetch('/api/get-webhook-url')
    .then(r => r.json())
    .then(d => d.webhookUrl);
```

### 2. Validar no Power Automate

Adicione uma ação de condição para validar os dados:

```
Se o campo 'action' não for igual a 'mark_as_public'
  - Enviar resposta de erro
Senão
  - Continuar com as ações
```

### 3. Limitar Acesso

Configure as permissões da URL do webhook para:
- Aceitar apenas POST
- Adicionar um token de segurança nos headers
- Validar origem

## 🐛 Resolução de Problemas

### O fluxo não está recebendo dados

1. Verifique se a URL está corretamente copiada em `taskpane.js`
2. Verifique se o fluxo está habilitado (interruptor verde)
3. Verifique o histórico de execução para erros
4. Confira se a reunião está sendo carregada corretamente no Outlook

### Email de confirmação não chega

1. Verifique se a caixa de entrada do Outlook não está filtrando
2. Verifique se o endereço de email está correto
3. Teste enviando um email manualmente do Power Automate

### Erros de CORS

1. Adicione um header CORS na resposta do Power Automate:
```
Access-Control-Allow-Origin: https://outlook.office365.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

## 📊 Exemplo Completo de Fluxo

```
Acionador:
  └─ Quando um pedido HTTP é recebido

Ações:
  ├─ Enviar um email com confirmação
  ├─ Adicionar linha em Excel
  ├─ Publicar no Teams
  └─ Responder ao fluxo com sucesso
      - Status Code: 200
      - Body: {"success": true, "message": "Reunião marcada como pública"}
```

## 💡 Dicas Úteis

1. **Adicionar logs**: Use a ação "Compor" para criar logs detalhados
2. **Tratar erros**: Configure manipuladores de exceção para cada ação
3. **Agendar execuções**: Use a opção "Agendar" para processar em horários específicos
4. **Integrar com outras plataformas**: Conecte com Slack, Salesforce, etc.

## 📞 Próximas Etapas

1. Personalizar o fluxo conforme suas necessidades
2. Implementar autenticação segura
3. Adicionar logging e auditoria
4. Testar com dados reais
5. Implantar em produção

Para mais informações, consulte a [documentação oficial do Power Automate](https://docs.microsoft.com/pt-br/power-automate/).

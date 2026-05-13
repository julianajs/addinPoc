# 🏗️ Arquitetura e Fluxo da Solução

Visualização da arquitetura e fluxo de dados do add-in.

## 📊 Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (OUTLOOK)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Microsoft Outlook (Web / Desktop)                       │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Faixa de Opções (Ribbon)                          │  │   │
│  │  │  ┌──────────────────────────────────────┐          │  │   │
│  │  │  │ [🚩] Marcar Reunião Pública         │ ◄─────┐  │   │
│  │  │  └──────────────────────────────────────┘        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Painel de Tarefas (Task Pane)                     │  │   │
│  │  │  ┌──────────────────────────────────────┐          │  │   │
│  │  │  │ Classificação de Reunião Crítica    │          │  │   │
│  │  │  ├──────────────────────────────────────┤          │  │   │
│  │  │  │ Assunto: ...                         │          │  │   │
│  │  │  │ Data/Hora: ...                       │          │  │   │
│  │  │  │ Organizador: ...                     │          │  │   │
│  │  │  │ ID da Reunião: ...                   │          │  │   │
│  │  │  ├──────────────────────────────────────┤          │  │   │
│  │  │  │ [Marcar como Pública]               │          │  │   │
│  │  │  │       (vermelho → verde)             │          │  │   │
│  │  │  └──────────────────────────────────────┘          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │  Executando:                                              │   │
│  │  - taskpane.html (interface)                              │   │
│  │  - taskpane.js (lógica)                                   │   │
│  │  - styles.css (estilos)                                   │   │
│  │  - Office JavaScript API (comunicação)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▼                                   │
│                    Clica no botão                                │
│                    (evento: click)                               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIDOR WEB LOCAL                            │
│                   (localhost:3000)                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Serviço HTTP/HTTPS                                      │   │
│  │  - Hospeda taskpane.html                                 │   │
│  │  - Hospeda styles.css                                    │   │
│  │  - Hospeda taskpane.js                                   │   │
│  │  - Hospeda ícones (icons/*.svg)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  taskpane.js coleta dados:                                       │
│  - meeting.itemId (ID)                                           │
│  - meeting.subject (Assunto)                                     │
│  - meeting.start / meeting.end (Datas)                           │
│  - meeting.organizer (Organizador)                               │
│  - userProfile.emailAddress (Usuário)                            │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                 Monta JSON com os dados
                        (payload)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INTERNET / HTTPS                               │
│                                                                   │
│  Requisição POST                                                 │
│  URL: https://prod-xx.brazilsouth.logic.azure.com/...           │
│                                                                   │
│  Headers:                                                         │
│  Content-Type: application/json                                  │
│                                                                   │
│  Body (JSON):                                                     │
│  {                                                                │
│    "meetingId": "AAMkADM...",                                     │
│    "subject": "Reunião Crítica",                                 │
│    "userId": "usuario@example.com",                              │
│    "userEmail": "usuario@example.com",                           │
│    "dateTime": "2026-05-13T10:00:00Z",                           │
│    "organizer": "organizador@example.com",                       │
│    "timestamp": "2026-05-13T10:30:00Z",                          │
│    "action": "mark_as_public"                                    │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POWER AUTOMATE (NUVEM)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Acionador: "Quando um pedido HTTP é recebido"           │   │
│  │  Status: Ativo                                            │   │
│  │  Recebe o JSON enviado                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Ações Configuradas:                                      │   │
│  │                                                            │   │
│  │  1. ✉️ Enviar Email de Confirmação                        │   │
│  │     Para: usuario@example.com                             │   │
│  │     Assunto: Reunião marcada como pública                │   │
│  │     Corpo: Detalhes da reunião                            │   │
│  │                                                            │   │
│  │  2. 📊 Adicionar linha em Excel                           │   │
│  │     Planilha: ReunioesPublicas                            │   │
│  │     Dados: ID, Assunto, Data, Usuário                     │   │
│  │                                                            │   │
│  │  3. 💬 Publicar no Teams                                   │   │
│  │     Canal: Monitoramento                                   │   │
│  │     Mensagem: Reunião marcada como pública                │   │
│  │                                                            │   │
│  │  4. ✔️ Responder ao webhook                               │   │
│  │     Status: 200 OK                                        │   │
│  │     Mensagem: "Processado com sucesso"                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMAS INTEGRADOS                           │
│                                                                   │
│  ☑️ Email Office 365                                             │
│     - Confirmação enviada ao usuário                             │
│     - Rastreamento automático                                    │
│                                                                   │
│  📊 Excel Online / SharePoint                                    │
│     - Registro da reunião                                        │
│     - Auditoria automática                                       │
│                                                                   │
│  💬 Microsoft Teams                                              │
│     - Notificação do time                                        │
│     - Histórico de reuniões críticas                             │
│                                                                   │
│  🔐 Azure AD (Opcional)                                          │
│     - Log de quem marcou                                         │
│     - Auditoria de segurança                                     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FEEDBACK AO USUÁRIO                             │
│                   (volta ao Cliente)                             │
│                                                                   │
│  Resposta HTTP 200 OK                                            │
│  {                                                                │
│    "success": true,                                              │
│    "message": "Reunião marcada como pública com sucesso"        │
│  }                                                                │
│                                                                   │
│  ✓ Interface atualizada                                          │
│  ✓ Ícone muda para verde (✅)                                    │
│  ✓ Botão desabilitado                                            │
│  ✓ Mensagem de sucesso exibida                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados (Sequencial)

```
1. Usuário abre reunião em Outlook
   └─ Office.context.mailbox.item carregado

2. Clica em "Marcar Reunião Pública"
   └─ handleMarkAsPublic() acionada

3. Valida dados
   └─ Verifica meetingId, subject, dateTime

4. Monta payload JSON
   └─ Estrutura: {meetingId, subject, userId, ...}

5. Envia POST para Power Automate
   └─ URL do webhook do fluxo

6. Exibe indicador de carregamento
   └─ "Processando requisição..."

7. Power Automate recebe e processa
   └─ Executa todas as ações configuradas

8. Responde com sucesso (200 OK)
   └─ Confirma recebimento

9. Cliente recebe resposta
   └─ Atualiza UI

10. Exibe mensagem de sucesso
    └─ "Reunião marcada como pública"

11. Muda ícone e desabilita botão
    └─ Vermelho (🚩) → Verde (✅)

12. Usuário recebe confirmação por email
    └─ Detalhes da reunião no email

13. Dados registrados em Excel/SharePoint
    └─ Histórico mantido

14. Notificação no Teams (opcional)
    └─ Time informado
```

## 🔐 Fluxo de Segurança

```
HTTPS
  │
  ├─ Certificado SSL (válido ou auto-assinado)
  │
  └─ Criptografia TLS/SSL

Credenciais
  │
  ├─ Office 365 Authentication
  │  └─ Usuario via Azure AD
  │
  └─ Power Automate Secret
     └─ URL do webhook segura

Validação de Dados
  │
  ├─ Verificação no cliente
  │
  └─ Validação no Power Automate
     └─ Padrão e tipo de dados

Logging & Auditoria
  │
  ├─ Logs no console (dev)
  │
  ├─ Histórico Power Automate
  │
  ├─ Auditoria Azure AD
  │
  └─ Excel/SharePoint record
```

## 🛠️ Componentes Técnicos

### Frontend (Cliente)

```
┌─ manifest.xml
│  └─ Configuração do add-in
│
├─ taskpane.html
│  └─ Interface do usuário
│
├─ taskpane.js
│  ├─ Lógica de negócio
│  ├─ Coleta de dados
│  └─ Comunicação com API
│
├─ styles.css
│  └─ Estilos visuais
│
└─ icons/
   ├─ red-flag-*.svg (vermelho)
   └─ green-flag-*.svg (verde)
```

### Backend (Power Automate)

```
┌─ Acionador HTTP
│  └─ Recebe POST do cliente
│
├─ Ação: Enviar Email
│  └─ Confirma ao usuário
│
├─ Ação: Excel
│  └─ Registra dados
│
├─ Ação: Teams
│  └─ Notifica time
│
└─ Resposta HTTP
   └─ Confirma ao cliente
```

## 📈 Fluxo de Dados (Quantidade)

```
Requisição HTTP:
- Headers: ~500 bytes
- Body (JSON): ~800 bytes
- Total: ~1.3 KB

Resposta HTTP:
- Headers: ~400 bytes
- Body: ~200 bytes
- Total: ~600 bytes

Email Enviado:
- Assunto: ~100 caracteres
- Corpo: ~500 caracteres
- Total: ~5-10 KB

Excel Registro:
- Colunas: 6-8
- Dados: ~200 bytes por linha
```

## 🎯 Casos de Uso

### Caso 1: Reunião Crítica (Sucesso)
```
Entrada: Reunião com ID válido e assunto > 5 caracteres
Processamento: Valida → Envia → Processa → Registra
Saída: Confirmação, Email, Registro em Excel
Resultado: ✅ Sucesso
```

### Caso 2: Erro de Conexão (Falha)
```
Entrada: Reunião válida, mas sem conexão com Power Automate
Processamento: Valida → Tenta enviar → Timeout
Saída: Mensagem de erro, Botão permanece habilitado
Resultado: ❌ Usuário pode tentar novamente
```

### Caso 3: Email Comum (Ignorado)
```
Entrada: Email comum, não reunião
Processamento: Não tem campo organizer
Saída: Add-in não aparece na faixa de opções
Resultado: ⚠️ Nenhuma ação tomada
```

## 🔍 Pontos de Rastreamento

Você pode acompanhar a execução em:

1. **Outlook**: Console F12 > Logs
2. **Power Automate**: Histórico de execução do fluxo
3. **Excel**: Linhas adicionadas na planilha
4. **Teams**: Mensagens no canal
5. **Email**: Inbox do usuário
6. **Azure AD**: Logs de auditoria (se configurado)

---

**Arquitetura Documentada! 📋**

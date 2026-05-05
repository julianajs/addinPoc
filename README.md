# Add-in Outlook — Participação do Poder Público

Add-in para o **novo Outlook (New Outlook / Outlook on the web)** que permite classificar reuniões quanto à participação do Poder Público, adicionando uma flag visível diretamente na barra de edição do evento.

---

## Funcionalidades

- ✅ Toggle **SIM / NÃO** para indicar participação do Poder Público
- ✅ Seleção de **esfera de governo** (Federal, Estadual, Municipal, Outros/Misto)
- ✅ Campo de **observações** livres (órgão, entidade, etc.)
- ✅ **Prefixo `[GOV]`** adicionado automaticamente ao assunto da reunião
- ✅ Dados **persistidos via CustomProperties** do item do Outlook
- ✅ Dados recarregados ao reabrir a reunião

---

## Estrutura de Arquivos

```
outlook-addin/
├── manifest.xml          ← Manifesto do add-in (registro no M365)
└── src/
    ├── taskpane.html     ← Interface principal (task pane)
    └── commands.html     ← Arquivo de suporte (funções)
```

---

## Pré-requisitos

- Microsoft 365 (Exchange Online)
- Permissão de administrador no tenant (para implantação centralizada) **ou**
- Acesso ao Outlook Web / novo Outlook para sideload manual

---

## Deploy — Opção 1: Sideload para teste (desenvolvimento)

### 1. Hospedar os arquivos

Use qualquer servidor HTTPS local. Exemplo com `http-server`:

```bash
npm install -g http-server

# Na pasta do projeto:
http-server src/ -p 3000 --ssl --cert ./certs/server.crt --key ./certs/server.key
```

> ⚠️ O Outlook exige **HTTPS** mesmo em localhost.

Gere certificado autoassinado:
```bash
npx office-addin-dev-certs install
```

### 2. Sideload no Outlook Web

1. Acesse **outlook.office.com** (novo Outlook)
2. Crie ou abra uma reunião
3. Clique nos **... (Mais opções)** da barra de ferramentas
4. Selecione **Obter suplementos** → **Meus Suplementos**
5. Clique em **Adicionar um suplemento personalizado** → **Adicionar de arquivo**
6. Faça upload do `manifest.xml`

---

## Deploy — Opção 2: Implantação Centralizada (produção)

### Passo 1: Hospedar os arquivos

Faça o upload de `taskpane.html` e `commands.html` em um servidor HTTPS acessível — pode ser:

- **Azure Static Web Apps** (recomendado)
- SharePoint / OneDrive (como página)
- Qualquer servidor web corporativo com HTTPS

### Passo 2: Atualizar as URLs no manifest.xml

Substitua `https://localhost:3000` pela URL real de hospedagem em **todas as ocorrências** do `manifest.xml`:

```xml
<!-- Antes -->
<SourceLocation DefaultValue="https://localhost:3000/taskpane.html"/>

<!-- Depois -->
<SourceLocation DefaultValue="https://meudominio.com/addin/taskpane.html"/>
```

### Passo 3: Publicar via Centro de Administração M365

1. Acesse [admin.microsoft.com](https://admin.microsoft.com)
2. Vá em **Configurações → Aplicativos integrados**
3. Clique em **Carregar aplicativos personalizados**
4. Selecione **Carregar arquivo de manifesto** e envie o `manifest.xml`
5. Defina os usuários/grupos que terão acesso
6. Clique em **Implantar**

O add-in aparecerá automaticamente na barra do Outlook para os usuários selecionados.

---

## Como usar

1. **Crie ou edite uma reunião** no Outlook
2. Na barra superior, clique em **"Poder Público"**
3. O painel lateral abre à direita
4. Use o **toggle** para indicar SIM ou NÃO
5. Se SIM: selecione a **esfera** e opcionalmente preencha **observações**
6. Clique em **Salvar na Reunião**
7. O assunto da reunião recebe automaticamente o prefixo **[GOV]**

---

## Dados armazenados (CustomProperties)

| Propriedade      | Tipo    | Valores possíveis              |
|------------------|---------|-------------------------------|
| `govParticipation` | string | `"1"` (sim) / `"0"` (não)    |
| `govTipo`         | string | `federal`, `estadual`, `municipal`, `outros` |
| `govNotas`        | string | Texto livre (máx. 300 chars)  |
| `govUpdatedAt`    | string | ISO 8601 (ex.: `2024-03-15T14:30:00Z`) |

> As CustomProperties ficam no item do Exchange — acessíveis por EWS, Graph API e Power Automate.

---

## Integração com Power Automate

Para ler os dados classificados em um fluxo:

```
Gatilho: When an event is created or updated (Outlook)
↓
Ação: HTTP → GET https://graph.microsoft.com/v1.0/me/events/{id}/extensions
↓
Condição: govParticipation == "1"
↓
Ação: [notificação, registro no Dataverse, aprovação, etc.]
```

> As CustomProperties são expostas como **SingleValueExtendedProperties** na Graph API.

---

## Permissões necessárias no manifesto

```xml
<Permissions>ReadWriteItem</Permissions>
```

Isso permite ao add-in:
- Ler o assunto e corpo da reunião
- Escrever CustomProperties no item
- Modificar o assunto

---

## Suporte

- Mín. Mailbox API: **1.3**
- Plataformas: Outlook Web, novo Outlook (Windows), Outlook Mac (parcial)
- Não suporta Outlook clássico (legacy COM add-in seria necessário para isso)

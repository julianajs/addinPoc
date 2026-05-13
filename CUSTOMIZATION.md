# 🎨 Guia de Customização

Este guia ajuda a personalizar o add-in conforme suas necessidades.

## Alterações Comuns

### 1. Mudar Cor do Botão

**Arquivo**: `styles.css`

```css
/* Encontre: */
.btn-primary {
    background-color: #dc3545;  /* Vermelho atual */
    color: white;
}

/* Altere para a cor desejada: */
.btn-primary {
    background-color: #0078d4;  /* Azul Microsoft */
    color: white;
}

/* Cores sugeridas:
   - #0078d4 (Azul Microsoft)
   - #107c10 (Verde Office)
   - #d83b01 (Laranja)
   - #107c10 (Verde)
*/
```

### 2. Mudar Texto do Botão

**Arquivo**: `taskpane.html`

```html
<!-- Encontre: -->
<button id="mark-public-button" class="btn-primary">
    <span class="flag-icon">🚩</span>
    Marcar como Pública
</button>

<!-- Altere para: -->
<button id="mark-public-button" class="btn-primary">
    <span class="flag-icon">⚠️</span>
    Marcar para Revisão
</button>
```

### 3. Mudar Textos da Interface

**Arquivo**: `taskpane.html`

```html
<!-- Título da seção -->
<h1>Classificação de Reunião Crítica</h1>
<!-- Altere para: -->
<h1>Sistema de Alertas de Reunião</h1>

<!-- Descrição -->
<p>Ao clicar no botão abaixo, esta reunião será marcada como pública para monitoramento.</p>
<!-- Altere para: -->
<p>Marque esta reunião para receber alertas especiais e monitoramento automático.</p>
```

### 4. Adicionar Novo Campo de Informação

**Arquivo**: `taskpane.html`

```html
<!-- Adicione após: -->
<div class="info-item">
    <label>Organizador:</label>
    <span id="meeting-organizer">Carregando...</span>
</div>

<!-- Novo campo: -->
<div class="info-item">
    <label>Número de Participantes:</label>
    <span id="meeting-attendees">Carregando...</span>
</div>
```

**Arquivo**: `taskpane.js`

```javascript
// Adicione em loadMeetingDetails():
const attendees = item.requiredAttendees ? 
    item.requiredAttendees.length : 0;
appState.attendees = attendees;
document.getElementById("meeting-attendees").textContent = attendees;
```

### 5. Mudar o Intervalo de Tempo para Envio

**Arquivo**: `taskpane.js`

```javascript
// Encontre em handleMarkAsPublic():
// Desabilitar botão após sucesso
button.disabled = true;

// Altere/adicione timeout:
setTimeout(() => {
    // Fechar automaticamente após 3 segundos
    // window.location.reload();
}, 3000);  // Altere o valor em milissegundos
```

### 6. Adicionar Validação Extra

**Arquivo**: `taskpane.js`

```javascript
// Em handleMarkAsPublic(), adicione:
// Validar dados
if (!appState.meetingId || !appState.subject) {
    showStatusMessage("Dados da reunião incompletos.", "error");
    return;
}

// Adicione validação extra:
if (appState.subject.length < 5) {
    showStatusMessage("Assunto da reunião muito curto.", "error");
    return;
}

if (new Date(appState.dateTime) < new Date()) {
    showStatusMessage("Essa reunião já aconteceu.", "error");
    return;
}
```

### 7. Mudar o Ícone do Botão

**Arquivo**: `taskpane.html`

```html
<!-- Encontre: -->
<span class="flag-icon">🚩</span>

<!-- Altere para qualquer emoji: -->
<span class="flag-icon">📌</span>  <!-- Pino -->
<span class="flag-icon">⚡</span>  <!-- Raio -->
<span class="flag-icon">🔔</span>  <!-- Sino -->
<span class="flag-icon">⚠️</span>  <!-- Aviso -->
<span class="flag-icon">🎯</span>  <!-- Alvo -->
```

## Modificações Avançadas

### 1. Adicionar Autenticação

**Arquivo**: `taskpane.js`

```javascript
// Adicione no início:
const getAccessToken = async () => {
    return new Promise((resolve, reject) => {
        Office.context.auth.getAccessTokenAsync((result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                resolve(result.value);
            } else {
                reject(new Error(result.error.message));
            }
        });
    });
};

// Usar em fetch:
const token = await getAccessToken();
const response = await fetch(POWER_AUTOMATE_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
});
```

### 2. Adicionar Logging Detalhado

**Arquivo**: `taskpane.js`

```javascript
// Criar função de log:
function logToServer(level, message, data = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: level,  // info, warn, error
        message: message,
        data: data,
        userAgent: navigator.userAgent,
        userId: appState.userId
    };
    
    console.log(`[${level.toUpperCase()}]`, message, data);
    
    // Enviar para servidor de logging:
    fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
    }).catch(e => console.error('Erro ao enviar log:', e));
}

// Usar:
logToServer('info', 'Botão clicado', { meetingId: appState.meetingId });
```

### 3. Adicionar Campo Opcional

**Arquivo**: `taskpane.html`

```html
<!-- Adicione no formulário: -->
<div class="action-section">
    <h3>Comentários Adicionais (Opcional)</h3>
    <textarea id="comments" placeholder="Adicione observações..." 
              style="width: 100%; padding: 8px; border-radius: 4px;"></textarea>
</div>
```

**Arquivo**: `taskpane.js`

```javascript
// Em handleMarkAsPublic():
const comments = document.getElementById('comments').value;

const payload = {
    // ... dados existentes ...
    comments: comments || null
};
```

### 4. Integrar com Azure AD

**Arquivo**: `taskpane.js`

```javascript
// Obter perfil do usuário
const getUserProfile = async () => {
    try {
        const profileInfo = await Office.context.auth.getAccessTokenAsync();
        
        // Chamar Microsoft Graph
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${profileInfo.value}`
            }
        });
        
        const userProfile = await response.json();
        
        return {
            id: userProfile.id,
            mail: userProfile.mail,
            displayName: userProfile.displayName,
            jobTitle: userProfile.jobTitle
        };
    } catch (error) {
        console.error('Erro ao obter perfil:', error);
    }
};
```

### 5. Adicionar Notificação Toast

**Arquivo**: `taskpane.js`

```javascript
// Criar função de notificação:
function showNotification(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #333;
        color: white;
        padding: 16px;
        border-radius: 4px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Adicionar animações em styles.css:
@keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
}

// Usar:
showNotification('Reunião marcada com sucesso!');
```

### 6. Suportar Múltiplos Idiomas

**Arquivo**: `taskpane.js`

```javascript
const translations = {
    pt: {
        loading: "Carregando...",
        success: "Sucesso!",
        error: "Erro ao processar",
        markAsPublic: "Marcar como Pública"
    },
    en: {
        loading: "Loading...",
        success: "Success!",
        error: "Error processing request",
        markAsPublic: "Mark as Public"
    },
    es: {
        loading: "Cargando...",
        success: "¡Éxito!",
        error: "Error al procesar",
        markAsPublic: "Marcar como Público"
    }
};

const getCurrentLanguage = () => {
    return Office.context.displayLanguage.split('-')[0];
};

const t = (key) => {
    const lang = getCurrentLanguage();
    return translations[lang]?.[key] || translations.pt[key];
};

// Usar:
document.getElementById('mark-public-button').textContent = t('markAsPublic');
```

## Personalização de Estilos

### Tema Escuro

**Arquivo**: `styles.css`

```css
@media (prefers-color-scheme: dark) {
    body {
        background-color: #1e1e1e;
        color: #e0e0e0;
    }
    
    .container {
        background-color: #2d2d2d;
    }
    
    .info-section {
        background-color: #3d3d3d;
    }
}
```

### Layout Responsivo para Mobile

**Arquivo**: `styles.css`

```css
@media (max-width: 360px) {
    .content {
        padding: 12px;
    }
    
    .btn-primary {
        padding: 10px 16px;
        font-size: 14px;
    }
    
    .header h1 {
        font-size: 18px;
    }
}
```

## Estrutura de Pasta Customizada

```
MyCustomAddin/
├── manifest.xml
├── taskpane.html
├── taskpane.js
├── styles.css
├── icons/
│   └── *.svg
├── components/
│   ├── header.js
│   ├── form.js
│   └── notifications.js
├── utils/
│   ├── api.js
│   ├── logging.js
│   └── validation.js
└── config.js
```

## Recursos de Customização

- [Microsoft Office UI Fabric](https://developer.microsoft.com/en-us/fluentui)
- [Office JavaScript API](https://docs.microsoft.com/en-us/javascript/api/office)
- [Ícones Font Awesome](https://fontawesome.com)
- [Material Icons](https://fonts.google.com/icons)

---

**Dica**: Sempre teste suas customizações antes de enviar para produção! 🧪

// ============================================
// ARQUIVO: taskpane.js
// Lógica do Add-in Outlook - Marcar Reunião Pública
// ============================================

// Configuração da URL do Power Automate
// SUBSTITUA PELA URL REAL DO SEU FLUXO
const POWER_AUTOMATE_URL = "https://prod-xx.brazilsouth.logic.azure.com:443/workflows/xxxxx/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxx";

// Estado da aplicação
let appState = {
    meetingId: null,
    subject: null,
    dateTime: null,
    organizer: null,
    userId: null,
    isMarked: false
};

// ============================================
// INICIALIZAÇÃO
// ============================================
Office.onReady((info) => {
    if (info.host === Office.HostType.Outlook) {
        console.log("Add-in carregado no Outlook");
        initializeAddIn();
    }
});

async function initializeAddIn() {
    try {
        // Obter informações da mensagem/reunião
        await loadMeetingDetails();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Carregar estado anterior (se houver)
        loadPreviousState();
        
    } catch (error) {
        console.error("Erro ao inicializar:", error);
        showStatusMessage("Erro ao carregar os detalhes da reunião.", "error");
    }
}

// ============================================
// CARREGAR DETALHES DA REUNIÃO
// ============================================
async function loadMeetingDetails() {
    return new Promise((resolve, reject) => {
        const item = Office.context.mailbox.item;
        
        if (!item) {
            showStatusMessage("Nenhuma reunião selecionada.", "error");
            reject(new Error("Item não encontrado"));
            return;
        }

        // Obter ID do usuário
        appState.userId = Office.context.mailbox.userProfile.emailAddress;

        // Obter ID da reunião
        appState.meetingId = item.itemId;

        // Obter assunto
        appState.subject = item.subject || "Sem assunto";

        // Obter data e hora
        const startTime = item.start;
        const endTime = item.end;
        
        if (startTime && endTime) {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            
            appState.dateTime = startDate.toISOString();
        }

        // Obter organizador/remetente
        const organizer = item.organizer;
        if (organizer) {
            appState.organizer = organizer.emailAddress;
        }

        // Obter ID interno da reunião (InternetMessageId)
        item.getAsync(Office.CoercionType.Html, (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                // Tentar extrair o ID da reunião do HTML
                const htmlBody = result.value;
                // Este é um campo alternativo - use o itemId como principal
                console.log("Detalhes da reunião carregados com sucesso");
            }
        });

        resolve();
    });
}

// ============================================
// CONFIGURAR EVENT LISTENERS
// ============================================
function setupEventListeners() {
    const markButton = document.getElementById("mark-public-button");
    const closeButton = document.getElementById("close-button");

    markButton.addEventListener("click", handleMarkAsPublic);
    closeButton.addEventListener("click", resetForm);
}

// ============================================
// MARCAR COMO PÚBLICA
// ============================================
async function handleMarkAsPublic() {
    const button = document.getElementById("mark-public-button");

    try {
        // Validar dados
        if (!appState.meetingId || !appState.subject) {
            showStatusMessage("Dados da reunião incompletos.", "error");
            return;
        }

        // Mostrar indicador de carregamento
        showLoading(true);
        button.disabled = true;

        // Preparar payload para Power Automate
        const payload = {
            meetingId: appState.meetingId,
            subject: appState.subject,
            userId: appState.userId,
            userEmail: appState.userId,
            dateTime: appState.dateTime,
            organizer: appState.organizer,
            timestamp: new Date().toISOString(),
            action: "mark_as_public"
        };

        console.log("Enviando payload para Power Automate:", payload);

        // Enviar para Power Automate
        const response = await fetch(POWER_AUTOMATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        // Ocultar carregamento
        showLoading(false);

        if (response.ok) {
            // Sucesso!
            appState.isMarked = true;
            
            // Atualizar UI
            button.classList.add("completed");
            button.innerHTML = '<span class="flag-icon">✅</span> Monitorando';
            
            // Mostrar resultado
            showResultSection(
                "Sucesso!",
                "A reunião foi marcada como pública para monitoramento. " +
                "Um fluxo do Power Automate foi disparado e processará os dados da reunião."
            );

            // Salvar estado
            savePreviousState();

            // Desabilitar botão após sucesso
            button.disabled = true;

            // Auto-fechar depois de 3 segundos (opcional)
            setTimeout(() => {
                // Não fechar automaticamente para manter a confirmação visível
            }, 3000);

        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Erro na requisição: ${response.statusText}. ${errorData.message || ""}`
            );
        }

    } catch (error) {
        console.error("Erro ao marcar como pública:", error);
        showLoading(false);
        button.disabled = false;
        
        showStatusMessage(
            `Erro ao processar a requisição: ${error.message}`,
            "error"
        );
    }
}

// ============================================
// FUNÇÕES DE UI
// ============================================

function showStatusMessage(message, type = "info") {
    const statusDiv = document.getElementById("status-message");
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    if (type === "error") {
        setTimeout(() => {
            statusDiv.className = "status-message";
        }, 5000);
    }
}

function showLoading(show) {
    const loadingDiv = document.getElementById("loading");
    if (show) {
        loadingDiv.classList.remove("hidden");
    } else {
        loadingDiv.classList.add("hidden");
    }
}

function showResultSection(title, message) {
    const resultSection = document.getElementById("result-section");
    const resultMessage = document.getElementById("result-message");
    
    // Buscar h3 dentro de result-section para definir o título
    const resultTitle = resultSection.querySelector("h3");
    if (resultTitle) {
        resultTitle.textContent = title;
    }
    
    resultMessage.textContent = message;
    resultSection.classList.remove("hidden");
}

function resetForm() {
    // Limpar status
    document.getElementById("status-message").className = "status-message";
    
    // Ocultar resultado
    document.getElementById("result-section").classList.add("hidden");
    
    // Recarregar detalhes
    loadMeetingDetails().catch(err => console.error("Erro ao recarregar:", err));
}

// ============================================
// PERSISTÊNCIA DE ESTADO
// ============================================

function savePreviousState() {
    try {
        const state = {
            meetingId: appState.meetingId,
            isMarked: appState.isMarked,
            timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(`meeting_${appState.meetingId}`, JSON.stringify(state));
    } catch (error) {
        console.error("Erro ao salvar estado:", error);
    }
}

function loadPreviousState() {
    try {
        const stored = sessionStorage.getItem(`meeting_${appState.meetingId}`);
        if (stored) {
            const state = JSON.parse(stored);
            appState.isMarked = state.isMarked;
            
            if (appState.isMarked) {
                const button = document.getElementById("mark-public-button");
                button.classList.add("completed");
                button.innerHTML = '<span class="flag-icon">✅</span> Monitorando';
                button.disabled = true;
            }
        }
    } catch (error) {
        console.error("Erro ao carregar estado anterior:", error);
    }
}

// ============================================
// TRATAMENTO DE ERROS GLOBAIS
// ============================================
window.addEventListener("error", (event) => {
    console.error("Erro global:", event.error);
    showStatusMessage(
        "Um erro inesperado ocorreu. Verifique o console para mais detalhes.",
        "error"
    );
});

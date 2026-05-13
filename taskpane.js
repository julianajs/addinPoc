// ============================================
// ARQUIVO: taskpane.js
// Lógica do Add-in Outlook - Monitorar Reunião
// Versão corrigida: captura robusta dos dados do item/reunião e disparo do Power Automate
// ============================================

// IMPORTANTE: este arquivo não registra evento de envio do Outlook.
// O Power Automate só é chamado por handleMarkAsPublic(), acionado pelo clique manual no botão do taskpane.
//
// URL do gatilho HTTP do Power Automate.
// Em produção, considere proteger esta URL em uma API intermediária para não expor o segredo no cliente.
const POWER_AUTOMATE_URL = "https://default783a2c3aadb945ef8d986601d1686f.35.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/69ef74a9b09a4859a90ed5fdd79f09fa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=sXz7nrvkzJQnVMnLNKusvLyiJvvOyC0oHDYM2R264Ec";

const appState = {
    itemType: null,
    meetingId: null,
    restId: null,
    subject: null,
    start: null,
    end: null,
    dateTime: null,
    organizer: null,
    userId: null,
    location: null,
    bodyPreview: null,
    isMarked: false
};

Office.onReady((info) => {
    if (info.host === Office.HostType.Outlook) {
        initializeAddIn();
    }
});

async function initializeAddIn() {
    try {
        await loadMeetingDetails();
        setupEventListeners();
        renderMeetingDetails();
        loadPreviousState();
        showStatusMessage("Dados carregados. O fluxo só será disparado pelo botão Monitorar reunião; o envio da reunião no Outlook não aciona esta automação.", "success");
    } catch (error) {
        console.error("Erro ao inicializar:", error);
        setupEventListeners();
        renderMeetingDetails("error");
        showStatusMessage(`Erro ao carregar os detalhes da reunião: ${error.message}`, "error");
    }
}

function getItem() {
    const item = Office.context?.mailbox?.item;
    if (!item) {
        throw new Error("Nenhum item do Outlook foi encontrado. Abra uma reunião ou mensagem e tente novamente.");
    }
    return item;
}

function asyncPropertyToPromise(property) {
    return new Promise((resolve) => {
        if (!property) {
            resolve(null);
            return;
        }

        if (typeof property.getAsync === "function") {
            property.getAsync((result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(result.value ?? null);
                } else {
                    console.warn("Falha ao obter propriedade async:", result.error);
                    resolve(null);
                }
            });
            return;
        }

        resolve(property);
    });
}

function bodyToPromise(item) {
    return new Promise((resolve) => {
        if (!item.body || typeof item.body.getAsync !== "function") {
            resolve(null);
            return;
        }

        item.body.getAsync(Office.CoercionType.Text, (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                const value = result.value || "";
                resolve(value.substring(0, 1000));
            } else {
                console.warn("Falha ao obter corpo do item:", result.error);
                resolve(null);
            }
        });
    });
}

function normalizeEmail(value) {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.emailAddress || value.displayName || null;
}

function normalizeDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getRestId(itemId) {
    try {
        if (!itemId || !Office.context.mailbox.convertToRestId) return null;
        return Office.context.mailbox.convertToRestId(itemId, Office.MailboxEnums.RestVersion.v2_0);
    } catch (error) {
        console.warn("Não foi possível converter itemId para REST ID:", error);
        return null;
    }
}

async function loadMeetingDetails() {
    const item = getItem();

    appState.userId = Office.context.mailbox.userProfile?.emailAddress || null;
    appState.itemType = item.itemType || null;
    appState.meetingId = item.itemId || null;
    appState.restId = getRestId(appState.meetingId);

    appState.subject = await asyncPropertyToPromise(item.subject);
    appState.subject = appState.subject || "Sem assunto";

    const start = await asyncPropertyToPromise(item.start);
    const end = await asyncPropertyToPromise(item.end);
    appState.start = normalizeDate(start);
    appState.end = normalizeDate(end);
    appState.dateTime = appState.start;

    const organizer = await asyncPropertyToPromise(item.organizer || item.from);
    appState.organizer = normalizeEmail(organizer);

    const location = await asyncPropertyToPromise(item.location);
    appState.location = typeof location === "string" ? location : (location?.displayName || null);

    appState.bodyPreview = await bodyToPromise(item);

    console.log("Dados capturados do Outlook:", appState);

    if (!appState.meetingId) {
        throw new Error("O item ainda não possui ID. Salve/abra a reunião no calendário antes de monitorar.");
    }

    renderMeetingDetails();
    return appState;
}

function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "—";
}

function renderMeetingDetails(status = "ready") {
    setText("meeting-title", appState.subject || "Reunião não carregada");
    setText("meeting-organizer", appState.organizer);
    setText("meeting-start", formatDateTime(appState.start));
    setText("meeting-end", formatDateTime(appState.end));
    setText("meeting-location", appState.location);

    const chip = document.getElementById("meeting-chip");
    if (!chip) return;

    chip.className = "chip";

    if (status === "error") {
        chip.classList.add("chip-error");
        chip.textContent = "Erro";
        return;
    }

    if (appState.isMarked) {
        chip.classList.add("chip-ready");
        chip.textContent = "Monitorando";
        return;
    }

    chip.classList.add("chip-ready");
    chip.textContent = "Pronto";
}

function setupEventListeners() {
    const markButton = document.getElementById("mark-public-button");
    const closeButton = document.getElementById("close-button");

    if (markButton && !markButton.dataset.bound) {
        markButton.addEventListener("click", handleMarkAsPublic);
        markButton.dataset.bound = "true";
    }

    if (closeButton && !closeButton.dataset.bound) {
        closeButton.addEventListener("click", resetForm);
        closeButton.dataset.bound = "true";
    }
}

async function handleMarkAsPublic() {
    const button = document.getElementById("mark-public-button");

    try {
        await loadMeetingDetails();
        renderMeetingDetails();

        if (!appState.meetingId || !appState.subject) {
            showStatusMessage("Dados da reunião incompletos. Abra a reunião pelo calendário e tente novamente.", "error");
            return;
        }

        showLoading(true);
        button.disabled = true;

        const payload = {
            action: "mark_as_public",
            source: "outlook-addin",
            itemType: appState.itemType,
            meetingId: appState.meetingId,
            restId: appState.restId,
            subject: appState.subject,
            userId: appState.userId,
            userEmail: appState.userId,
            organizer: appState.organizer,
            start: appState.start,
            end: appState.end,
            dateTime: appState.dateTime,
            location: appState.location,
            bodyPreview: appState.bodyPreview,
            timestamp: new Date().toISOString()
        };

        console.log("Payload enviado ao Power Automate:", payload);

        const response = await fetch(POWER_AUTOMATE_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text().catch(() => "");
        console.log("Resposta do Power Automate:", response.status, responseText);

        showLoading(false);

        if (!response.ok) {
            throw new Error(`Power Automate retornou HTTP ${response.status} ${response.statusText}. ${responseText}`);
        }

        appState.isMarked = true;
        button.classList.add("completed");
        button.innerHTML = '<span class="button-icon" aria-hidden="true">✅</span><span>Monitorando</span>';
        renderMeetingDetails();
        button.disabled = true;

        showResultSection(
            "Sucesso!",
            "A reunião foi enviada para o Power Automate. Verifique o histórico de execução do fluxo para confirmar o processamento."
        );

        savePreviousState();
    } catch (error) {
        console.error("Erro ao marcar como pública:", error);
        showLoading(false);
        button.disabled = false;
        showStatusMessage(`Erro ao processar a requisição: ${error.message}`, "error");
    }
}

function showStatusMessage(message, type = "info") {
    const statusDiv = document.getElementById("status-message");
    if (!statusDiv) return;
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;

    if (type === "error") {
        setTimeout(() => {
            statusDiv.className = "status-message";
        }, 8000);
    }
}

function showLoading(show) {
    const loadingDiv = document.getElementById("loading");
    if (!loadingDiv) return;
    loadingDiv.classList.toggle("hidden", !show);
}

function showResultSection(title, message) {
    const resultSection = document.getElementById("result-section");
    const resultMessage = document.getElementById("result-message");
    if (!resultSection || !resultMessage) return;

    const resultTitle = resultSection.querySelector("h3");
    if (resultTitle) resultTitle.textContent = title;

    resultMessage.textContent = message;
    resultSection.classList.remove("hidden");
}

function resetForm() {
    const status = document.getElementById("status-message");
    if (status) status.className = "status-message";

    const result = document.getElementById("result-section");
    if (result) result.classList.add("hidden");

    loadMeetingDetails()
        .then(() => renderMeetingDetails())
        .catch(err => {
            console.error("Erro ao recarregar:", err);
            renderMeetingDetails("error");
        });
}

function savePreviousState() {
    try {
        if (!appState.meetingId) return;
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
        if (!appState.meetingId) return;
        const stored = sessionStorage.getItem(`meeting_${appState.meetingId}`);
        if (!stored) return;

        const state = JSON.parse(stored);
        appState.isMarked = !!state.isMarked;

        if (appState.isMarked) {
            const button = document.getElementById("mark-public-button");
            if (button) {
                button.classList.add("completed");
                button.innerHTML = '<span class="button-icon" aria-hidden="true">✅</span><span>Monitorando</span>';
                button.disabled = true;
                renderMeetingDetails();
            }
        }
    } catch (error) {
        console.error("Erro ao carregar estado anterior:", error);
    }
}

window.addEventListener("error", (event) => {
    console.error("Erro global:", event.error);
    showStatusMessage("Um erro inesperado ocorreu. Verifique o console para mais detalhes.", "error");
});

window.addEventListener("unhandledrejection", (event) => {
    console.error("Promise rejeitada:", event.reason);
    showStatusMessage(`Erro inesperado: ${event.reason?.message || event.reason}`, "error");
});

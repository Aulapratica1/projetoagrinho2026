/**
 * EcoGen Desenvolvimentos - Mecanismo de Dados Interno
 */
let varietyDatabase = [
    {
        id: "1710000001",
        name: "Soja Glicine Standard",
        season: "Outubro a Dezembro",
        etcCommon: 500,
        etcImproved: 400
    },
    {
        id: "1710000002",
        name: "Milho Zea Maiz",
        season: "Setembro a Novembro",
        etcCommon: 600,
        etcImproved: 460
    }
];

// Repositório Digital de Simulação de Busca Web
const webSearchRegistry = [
    { name: "Trigo Nobre", season: "Maio a Julho", etcCommon: 450, etcImproved: 360 },
    { name: "Café Bourbon Tech", season: "Ano Todo", etcCommon: 1200, etcImproved: 950 },
    { name: "Arroz Agulha Precoce", season: "Novembro a Dezembro", etcCommon: 800, etcImproved: 680 }
];

// Constante Agronômica Fixa (Eficiência do Sistema de Irrigação = 80%)
const SYSTEM_EFFICIENCY = 0.80;

// Seletores de Interface Dom
const sizeInput = document.getElementById('plantation-size');
const varietySelect = document.getElementById('variety-select');
const geneModifiers = document.querySelectorAll('.gene-modifier');
const varietyListElement = document.getElementById('variety-list');

// Formulários Independentes
const registerForm = document.getElementById('register-form');
const editCardPanel = document.getElementById('edit-card-panel');
const editForm = document.getElementById('edit-form');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

// Elementos de Pesquisa e Displays
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');
const waterSavedDisplay = document.getElementById('water-saved-display');

// Inicializador da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    renderInterface();

    // Ouvintes de evento em tempo real para cálculos
    sizeInput.addEventListener('input', runEngineCalculations);
    varietySelect.addEventListener('change', runEngineCalculations);
    geneModifiers.forEach(box => box.addEventListener('change', runEngineCalculations));

    // Submissão separada de Cadastrar e Editar
    registerForm.addEventListener('submit', handleRegistration);
    editForm.addEventListener('submit', handleEdition);
    btnCancelEdit.addEventListener('click', closeEditionPanel);
    btnSearch.addEventListener('click', performWebSearch);
});

/**
 * Emissor de Alertas Toast Customizados (Profissional)
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Atualiza e renderiza todos os componentes síncronos
 */
function renderInterface() {
    const previousSelection = varietySelect.value;
    
    // Limpa e popula o seletor da calculadora
    varietySelect.innerHTML = '';
    varietyDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        varietySelect.appendChild(option);
    });

    if (previousSelection && varietyDatabase.some(i => i.id === previousSelection)) {
        varietySelect.value = previousSelection;
    }

    // Renderiza a lista de gerenciamento separada
    varietyListElement.innerHTML = '';
    varietyDatabase.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${item.name}</strong> - Lâmina Comum: ${item.etcCommon}mm</span>
            <div class="list-actions">
                <button type="button" class="btn-edit-action" onclick="openEditionPanel('${item.id}')">Editar</button>
                <button type="button" class="btn-delete-action" onclick="deleteRegistry('${item.id}')">Excluir</button>
            </div>
        `;
        varietyListElement.appendChild(li);
    });

    runEngineCalculations();
}

/**
 * Core de Processamento Numérico Agronômico
 */
function runEngineCalculations() {
    const hectares = parseFloat(sizeInput.value) || 0;
    const activeId = varietySelect.value;
    const selectedCulture = varietyDatabase.find(i => i.id === activeId);

    if (!selectedCulture) {
        waterSavedDisplay.textContent = "0 Litros";
        document.getElementById('table-nir-common').textContent = "0 mm";
        document.getElementById('table-nir-improved').textContent = "0 mm";
        document.getElementById('table-water-common').textContent = "0 L";
        document.getElementById('table-water-improved').textContent = "0 L";
        document.getElementById('table-season-recommendation').textContent = "-";
        return;
    }

    // Processamento de Modificadores Biológicos
    let targetedReduction = 0;
    geneModifiers.forEach(modifier => {
        if (modifier.checked) targetedReduction += parseFloat(modifier.dataset.kcReduction);
    });

    const calculatedEtcImproved = selectedCulture.etcImproved * ((100 - targetedReduction) / 100);

    // Cálculos Operacionais Técnicos (NIR = ETc / Ei)
    const nirCommon = selectedCulture.etcCommon / SYSTEM_EFFICIENCY;
    const nirImproved = calculatedEtcImproved / SYSTEM_EFFICIENCY;

    // Conversão Volumétrica de Campo (V = NIR * Área * 10.000)
    const volumeCommon = nirCommon * hectares * 10000;
    const volumeImproved = nirImproved * hectares * 10000;
    const netSaving = volumeCommon - volumeImproved;

    // Atualização dos Campos Nominais
    waterSavedDisplay.textContent = `${Math.round(netSaving).toLocaleString('pt-BR')} Litros`;
    document.getElementById('table-nir-common').textContent = `${Math.round(nirCommon)} mm`;
    document.getElementById('table-nir-improved').textContent = `${Math.round(nirImproved)} mm`;
    document.getElementById('table-water-common').textContent = `${Math.round(volumeCommon).toLocaleString('pt-BR')} L`;
    document.getElementById('table-water-improved').textContent = `${Math.round(volumeImproved).toLocaleString('pt-BR')} L`;
    document.getElementById('table-season-recommendation').textContent = `Janela Recomendada: ${selectedCulture.season}`;
}

/**
 * Operação: Cadastrar Variedade (Create do CRUD)
 */
function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('new-name').value;
    const season = document.getElementById('new-season').value;
    const etcCommon = parseFloat(document.getElementById('new-etc-common').value);
    const etcImproved = parseFloat(document.getElementById('new-etc-improved').value);

    const isDuplicate = varietyDatabase.some(i => i.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
        showToast("Erro: Uma cultura com este nome já consta no sistema.", "error");
        return;
    }

    const uniqueId = String(Date.now());
    varietyDatabase.push({ id: uniqueId, name, season, etcCommon, etcImproved });
    
    registerForm.reset();
    showToast(`Variedade "${name}" registrada com sucesso.`);
    renderInterface();
}

/**
 * Operação: Abrir Painel Independente de Edição (Read para Update)
 */
window.openEditionPanel = function(id) {
    const item = varietyDatabase.find(i => i.id === id);
    if (!item) {
        showToast("Erro ao localizar registro para alteração.", "error");
        return;
    }

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-season').value = item.season;
    document.getElementById('edit-etc-common').value = item.etcCommon;
    document.getElementById('edit-etc-improved').value = item.etcImproved;

    editCardPanel.classList.remove('hidden');
    editCardPanel.scrollIntoView({ behavior: 'smooth' });
};

/**
 * Operação: Salvar Edição de Dados (Update do CRUD)
 */
function handleEdition(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value;
    const season = document.getElementById('edit-season').value;
    const etcCommon = parseFloat(document.getElementById('edit-etc-common').value);
    const etcImproved = parseFloat(document.getElementById('edit-etc-improved').value);

    const index = varietyDatabase.findIndex(i => i.id === id);
    if (index !== -1) {
        varietyDatabase[index] = { id, name, season, etcCommon, etcImproved };
        showToast("Dados atualizados com sucesso no sistema.");
        closeEditionPanel();
        renderInterface();
    } else {
        showToast("Falha operacional ao atualizar dados.", "error");
    }
}

function closeEditionPanel() {
    editForm.reset();
    editCardPanel.classList.add('hidden');
}

/**
 * Operação: Excluir Registro (Delete do CRUD)
 */
window.deleteRegistry = function(id) {
    const target = varietyDatabase.find(i => i.id === id);
    if (!target) return;

    if (varietyDatabase.length <= 1) {
        showToast("Operação negada. O banco necessita de ao menos uma cultura ativa.", "error");
        return;
    }

    varietyDatabase = varietyDatabase.filter(item => item.id !== id);
    showToast(`Cultura removida do banco de dados.`);
    
    // Se o painel de edição do item deletado estiver aberto, fecha-o
    if (document.getElementById('edit-id').value === id) {
        closeEditionPanel();
    }
    
    renderInterface();
}

/**
 * Mecanismo de Busca Web Simulado (Google Index Tracker)
 */
function performWebSearch() {
    const inputTerms = searchInput.value.trim().toLowerCase();
    if (!inputTerms) {
        showToast("Por favor, insira termos válidos de pesquisa.", "error");
        return;
    }

    const discovered = webSearchRegistry.find(item => item.name.toLowerCase().includes(inputTerms));

    if (discovered) {
        document.getElementById('new-name').value = discovered.name;
        document.getElementById('new-season').value = discovered.season;
        document.getElementById('new-etc-common').value = discovered.etcCommon;
        document.getElementById('new-etc-improved').value = discovered.etcImproved;
        showToast(`Metadados de "${discovered.name}" indexados e importados!`);
    } else {
        showToast("Nenhum dado correspondente encontrado nos servidores.", "error");
    }
}
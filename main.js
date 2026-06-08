/**
 * Banco de dados estrutural e inicial do sistema (Armazenado em Array)
 */
let varietyDatabase = [
    {
        id: "1",
        name: "Soja Glicine Standard",
        season: "Outubro a Dezembro",
        etcCommon: 500, // mm por ciclo
        etcImproved: 400 // mm por ciclo
    },
    {
        id: "2",
        name: "Milho Zea Maiz",
        season: "Setembro a Novembro",
        etcCommon: 600,
        etcImproved: 460
    }
];

// Banco de dados simulado para buscas na "web/Google"
const googleMockDatabase = [
    { name: "Trigo Nobre", season: "Maio a Julho", etcCommon: 450, etcImproved: 360 },
    { name: "Café Bourbon Tech", season: "Ano Todo", etcCommon: 1200, etcImproved: 950 },
    { name: "Arroz Agulha", season: "Novembro a Dezembro", etcCommon: 800, etcImproved: 680 }
];

// Elementos da Interface
const sizeInput = document.getElementById('plantation-size');
const varietySelect = document.getElementById('variety-select');
const geneModifiers = document.querySelectorAll('.gene-modifier');
const varietyListElement = document.getElementById('variety-list');

// Elementos de Exibição de Métricas
const waterSavedDisplay = document.getElementById('water-saved-display');
const tableNirCommon = document.getElementById('table-nir-common');
const tableNirImproved = document.getElementById('table-nir-improved');
const tableWaterCommon = document.getElementById('table-water-common');
const tableWaterImproved = document.getElementById('table-water-improved');
const tableSeasonRecommendation = document.getElementById('table-season-recommendation');

// Componentes do Formulário de Gerenciamento
const registerForm = document.getElementById('register-form');
const editIdInput = document.getElementById('edit-id');
const formTitle = document.getElementById('form-title');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const searchInput = document.getElementById('search-input');
const btnSearch = document.getElementById('btn-search');

const IRRIGATION_EFFICIENCY = 0.80; // Ei = 80% (Padrão para sistemas de aspersão tradicionais)

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    sizeInput.addEventListener('input', runAgronomicCalculator);
    varietySelect.addEventListener('change', runAgronomicCalculator);
    geneModifiers.forEach(box => box.addEventListener('change', runAgronomicCalculator));
    
    registerForm.addEventListener('submit', handleFormSubmit);
    btnCancelEdit.addEventListener('click', cancelEditing);
    btnSearch.addEventListener('click', triggerGoogleSearch);
});

/**
 * Atualiza os elementos visuais dependentes dos dados mutáveis
 */
function updateUI() {
    populateSelect();
    renderManagementList();
    runAgronomicCalculator();
}

function populateSelect() {
    const currentSelection = varietySelect.value;
    varietySelect.innerHTML = '';
    varietyDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        varietySelect.appendChild(option);
    });
    if (currentSelection && varietyDatabase.some(i => i.id === currentSelection)) {
        varietySelect.value = currentSelection;
    }
}

/**
 * Renderiza a lista de edição e exclusão (CRUD)
 */
function renderManagementList() {
    varietyListElement.innerHTML = '';
    varietyDatabase.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (${item.etcCommon}mm / ${item.etcImproved}mm)</span>
            <div class="list-actions">
                <button type="button" class="btn-edit-action" onclick="prepareEdit('${item.id}')">Editar</button>
                <button type="button" class="btn-delete-action" onclick="deleteVariety('${item.id}')">Excluir</button>
            </div>
        `;
        varietyListElement.appendChild(li);
    });
}

/**
 * Executa as fórmulas agronômicas de irrigação líquida e conversão volumétrica
 */
function runAgronomicCalculator() {
    const area = parseFloat(sizeInput.value) || 0;
    const targetId = varietySelect.value;
    const culture = varietyDatabase.find(i => i.id === targetId);

    if (!culture) {
        waterSavedDisplay.textContent = "0 Litros";
        return;
    }

    // Aplicação dos modificadores de laboratório (Redução direta do Kc/Etc)
    let kcReduction = 0;
    geneModifiers.forEach(box => {
        if (box.checked) kcReduction += parseFloat(box.dataset.kcReduction);
    });

    const adjustedEtcImproved = culture.etcImproved * ((100 - kcReduction) / 100);

    // Fórmula Agronômica: Necessidade de Irrigação Líquida (NIR = ETc / Ei)
    const nirCommon = culture.etcCommon / IRRIGATION_EFFICIENCY;
    const nirImproved = adjustedEtcImproved / IRRIGATION_EFFICIENCY;

    // Fórmula de Conversão Volumétrica Total (Lâmina mm para Litros numa Área A): V = NIR * A * 10.000
    const litersCommon = nirCommon * area * 10000;
    const litersImproved = nirImproved * area * 10000;
    const waterSaved = litersCommon - litersImproved;

    // Atualização da Tabela e Painel
    waterSavedDisplay.textContent = `${Math.round(waterSaved).toLocaleString('pt-BR')} Litros`;
    tableNirCommon.textContent = `${Math.round(nirCommon)} mm`;
    tableNirImproved.textContent = `${Math.round(nirImproved)} mm`;
    tableWaterCommon.textContent = `${Math.round(litersCommon).toLocaleString('pt-BR')} L`;
    tableWaterImproved.textContent = `${Math.round(litersImproved).toLocaleString('pt-BR')} L`;
    tableSeasonRecommendation.textContent = `Período de Semeadura Recomendado: ${culture.season}`;
}

/**
 * Processa a submissão do formulário (Criação ou Edição)
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = editIdInput.value;
    const name = document.getElementById('new-name').value;
    const season = document.getElementById('new-season').value;
    const etcCommon = parseFloat(document.getElementById('new-etc-common').value);
    const etcImproved = parseFloat(document.getElementById('new-etc-improved').value);

    if (id) {
        // Modo Edição (U do CRUD)
        const index = varietyDatabase.findIndex(i => i.id === id);
        if (index !== -1) {
            varietyDatabase[index] = { id, name, season, etcCommon, etcImproved };
        }
        cancelEditing();
    } else {
        // Modo Criação (C do CRUD)
        const newId = String(Date.now());
        varietyDatabase.push({ id: newId, name, season, etcCommon, etcImproved });
        registerForm.reset();
    }

    updateUI();
}

/**
 * Prepara os campos do formulário para edição (Preenchimento)
 */
window.prepareEdit = function(id) {
    const culture = varietyDatabase.find(i => i.id === id);
    if (!culture) return;

    editIdInput.value = culture.id;
    document.getElementById('new-name').value = culture.name;
    document.getElementById('new-season').value = culture.season;
    document.getElementById('new-etc-common').value = culture.etcCommon;
    document.getElementById('new-etc-improved').value = culture.etcImproved;

    formTitle.textContent = "III. Editando Variedade";
    document.getElementById('btn-submit-form').textContent = "Atualizar Dados";
    btnCancelEdit.classList.remove('hidden');
};

function cancelEditing() {
    editIdInput.value = "";
    registerForm.reset();
    formTitle.textContent = "III. Cadastrar / Editar Variedade";
    document.getElementById('btn-submit-form').textContent = "Salvar Variedade";
    btnCancelEdit.classList.add('hidden');
}

/**
 * Remove elemento do array de dados (D do CRUD)
 */
window.deleteVariety = function(id) {
    if (confirm("Deseja realmente remover esta variedade do banco de dados?")) {
        varietyDatabase = varietyDatabase.filter(item => item.id !== id);
        updateUI();
    }
};

/**
 * Função de busca que simula uma varredura do Google trazendo dados agronômicos indexados
 */
function triggerGoogleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return alert("Digite o nome de um cultivo para pesquisar.");

    // Procura por correspondência parcial no banco simulado externo
    const match = googleMockDatabase.find(item => item.name.toLowerCase().includes(query));

    if (match) {
        document.getElementById('new-name').value = match.name;
        document.getElementById('new-season').value = match.season;
        document.getElementById('new-etc-common').value = match.etcCommon;
        document.getElementById('new-etc-improved').value = match.etcImproved;
        alert(`Sucesso! Encontrado via web: "${match.name}". Os dados técnicos foram inseridos no formulário.`);
    } else {
        alert("Variedade não encontrada na indexação simulada. Tente termos como 'Trigo', 'Café' ou 'Arroz'.");
    }
}
/**
 * Core de Dados da Calculadora EcoGen
 * Contém os dados estruturais iniciais (Gêneros/Variedades padrão)
 */
const varietyDatabase = [
    {
        id: "soja-gen",
        name: "Soja (Gênero Glycine)",
        waterCommon: 550000,   // Litros gastos por hectare na variedade comum
        waterImproved: 412500, // Litros gastos por hectare com melhoramento básico (-25%)
        baseYield: 100,        // Percentual base de produtividade
        season: "Outubro a Dezembro (Primavera)"
    },
    {
        id: "milho-gen",
        name: "Milho (Gênero Zea)",
        waterCommon: 600000,
        waterImproved: 480000, // -20% consumo base
        baseYield: 100,
        season: "Setembro a Novembro / Safrinha (Jan-Mar)"
    }
];

// Elementos DOM rastreados do HTML
const sizeInput = document.getElementById('plantation-size');
const varietySelect = document.getElementById('variety-select');
const geneModifiers = document.querySelectorAll('.gene-modifier');

// Elementos de Exibição de Resultados
const waterSavedDisplay = document.getElementById('water-saved-display');
const tableWaterCommon = document.getElementById('table-water-common');
const tableWaterImproved = document.getElementById('table-water-improved');
const tableYieldImproved = document.getElementById('table-yield-improved');
const tableSeasonRecommendation = document.getElementById('table-season-recommendation');

// Formulário de Cadastro
const registerForm = document.getElementById('register-form');

/**
 * Inicialização e Event Listeners principais
 */
document.addEventListener('DOMContentLoaded', () => {
    populateSelectOptions();
    runCalculator(); // Roda o cálculo primário estrutural

    // Detecta interações em tempo real para cálculo dinâmico
    sizeInput.addEventListener('input', runCalculator);
    varietySelect.addEventListener('change', runCalculator);
    
    geneModifiers.forEach(checkbox => {
        checkbox.addEventListener('change', runCalculator);
    });
});

/**
 * Alimenta dinamicamente a tag Select com as variedades disponíveis
 */
function populateSelectOptions() {
    varietySelect.innerHTML = '';
    varietyDatabase.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        varietySelect.appendChild(option);
    });
}

/**
 * Função Mestra de Cálculo e Comparação (Simulação)
 */
function runCalculator() {
    const sizeInHectares = parseFloat(sizeInput.value) || 0;
    const selectedId = varietySelect.value;
    
    // Busca o objeto correspondente no banco fictício
    const targetVariety = varietyDatabase.find(item => item.id === selectedId);
    
    if (!targetVariety) return;

    // 1. Processamento das modificações genéticas extras ativadas pelo usuário
    let extraWaterBonusPercent = 0;
    let extraYieldBonusPercent = 0;

    geneModifiers.forEach(checkbox => {
        if (checkbox.checked) {
            if (checkbox.dataset.waterBonus) {
                extraWaterBonusPercent += parseFloat(checkbox.dataset.waterBonus);
            }
            if (checkbox.dataset.yieldBonus) {
                extraYieldBonusPercent += parseFloat(checkbox.dataset.yieldBonus);
            }
        }
    });

    // 2. Cálculo do Consumo de Água da Semente Comum
    const totalWaterCommon = targetVariety.waterCommon * sizeInHectares;

    // 3. Cálculo da Semente Melhorada aplicando modificações do Simulador
    // Reduz ainda mais o consumo baseado nos bônus ativados
    const baseImprovedWaterPerHa = targetVariety.waterImproved;
    const modifierFactor = (100 - extraWaterBonusPercent) / 100;
    const finalImprovedWaterPerHa = baseImprovedWaterPerHa * modifierFactor;
    
    const totalWaterImproved = finalImprovedWaterPerHa * sizeInHectares;

    // 4. Cálculo da Economia Líquida de Água
    const netWaterSaved = totalWaterCommon - totalWaterImproved;

    // 5. Cálculo do ganho de produtividade
    const finalYield = targetVariety.baseYield + extraYieldBonusPercent;

    // Renderização dos Dados na Tela com Formatação Numérica Brasileira
    waterSavedDisplay.textContent = `${netWaterSaved.toLocaleString('pt-BR')} Litros`;
    tableWaterCommon.textContent = `${totalWaterCommon.toLocaleString('pt-BR')} L`;
    tableWaterImproved.textContent = `${totalWaterImproved.toLocaleString('pt-BR')} L`;
    tableYieldImproved.textContent = `${finalYield}% (Aumento de +${extraYieldBonusPercent}%)`;
    tableSeasonRecommendation.textContent = `Época Sugerida de Plantio: ${targetVariety.season}`;
}

/**
 * Manipulador do Formulário de Cadastro de Novas Variedades/Gêneros
 */
registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento do site

    // Coleta as inputs do usuário
    const name = document.getElementById('new-name').value;
    const season = document.getElementById('new-season').value;
    const waterCommon = parseFloat(document.getElementById('new-water-common').value);
    const waterImproved = parseFloat(document.getElementById('new-water-improved').value);

    // Cria um ID amigável único baseado no timestamp
    const id = `custom-${Date.now()}`;

    // Insere o novo objeto mapeado no array global de dados
    varietyDatabase.push({
        id,
        name: `${name} (Custom)`,
        waterCommon,
        waterImproved,
        baseYield: 100,
        season
    });

    // Atualiza o componente visual de escolha, seleciona o novo item e recalcula
    populateSelectOptions();
    varietySelect.value = id;
    runCalculator();

    // Limpa o formulário após cadastro bem-sucedido
    registerForm.reset();
    alert(`Variedade "${name}" registrada com sucesso e aplicada ao simulador!`);
});
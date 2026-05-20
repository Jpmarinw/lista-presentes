// CONFIGURAÇÃO: URLs das planilhas publicadas como CSV
// Adicione quantas planilhas quiser aqui
const PLANILHAS = [
    {
        url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRb2HzUZZRSGO354U15R7_jgcK3hl9rh6cFMpzxwWnheFMa43OTKInsYC_Hmn2c1kE39nG_NCP3Q3Cl/pub?gid=0&single=true&output=csv",
        nome: "Presentes João Pedro", // Nome que aparece no site
    },
    // Adicione mais planilhas aqui:
    {
        url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSjJEkiR_39Ec1vCe2SsL8MFhN3wFmlI4T-zIq2NxNBZ_EdvusdldVPFoD35IoQyhzrIJBRvce7c_Js/pub?output=csv",
        nome: "Presentes Juliane",
    },
];

// Elementos do DOM
const listaElement = document.getElementById("lista-presentes");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const tabsContainer = document.getElementById("tabs-container");
const tabsHeader = document.getElementById("tabs-header");

// Estado das abas
let abaAtiva = 0;
let planilhasCarregadas = [];

// Função principal para carregar os dados
async function carregarLista() {
    const resultados = await Promise.allSettled(
        PLANILHAS.map(carregarPlanilha),
    );
    const planilhas = [];
    const falhas = [];

    resultados.forEach((resultado, index) => {
        if (resultado.status === "fulfilled") {
            planilhas.push(resultado.value);
        } else {
            falhas.push(PLANILHAS[index].nome);
            console.error("Erro ao carregar lista:", resultado.reason);
        }
    });

    if (falhas.length > 0) {
        mostrarErro(`Não foi possível carregar: ${falhas.join(", ")}.`);
    }

    renderizarLista(planilhas);
}

async function carregarPlanilha(planilha) {
    const response = await fetch(planilha.url);
    if (!response.ok) {
        throw new Error(`Não foi possível acessar: ${planilha.nome}`);
    }

    const csvText = await response.text();
    const itens = parseCSV(csvText);

    return {
        nome: planilha.nome,
        itens,
    };
}

// Parser simples de CSV
function parseCSV(csvText) {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]).map((header) =>
        header
            .replace(/^\uFEFF/, "")
            .trim()
            .toLowerCase(),
    );

    const itens = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length < headers.length) continue;

        const item = {};
        headers.forEach((header, index) => {
            item[header] = values[index]?.trim() || "";
        });

        // Só adiciona se tiver descrição
        if (item.descricao) {
            itens.push(item);
        }
    }

    return itens;
}

// Parser de linha CSV (lida com vírgulas e aspas escapadas)
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

// Renderiza a lista na tela
function renderizarLista(todasPlanilhas) {
    loadingElement.classList.add("hidden");

    // Filtra planilhas com itens
    const planilhasComItens = todasPlanilhas.filter((p) => p.itens.length > 0);

    if (planilhasComItens.length === 0) {
        if (!errorElement.classList.contains("hidden")) return;

        listaElement.innerHTML =
            '<p class="loading">Nenhum item na lista ainda.</p>';
        return;
    }

    planilhasCarregadas = planilhasComItens;

    // Se tiver mais de uma planilha, mostra as abas
    if (planilhasComItens.length > 1) {
        renderizarAbas(planilhasComItens);
        tabsContainer.hidden = false;
    } else {
        tabsContainer.hidden = true;
    }

    renderizarConteudoAba(0);
}

// Renderiza o cabeçalho das abas
function renderizarAbas(planilhas) {
    tabsHeader.innerHTML = planilhas
        .map(
            (planilha, index) => `
        <button
            class="tab-button ${index === 0 ? "active" : ""}"
            data-index="${index}"
            id="tab-${index}"
            role="tab"
            aria-selected="${index === 0}"
            aria-controls="panel-${index}"
            tabindex="${index === 0 ? "0" : "-1"}"
            type="button"
        >
            ${escapeHtml(planilha.nome)}
        </button>
    `,
        )
        .join("");

    tabsHeader.querySelectorAll(".tab-button").forEach((botao) => {
        botao.addEventListener("click", () => {
            renderizarConteudoAba(Number(botao.dataset.index));
        });
    });
}

// Renderiza o conteúdo da aba selecionada
function renderizarConteudoAba(index) {
    if (!planilhasCarregadas[index]) return;

    abaAtiva = index;
    const planilha = planilhasCarregadas[index];

    listaElement.innerHTML = `
        <section
            class="planilha-secao"
            id="panel-${index}"
            role="tabpanel"
            aria-labelledby="tab-${index}"
        >
            <h2 class="planilha-titulo">${escapeHtml(planilha.nome)}</h2>
            <div class="lista">
                ${planilha.itens
                    .map((item) => {
                        const imagem = normalizarUrl(item.imagem);
                        const link = normalizarUrl(item.link);

                        return `
                <div class="item">
                  ${imagem ? `<img src="${escapeHtml(imagem)}" alt="${escapeHtml(item.descricao)}" class="item-imagem" loading="lazy" onerror="this.hidden=true">` : ""}
                  ${item.descricao ? `<p class="item-descricao">${escapeHtml(item.descricao)}</p>` : ""}
                  <div class="item-footer">
                    ${item.preco ? `<span class="item-preco">${escapeHtml(item.preco)}</span>` : ""}
                    ${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="item-link">Ver produto</a>` : ""}
                  </div>
                </div>
              `;
                    })
                    .join("")}
            </div>
        </section>
    `;

    // Atualiza as classes das abas
    const botoes = tabsHeader.querySelectorAll(".tab-button");
    botoes.forEach((botao, i) => {
        if (i === index) {
            botao.classList.add("active");
            botao.setAttribute("aria-selected", "true");
            botao.tabIndex = 0;
        } else {
            botao.classList.remove("active");
            botao.setAttribute("aria-selected", "false");
            botao.tabIndex = -1;
        }
    });
}

function mostrarErro(mensagem) {
    errorElement.classList.remove("hidden");
    errorElement.querySelector("p").textContent = mensagem;
}

function normalizarUrl(url) {
    if (!url) return "";

    try {
        const urlNormalizada = new URL(url);
        return ["http:", "https:"].includes(urlNormalizada.protocol)
            ? urlNormalizada.href
            : "";
    } catch {
        return "";
    }
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

tabsHeader.addEventListener("keydown", (event) => {
    const teclas = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!teclas.includes(event.key)) return;

    event.preventDefault();

    const ultimoIndice = planilhasCarregadas.length - 1;
    let proximoIndice = abaAtiva;

    if (event.key === "ArrowRight") {
        proximoIndice = abaAtiva === ultimoIndice ? 0 : abaAtiva + 1;
    }

    if (event.key === "ArrowLeft") {
        proximoIndice = abaAtiva === 0 ? ultimoIndice : abaAtiva - 1;
    }

    if (event.key === "Home") proximoIndice = 0;
    if (event.key === "End") proximoIndice = ultimoIndice;

    renderizarConteudoAba(proximoIndice);
    tabsHeader.querySelector(`[data-index="${proximoIndice}"]`)?.focus();
});

// Inicializa quando a página carregar
document.addEventListener("DOMContentLoaded", carregarLista);

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
const themeToggle = document.getElementById("theme-toggle");
const controlesContainer = document.getElementById("controles-container");
const sortSelect = document.getElementById("sort-select");

// Tema
function inicializarTema() {
    const temaSalvo = localStorage.getItem("tema");
    const prefereEscuro = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;
    const tema = temaSalvo || (prefereEscuro ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", tema);
}

function alternarTema() {
    const temaAtual = document.documentElement.getAttribute("data-theme");
    const novoTema = temaAtual === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", novoTema);
    localStorage.setItem("tema", novoTema);
}

themeToggle.addEventListener("click", alternarTema);
inicializarTema();

// Estado da aplicação (abas e ordenação)
let abaAtiva = 0;
let planilhasCarregadas = [];
let ordenacaoAtual = "padrao";

// Listener para alteração da ordenação
if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
        ordenacaoAtual = event.target.value;
        renderizarConteudoAba(abaAtiva);
    });
}

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
        if (controlesContainer) controlesContainer.hidden = true;
        if (!errorElement.classList.contains("hidden")) return;

        listaElement.innerHTML =
            '<p class="loading">Nenhum item na lista ainda.</p>';
        return;
    }

    planilhasCarregadas = planilhasComItens;

    // Exibe o filtro de ordenação
    if (controlesContainer) {
        controlesContainer.hidden = false;
    }

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
    const itensOrdenados = ordenarItens(planilha.itens, ordenacaoAtual);

    listaElement.innerHTML = `
        <section
            class="planilha-secao"
            id="panel-${index}"
            role="tabpanel"
            aria-labelledby="tab-${index}"
        >
            <h2 class="planilha-titulo">${escapeHtml(planilha.nome)}</h2>
            ${planilhasCarregadas.length > 1 ? "" : `<h2 class="planilha-titulo">${escapeHtml(planilha.nome)}</h2>`}
            <div class="lista">
                ${itensOrdenados
                    .map((item) => {
                        const imagem = normalizarUrl(item.imagem);
                        const link = normalizarUrl(item.link);
                        const preco = formatarPreco(item.preco);

                        return `
                <div class="item">
                  ${imagem ? `<img src="${escapeHtml(imagem)}" alt="${escapeHtml(item.descricao)}" class="item-imagem" loading="lazy" onerror="this.hidden=true">` : ""}
                  ${item.descricao ? `<p class="item-descricao">${escapeHtml(item.descricao)}</p>` : ""}
                  <div class="item-footer">
                    ${preco ? `<span class="item-preco">${escapeHtml(preco)}</span>` : ""}
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

/**
 * Extrai o valor numérico de uma string de preço (ex: "80", "80,50", "1.250,00", "R$ 80").
 * Retorna null se não for possível converter para um número válido.
 */
function extrairValorNumerico(preco) {
    if (!preco || typeof preco !== "string") return null;
    const textoLimpo = preco.trim();
    if (!textoLimpo) return null;

    // Remove prefixos como 'R$', '$' e espaços extras no início
    let valor = textoLimpo.replace(/^(r\$|\$)\s*/i, "").trim();

    // Normaliza separadores decimais e de milhar
    if (valor.includes(".") && valor.includes(",")) {
        if (valor.indexOf(".") < valor.indexOf(",")) {
            // Formato brasileiro: 1.250,50 -> remove '.' e substitui ',' por '.'
            valor = valor.replace(/\./g, "").replace(",", ".");
        } else {
            // Formato americano: 1,250.50 -> remove ','
            valor = valor.replace(/,/g, "");
        }
    } else if (valor.includes(",")) {
        // Formato com vírgula: 80,50 -> substitui ',' por '.'
        valor = valor.replace(",", ".");
    } else if (/^\d{1,3}(\.\d{3})+$/.test(valor)) {
        // Milhar brasileiro sem centavos explícitos: 1.000 ou 10.000 -> remove '.'
        valor = valor.replace(/\./g, "");
    }

    const numero = Number(valor);
    return !isNaN(numero) && isFinite(numero) ? numero : null;
}

/**
 * Ordena a lista de itens com base no critério selecionado.
 * - "padrao": mantém a ordem original da planilha.
 * - "preco-asc": menor valor para o maior valor (itens sem preço vão para o final).
 * - "preco-desc": maior valor para o menor valor (itens sem preço vão para o final).
 */
function ordenarItens(itens, ordenacao) {
    if (ordenacao === "padrao") {
        return [...itens];
    }

    return [...itens].sort((a, b) => {
        const valorA = extrairValorNumerico(a.preco);
        const valorB = extrairValorNumerico(b.preco);

        // Se ambos não têm preço numérico, preserva a ordem relativa original
        if (valorA === null && valorB === null) return 0;
        // Itens sem preço ou não numéricos vão para o final
        if (valorA === null) return 1;
        if (valorB === null) return -1;

        if (ordenacao === "preco-asc") {
            return valorA - valorB;
        } else if (ordenacao === "preco-desc") {
            return valorB - valorA;
        }
        return 0;
    });
}

/**
 * Formata um valor de preço para o padrão monetário brasileiro (R$ XX,XX).
 * Lida com valores simples ("80" -> "R$ 80,00"), decimais ("80.5" ou "80,5" -> "R$ 80,50"),
 * valores já com prefixo ("R$ 80" -> "R$ 80,00") e preserva textos informativos ("A combinar").
 */
function formatarPreco(preco) {
    if (!preco || typeof preco !== "string") return "";
    const textoLimpo = preco.trim();
    if (!textoLimpo) return "";

    const numero = extrairValorNumerico(textoLimpo);

    // Se não for um valor numérico conversível, mantém o texto original
    if (numero === null) {
        return textoLimpo;
    }

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
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

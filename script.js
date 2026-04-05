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

// Função principal para carregar os dados
async function carregarLista() {
    try {
        // Carrega todas as planilhas em paralelo
        const todasPlanilhas = await Promise.all(
            PLANILHAS.map(async (planilha) => {
                const response = await fetch(planilha.url);
                if (!response.ok) {
                    throw new Error(
                        `Não foi possível acessar: ${planilha.nome}`,
                    );
                }
                const csvText = await response.text();
                const itens = parseCSV(csvText);
                return {
                    nome: planilha.nome,
                    itens: itens,
                };
            }),
        );

        renderizarLista(todasPlanilhas);
    } catch (error) {
        console.error("Erro ao carregar lista:", error);
        loadingElement.style.display = "none";
        errorElement.style.display = "block";
    }
}

// Parser simples de CSV
function parseCSV(csvText) {
    const lines = csvText.split("\n").filter((line) => line.trim());
    const headers = parseCSVLine(lines[0]);

    const itens = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length < headers.length) continue;

        const item = {};
        headers.forEach((header, index) => {
            item[header.trim().toLowerCase()] = values[index]?.trim() || "";
        });

        // Só adiciona se tiver descrição
        if (item.descricao) {
            itens.push(item);
        }
    }

    return itens;
}

// Parser de linha CSV (lida com vírgulas dentro de aspas)
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
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
    loadingElement.style.display = "none";

    // Filtra planilhas com itens
    const planilhasComItens = todasPlanilhas.filter((p) => p.itens.length > 0);

    if (planilhasComItens.length === 0) {
        listaElement.innerHTML =
            '<p class="loading">Nenhum item na lista ainda.</p>';
        return;
    }

    listaElement.innerHTML = planilhasComItens
        .map(
            (planilha) => `
        <section class="planilha-secao">
            <h2 class="planilha-titulo">${escapeHtml(planilha.nome)}</h2>
            <div class="lista">
                ${planilha.itens
                    .map(
                        (item) => `
                <div class="item">
                  ${item.imagem ? `<img src="${escapeHtml(item.imagem)}" alt="${escapeHtml(item.descricao)}" class="item-imagem" onerror="this.style.display='none'">` : ""}
                  ${item.descricao ? `<p class="item-descricao">${escapeHtml(item.descricao)}</p>` : ""}
                  <div class="item-footer">
                    ${item.preco ? `<span class="item-preco">${escapeHtml(item.preco)}</span>` : ""}
                    ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="item-link">Ver produto</a>` : ""}
                  </div>
                </div>
              `,
                    )
                    .join("")}
            </div>
        </section>
    `,
        )
        .join("");
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Inicializa quando a página carregar
document.addEventListener("DOMContentLoaded", carregarLista);

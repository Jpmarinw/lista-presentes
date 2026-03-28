// CONFIGURAÇÃO: URL direta da planilha publicada como CSV
// Substitua pela sua URL completa gerada pelo Google Sheets
const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRb2HzUZZRSGO354U15R7_jgcK3hl9rh6cFMpzxwWnheFMa43OTKInsYC_Hmn2c1kE39nG_NCP3Q3Cl/pub?gid=0&single=true&output=csv";

// Elementos do DOM
const listaElement = document.getElementById("lista-presentes");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");

// Função principal para carregar os dados
async function carregarLista() {
    try {
        const response = await fetch(CSV_URL);

        if (!response.ok) {
            throw new Error("Não foi possível acessar a planilha");
        }

        const csvText = await response.text();
        const itens = parseCSV(csvText);

        renderizarLista(itens);
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
function renderizarLista(itens) {
    loadingElement.style.display = "none";

    if (itens.length === 0) {
        listaElement.innerHTML =
            '<p class="loading">Nenhum item na lista ainda.</p>';
        return;
    }

    listaElement.innerHTML = itens
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

// CONFIGURAÇÃO: Coloque o ID da sua planilha Google Sheets aqui
// Exemplo: Se a URL é https://docs.google.com/spreadsheets/d/1ABC123xyz/edit
// O ID é: 1ABC123xyz
const PLANILHA_ID = 'SEU_ID_DA_PLANILHA_AQUI';

// URL para exportar a planilha como CSV
const CSV_URL = `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/export?format=csv`;

// Elementos do DOM
const listaElement = document.getElementById('lista-presentes');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');

// Função principal para carregar os dados
async function carregarLista() {
  try {
    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      throw new Error('Não foi possível acessar a planilha');
    }

    const csvText = await response.text();
    const itens = parseCSV(csvText);
    
    renderizarLista(itens);
  } catch (error) {
    console.error('Erro ao carregar lista:', error);
    loadingElement.style.display = 'none';
    errorElement.style.display = 'block';
  }
}

// Parser simples de CSV
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const itens = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < headers.length) continue;
    
    const item = {};
    headers.forEach((header, index) => {
      item[header.trim().toLowerCase()] = values[index]?.trim() || '';
    });
    
    // Só adiciona se tiver nome
    if (item.nome) {
      itens.push(item);
    }
  }
  
  return itens;
}

// Parser de linha CSV (lida com vírgulas dentro de aspas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Renderiza a lista na tela
function renderizarLista(itens) {
  loadingElement.style.display = 'none';
  
  if (itens.length === 0) {
    listaElement.innerHTML = '<p class="loading">Nenhum item na lista ainda.</p>';
    return;
  }
  
  listaElement.innerHTML = itens.map(item => `
    <div class="item">
      <div class="item-header">
        <h3 class="item-nome">${escapeHtml(item.nome)}</h3>
        ${item.preco ? `<span class="item-preco">${escapeHtml(item.preco)}</span>` : ''}
      </div>
      ${item.descricao ? `<p class="item-descricao">${escapeHtml(item.descricao)}</p>` : ''}
      ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="item-link">Ver produto</a>` : ''}
    </div>
  `).join('');
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', carregarLista);

# 🎁 Minha Lista de Presentes

Site simples para compartilhar minha lista de presentes com minha namorada, usando Google Sheets como backend.

## 🚀 Como Configurar

### Passo 1: Criar a Planilha no Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Na **primeira linha**, adicione os seguintes cabeçalhos (exatamente assim):

    | nome | descricao | preco | link |
    | ---- | --------- | ----- | ---- |

4. Preencha com os itens que você quer de presente

    **Exemplo:**

    ```
    nome: Fone de Ouvido
    descricao: JBL Tune 520BT, Bluetooth
    preco: R$ 299,00
    link: https://amazon.com.br/...
    ```

### Passo 2: Publicar a Planilha

1. No Google Sheets, clique em **Arquivo** > **Compartilhar** > **Publicar na web**
2. Em "Link", escolha **Toda a planilha**
3. Em "Formato", escolha **Valores separados por vírgula (.csv)**
4. Clique em **Publicar**
5. Copie o link gerado

### Passo 3: Configurar o Site

1. Abra o arquivo `script.js`
2. Na linha 3, substitua a URL pela que você copiou:

    ```javascript
    const CSV_URL =
        "https://docs.google.com/spreadsheets/d/e/SEU_LINK_AQUI/pub?gid=0&single=true&output=csv";
    ```

3. Salve o arquivo

### Passo 4: Publicar no GitHub Pages

1. Crie um repositório no GitHub (pode ser privado ou público)
2. Faça push dos arquivos para o repositório:

    ```bash
    git init
    git add .
    git commit -m "Primeiro commit - lista de presentes"
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/lista-presentes.git
    git push -u origin main
    ```

3. Vá nas **Settings** do repositório
4. Clique em **Pages** (no menu lateral)
5. Em **Source**, escolha `main` e salve
6. Aguarde alguns minutos e seu site estará no ar!

    URL: `https://SEU_USUARIO.github.io/lista-presentes/`

## 📁 Estrutura dos Arquivos

```
lista-presentes/
├── index.html      # Página principal
├── style.css       # Estilos e design
├── script.js       # Lógica para buscar dados da planilha
└── README.md       # Este arquivo
```

## ✏️ Como Atualizar a Lista

Sempre que quiser adicionar ou remover itens:

1. Abra sua planilha no Google Sheets
2. Adicione/edite/remova os itens
3. **Pronto!** O site atualiza automaticamente em até 5 minutos

Não precisa mexer no código!

## 🎨 Personalização

Se quiser mudar as cores ou o design, edite o arquivo `style.css`.

## 📝 Licença

Feito com 💜 para compartilhar amor!

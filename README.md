# 🎁 Minha Lista de Presentes

Site simples para compartilhar listas de presentes com quem você quiser, usando Google Sheets como backend.

## 🚀 Como Configurar

### Passo 1: Criar as Planilhas no Google Sheets

Cada pessoa pode ter sua própria planilha!

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha (uma para cada pessoa)
3. Na **primeira linha**, adicione os seguintes cabeçalhos (exatamente assim):

    | descricao | preco | link | imagem |
    | --------- | ----- | ---- | ------ |

4. Preencha com os itens que você quer de presente

    **Exemplo:**

    ```
    descricao: Fone de Ouvido JBL Tune 520BT - Bluetooth
    preco: R$ 299,00
    link: https://amazon.com.br/...
    imagem: https://m.media-amazon.com/images/I/61u9RZWrRlL._SL1500_.jpg
    ```

    **Dica:** Para pegar o link da imagem, abra o produto no site, clique com o botão direito na imagem e escolha "Copiar endereço da imagem". A coluna `imagem` é opcional.

### Passo 2: Publicar as Planilhas

Para **cada planilha**:

1. No Google Sheets, clique em **Arquivo** > **Compartilhar** > **Publicar na web**
2. Em "Link", escolha **Toda a planilha**
3. Em "Formato", escolha **Valores separados por vírgula (.csv)**
4. Clique em **Publicar**
5. Copie o link gerado

### Passo 3: Configurar o Site

1. Abra o arquivo `script.js`
2. Nas linhas 3-12, configure as planilhas:

    ```javascript
    const PLANILHAS = [
        {
            url: "https://docs.google.com/spreadsheets/d/e/SEU_LINK_AQUI/pub?gid=0&single=true&output=csv",
            nome: "Meus Presentes", // Nome que aparece no site
        },
        {
            url: "https://docs.google.com/spreadsheets/d/e/OUTRO_LINK_AQUI/pub?gid=0&single=true&output=csv",
            nome: "Presentes Dela", // Nome da outra pessoa
        },
    ];
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

## ➕ Como Adicionar Outra Planilha

Para adicionar a planilha de outra pessoa:

1. Crie a planilha dela no Google Sheets (mesmo formato)
2. Publique como CSV (Arquivo > Compartilhar > Publicar na web)
3. Copie o link
4. No `script.js`, adicione um novo objeto no array `PLANILHAS`:

    ```javascript
    const PLANILHAS = [
        {
            url: "https://docs.google.com/.../pub?gid=0&single=true&output=csv",
            nome: "Meus Presentes",
        },
        {
            url: "https://docs.google.com/.../pub?gid=0&single=true&output=csv",
            nome: "Presentes Dela",
        },
        // Adicione mais conforme precisar
    ];
    ```

5. Faça commit e push: `git add . && git commit -m "add planilha dela" && git push`

## 🎨 Personalização

Se quiser mudar as cores ou o design, edite o arquivo `style.css`.

## 📝 Licença

Feito com 💜 para compartilhar amor!

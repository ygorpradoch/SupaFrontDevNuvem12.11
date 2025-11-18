const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');
const formTitle = document.querySelector('#form-title');
const submitButton = document.querySelector('#submit-button');
const actionButtonsContainer = document.querySelector('#action-buttons');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const showAllButton = document.querySelector('#show-all-button');

// Variável para rastrear o produto em edição
let editingProductId = null;

// --- Funções de Fetch (Backend) ---

// Função para buscar todos os produtos
async function fetchProducts() {
  const response = await fetch('http://13.59.214.226:3000/products');
  const products = await response.json();
  renderProducts(products);
  setFormMode('add'); 
}

// Função para buscar produtos por ID
async function fetchProductById(id) {
    const response = await fetch(`http://13.59.214.226:3000/products/${id}`);
    const data = await response.json();
    return data; // Retorna array, pode ser vazia
}

// Função para buscar produtos por nome
async function searchProductsByName(name) {
  const response = await fetch(`http://13.59.214.226:3000/products/search?name=${name}`);
  const products = await response.json();
  return products;
}

// Função de busca unificada (ID ou Nome)
async function searchProducts(searchTerm) {
    let products = [];
    searchTerm = searchTerm.trim();

    // 1. Tenta buscar por ID se o termo for um número inteiro
    const id = parseInt(searchTerm);
    if (!isNaN(id) && id.toString() === searchTerm) {
        const productData = await fetchProductById(id);
        if (productData.length > 0) {
            products = productData;
        }
    }
    
    // 2. Se não encontrou por ID ou se o termo não era um ID, tenta buscar por Nome
    if (products.length === 0) {
        products = await searchProductsByName(searchTerm);
    }

    renderProducts(products);
}

// Função para adicionar um novo produto
async function addProduct(name, description, price) {
  const response = await fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, price })
  });
  return response.json();
}

// Função para atualizar um produto existente
async function updateProduct(id, name, description, price) {
  const response = await fetch(`http://13.59.214.226:3000/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description, price })
  });
  return response.json();
}

// Função para deletar um produto
async function deleteProduct(id) {
  const response = await fetch('http://13.59.214.226:3000/products/' + id, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
  });
  return response.json();
}

// --- Funções de Renderização e UI ---

// Função para renderizar a lista de produtos
function renderProducts(products) {
  productList.innerHTML = ''; // Limpar lista
  
  if (products.length === 0) {
    productList.innerHTML = '<li class="no-products">Nenhum produto encontrado.</li>';
    return;
  }

  products.forEach(product => {
    const li = document.createElement('li');
    li.classList.add('product-item');
    li.innerHTML = `
      <div class="product-details">
        <strong>${product.name}</strong> 
        <span class="product-id">ID: ${product.id}</span>
        <p class="product-description">${product.description || 'Sem descrição.'}</p>
        <span class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</span>
      </div>
    `;

    // Botão de Delete
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Deletar';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', async () => {
      await deleteProduct(product.id);
      await fetchProducts();
    });
    
    // Botão de Update/Edição
    const updateButton = document.createElement('button');
    updateButton.innerHTML = 'Editar';
    updateButton.classList.add('update-button');
    updateButton.addEventListener('click', () => {
      loadProductForEditing(product);
    });
    
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('product-actions');
    buttonContainer.appendChild(updateButton);
    buttonContainer.appendChild(deleteButton);
    
    li.appendChild(buttonContainer);
    productList.appendChild(li);
  });
}

// Função para alternar o modo do formulário (adicionar ou editar)
function setFormMode(mode) {
    if (mode === 'add') {
        editingProductId = null;
        formTitle.textContent = 'Adicionar Produto';
        addProductForm.reset();
        
        actionButtonsContainer.innerHTML = '';
        const addButton = document.createElement('button');
        addButton.setAttribute('type', 'submit');
        addButton.setAttribute('id', 'submit-button');
        addButton.textContent = 'Adicionar';
        actionButtonsContainer.appendChild(addButton);

    } else if (mode === 'edit') {
        formTitle.textContent = 'Editar Produto (ID: ' + editingProductId + ')';
        
        actionButtonsContainer.innerHTML = '';
        
        // Botão Salvar Alterações
        const saveButton = document.createElement('button');
        saveButton.setAttribute('type', 'submit');
        saveButton.setAttribute('id', 'save-changes-button');
        saveButton.classList.add('edit-mode-button');
        saveButton.textContent = 'Salvar Alterações';
        actionButtonsContainer.appendChild(saveButton);

        // Botão Cancelar Edição
        const cancelButton = document.createElement('button');
        cancelButton.setAttribute('type', 'button');
        cancelButton.setAttribute('id', 'cancel-edit-button');
        cancelButton.classList.add('cancel-mode-button');
        cancelButton.textContent = 'Cancelar Edição';
        cancelButton.addEventListener('click', () => setFormMode('add'));
        actionButtonsContainer.appendChild(cancelButton);
    }
}

// Função para carregar dados do produto no formulário
function loadProductForEditing(product) {
    editingProductId = product.id;
    addProductForm.elements['name'].value = product.name;
    addProductForm.elements['description'].value = product.description || '';
    addProductForm.elements['price'].value = product.price;
    setFormMode('edit');
}

// --- Listeners de Eventos ---

// Listener para o formulário de Adicionar/Editar Produto
addProductForm.addEventListener('submit', async event => {
    event.preventDefault();
    
    const name = addProductForm.elements['name'].value;
    const description = addProductForm.elements['description'].value;
    const price = addProductForm.elements['price'].value;

    if (editingProductId) {
        // Modo Edição (Update)
        await updateProduct(editingProductId, name, description, price);
    } else {
        // Modo Adicionar (Create)
        await addProduct(name, description, price);
    }

    setFormMode('add'); 
    await fetchProducts(); // Recarrega a lista
});

// Listener para o botão de Busca
searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        await searchProducts(searchTerm);
        showAllButton.style.display = 'inline-block';
    } else {
        await fetchProducts();
        showAllButton.style.display = 'none';
    }
});

// Listener para o campo de Busca (permitir busca ao pressionar Enter)
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Previne a submissão do formulário pai
        searchButton.click();
    }
});

// Listener para o botão 'Mostrar Todos'
showAllButton.addEventListener('click', async () => {
    searchInput.value = '';
    showAllButton.style.display = 'none';
    await fetchProducts();

});

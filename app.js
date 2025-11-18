// --- 1. Seleção de Elementos ---

// URL da API (é bom ter em um só lugar)
const API_URL = 'http://13.58.80.140:3000/products';

// Elementos da DOM
const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');

// Título e Botões do Formulário (do nosso novo HTML)
const formTitle = document.querySelector('#form-title');
const addButton = document.querySelector('#add-button');
const updateButton = document.querySelector('#update-button');
const cancelButton = document.querySelector('#cancel-button');

// Variável para guardar o ID do produto que estamos editando
let currentEditingId = null;

// --- 2. Funções de API (Fetch) ---

/**
 * Busca todos os produtos e atualiza a lista na tela.
 */
async function fetchProducts() {
  const response = await fetch(API_URL);
  const products = await response.json();

  // Limpa a lista antes de adicionar
  productList.innerHTML = '';

  // Adiciona cada produto à lista
  products.forEach(product => {
    const li = document.createElement('li');
    li.innerHTML = `${product.name} - $${product.price}`;

    // Botão Delete (Seu código estava correto)
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      await deleteProduct(product.id);
      await fetchProducts(); // Recarrega a lista
    });
    li.appendChild(deleteBtn);

    // Botão Update (CORRIGIDO)
    // Agora chama 'showUpdateForm' e passa o objeto 'product' inteiro
    const updateBtn = document.createElement('button');
    updateBtn.innerHTML = 'Update';
    updateBtn.addEventListener('click', () => {
      showUpdateForm(product); // Chama a nova função
    });
    li.appendChild(updateBtn);

    productList.appendChild(li);
  });
}

/**
 * Adiciona um novo produto ao banco de dados.
 * (CORRIGIDO: agora envia 'description')
 */
async function addProduct(name, price, description) {
  await fetch(API_URL, {
    method: 'POST', //
    headers: {
      'Content-Type': 'application/json'
    },
    // 'description' foi adicionado ao corpo
    body: JSON.stringify({ name, price, description })
  });
}

/**
 * Deleta um produto do banco de dados.
 * (Seu código estava correto)
 */
async function deleteProduct(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE', //
  });
}

/**
 * (NOVA FUNÇÃO)
 * Atualiza um produto existente no banco de dados.
 */
async function updateProduct(id, name, price, description) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT', //
    headers: {
      'Content-Type': 'application/json'
    },
    // Envia o corpo completo com as novas informações
    body: JSON.stringify({ name, price, description })
  });
}

// --- 3. Funções de Manipulação do Formulário ---

/**
 * (NOVA FUNÇÃO)
 * Prepara o formulário para o modo "Update".
 */
function showUpdateForm(product) {
  // Preenche os campos do formulário com os dados do produto clicado
  addProductForm.elements['name'].value = product.name;
  addProductForm.elements['price'].value = product.price;
  // Se 'description' for nulo, define como string vazia
  addProductForm.elements['description'].value = product.description ?? '';

  // Guarda o ID do produto que estamos editando
  currentEditingId = product.id;

  // Altera a aparência e os botões do formulário
  formTitle.textContent = 'Update Product'; // Muda o título
  addButton.style.display = 'none'; // Esconde 'Add'
  updateButton.style.display = 'inline-block'; // Mostra 'Confirm Update'
  cancelButton.style.display = 'inline-block'; // Mostra 'Cancel'
}

/**
 * (NOVA FUNÇÃO)
 * Reseta o formulário de volta ao modo "Add".
 */
function resetForm() {
  addProductForm.reset(); // Limpa os campos
  currentEditingId = null;

  // Restaura o título e os botões originais
  formTitle.textContent = 'Add Product';
  addButton.style.display = 'inline-block'; // Mostra 'Add'
  updateButton.style.display = 'none'; // Esconde 'Confirm Update'
  cancelButton.style.display = 'none'; // Esconde 'Cancel'
}

/**
 * (NOVA FUNÇÃO)
 * Chamada quando o botão "Confirm Update" é clicado.
 */
async function submitUpdate() {
  if (!currentEditingId) return; // Só continua se estivermos editando

  // Pega os valores *novos* do formulário
  const name = addProductForm.elements['name'].value;
  const price = addProductForm.elements['price'].value;
  const description = addProductForm.elements['description'].value;

  // Chama a função da API para atualizar
  await updateProduct(currentEditingId, name, price, description);

  resetForm(); // Reseta o formulário
  await fetchProducts(); // Recarrega a lista de produtos
}

// --- 4. Event Listeners ---

// Listener para o formulário (Modo "Add")
// (Seu código, mas agora usa a função 'addProduct' corrigida)
addProductForm.addEventListener('submit', async event => {
  event.preventDefault(); // Impede o recarregamento da página

  // Pega os valores
  const name = addProductForm.elements['name'].value;
  const price = addProductForm.elements['price'].value;
  const description = addProductForm.elements['description'].value;

  // Chama a função da API (já corrigida)
  await addProduct(name, price, description);

  addProductForm.reset(); // Limpa o formulário
  await fetchProducts(); // Recarrega a lista
});

// (NOVOS LISTENERS)
// Adiciona os eventos aos botões "Confirm Update" e "Cancel"
updateButton.addEventListener('click', submitUpdate);
cancelButton.addEventListener('click', resetForm);

// --- 5. Inicialização ---
// Busca os produtos quando a página carrega
fetchProducts();
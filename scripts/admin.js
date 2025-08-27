// scripts/admin.js

// Importa as funções e instâncias do Firebase
import { auth, db, collection, getDocs, signInWithEmailAndPassword, onAuthStateChanged, signOut, addDoc, doc, updateDoc, deleteDoc } from '../firebase-config.js';

// Elementos do DOM
const loginFormSection = document.getElementById('login-form-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const agendamentosList = document.getElementById('agendamentos-list');
const servicosList = document.getElementById('servicos-list');
const servicoForm = document.getElementById('servico-form');

// Seções
const agendamentosSection = document.getElementById('agendamentos-section');
const servicosSection = document.getElementById('servicos-section');
const configSection = document.getElementById('config-section');

// Função para verificar o estado da autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        loginFormSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        carregarAgendamentos();
    } else {
        // Usuário deslogado
        loginFormSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // A função onAuthStateChanged cuidará da exibição do painel
    } catch (error) {
        alert("Erro no login: " + error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});

// Navegação do painel
document.getElementById('show-agendamentos').addEventListener('click', () => {
    ocultarTodasAsSecoes();
    agendamentosSection.classList.remove('hidden');
    carregarAgendamentos();
});
document.getElementById('show-servicos').addEventListener('click', () => {
    ocultarTodasAsSecoes();
    servicosSection.classList.remove('hidden');
    carregarServicosAdmin();
});
document.getElementById('show-config').addEventListener('click', () => {
    ocultarTodasAsSecoes();
    configSection.classList.remove('hidden');
    // TODO: Carregar configurações
});

function ocultarTodasAsSecoes() {
    agendamentosSection.classList.add('hidden');
    servicosSection.classList.add('hidden');
    configSection.classList.add('hidden');
}

// --- Gerenciamento de Agendamentos (READ/UPDATE) ---
async function carregarAgendamentos() {
    agendamentosList.innerHTML = '<li>Carregando agendamentos...</li>';
    try {
        const agendamentosCol = collection(db, 'agendamentos');
        const agendamentosSnapshot = await getDocs(agendamentosCol);
        agendamentosList.innerHTML = '';
        agendamentosSnapshot.forEach(doc => {
            const agendamento = doc.data();
            const li = document.createElement('li');
            li.className = 'agendamento-item';
            li.innerHTML = `
                <div>
                    <strong>Cliente:</strong> ${agendamento.nome}<br>
                    <strong>Serviço(s):</strong> ${agendamento.servicos.map(s => s.nome).join(', ')}<br>
                    <strong>Data:</strong> ${agendamento.data} - ${agendamento.horario}<br>
                    <strong>Status:</strong> <span id="status-${doc.id}">${agendamento.status}</span>
                </div>
                <div>
                    <button class="edit-agendamento" data-id="${doc.id}">Editar</button>
                    <button class="delete-agendamento" data-id="${doc.id}">Excluir</button>
                </div>
            `;
            agendamentosList.appendChild(li);
        });
        adicionarListenersAgendamentos();
    } catch (e) {
        console.error("Erro ao carregar agendamentos: ", e);
    }
}

function adicionarListenersAgendamentos() {
    document.querySelectorAll('.edit-agendamento').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            // TODO: Implementar modal ou formulário para edição do agendamento
            alert('Funcionalidade de edição a ser implementada para o agendamento ID: ' + id);
        });
    });
    document.querySelectorAll('.delete-agendamento').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("Tem certeza que deseja excluir este agendamento?")) {
                try {
                    await deleteDoc(doc(db, 'agendamentos', id));
                    carregarAgendamentos();
                    alert('Agendamento excluído com sucesso!');
                } catch (e) {
                    console.error("Erro ao excluir agendamento: ", e);
                    alert('Erro ao excluir agendamento.');
                }
            }
        });
    });
}

// --- Gerenciamento de Serviços (CRUD) ---
async function carregarServicosAdmin() {
    servicosList.innerHTML = '<li>Carregando serviços...</li>';
    try {
        const servicosCol = collection(db, 'servicos');
        const servicosSnapshot = await getDocs(servicosCol);
        servicosList.innerHTML = '';
        servicosSnapshot.forEach(doc => {
            const servico = doc.data();
            const li = document.createElement('li');
            li.className = 'servico-item';
            li.innerHTML = `
                <div>
                    <strong>${servico.nome}</strong> (${servico.categoria}) - R$ ${servico.precoBase.toFixed(2)}
                </div>
                <div>
                    <button class="edit-servico" data-id="${doc.id}">Editar</button>
                    <button class="delete-servico" data-id="${doc.id}">Excluir</button>
                </div>
            `;
            servicosList.appendChild(li);
        });
        adicionarListenersServicos();
    } catch (e) {
        console.error("Erro ao carregar serviços: ", e);
    }
}

function adicionarListenersServicos() {
    // ... (Implementar a lógica de edição e exclusão de serviços aqui)
}

document.getElementById('add-servico-btn').addEventListener('click', () => {
    servicoForm.classList.toggle('hidden');
    // TODO: Criar e mostrar o formulário de adição/edição de serviços
});

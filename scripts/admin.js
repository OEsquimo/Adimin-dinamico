// scripts/admin.js

// Importa as funções e instâncias do Firebase
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, db, collection, getDocs, doc, updateDoc, deleteDoc } from './firebase-config.js';

// Função para adicionar um carimbo de data e hora aos arquivos para forçar a atualização
function forcarAtualizacao() {
    const scripts = document.querySelectorAll('script[src]');
    const links = document.querySelectorAll('link[href]');
    const timestamp = Date.now();

    scripts.forEach(script => {
        if (script.src.includes('scripts/')) {
            script.src = `${script.src}?v=${timestamp}`;
        }
    });

    links.forEach(link => {
        if (link.href.includes('styles.css')) {
            link.href = `${link.href}?v=${timestamp}`;
        }
    });
}
forcarAtualizacao();

// Função para exibir a data e hora da última atualização
function mostrarDataAtualizacao() {
    const elementoData = document.getElementById('ultima-atualizacao');
    if (elementoData) {
        const dataModificacao = new Date(document.lastModified);
        elementoData.textContent = "Última atualização: " + dataModificacao.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}
mostrarDataAtualizacao();

// Adiciona um listener para garantir que o script só rode após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {

    // Elementos do DOM
    const loginFormSection = document.getElementById('login-form-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const agendamentosList = document.getElementById('agendamentos-list');

    // Listener para o estado da autenticação
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário logado
            loginFormSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            carregarAgendamentos(); // Chama a função para carregar os dados
        } else {
            // Usuário deslogado
            loginFormSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
    });

    // Função para carregar e exibir os agendamentos
    async function carregarAgendamentos() {
        agendamentosList.innerHTML = '<li>Carregando agendamentos...</li>';
        try {
            const agendamentosCol = collection(db, 'agendamentos');
            const agendamentosSnapshot = await getDocs(agendamentosCol);

            if (agendamentosSnapshot.empty) {
                agendamentosList.innerHTML = '<li>Nenhum agendamento encontrado.</li>';
                return;
            }

            agendamentosList.innerHTML = ''; // Limpa a lista
            agendamentosSnapshot.forEach(doc => {
                const agendamento = doc.data();
                const agendamentoItem = document.createElement('li');
                agendamentoItem.className = 'agendamento-item';
                agendamentoItem.innerHTML = `
                    <div>
                        <strong>Nome:</strong> ${agendamento.nome}<br>
                        <strong>WhatsApp:</strong> ${agendamento.whatsapp}<br>
                        <strong>Data:</strong> ${agendamento.data} às ${agendamento.horario}<br>
                        <strong>Valor:</strong> R$ ${agendamento.valorTotal.toFixed(2)}<br>
                        <strong>Serviços:</strong> ${agendamento.servicos.map(s => s.nome).join(', ')}
                    </div>
                    <div>
                        <button class="status-btn" data-id="${doc.id}" data-status="Concluído">Concluir</button>
                        <button class="status-btn" data-id="${doc.id}" data-status="Cancelado">Cancelar</button>
                    </div>
                `;
                agendamentosList.appendChild(agendamentoItem);
            });

            // Adiciona event listeners aos botões de status
            document.querySelectorAll('.status-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const novoStatus = e.target.getAttribute('data-status');
                    const agendamentoDoc = doc(db, 'agendamentos', id);
                    try {
                        await updateDoc(agendamentoDoc, {
                            status: novoStatus
                        });
                        alert(`Status do agendamento ${id} atualizado para ${novoStatus}.`);
                        carregarAgendamentos(); // Recarrega a lista
                    } catch (error) {
                        console.error("Erro ao atualizar status: ", error);
                        alert("Ocorreu um erro ao atualizar o status.");
                    }
                });
            });

        } catch (e) {
            console.error("Erro ao carregar agendamentos: ", e);
            agendamentosList.innerHTML = '<li>Erro ao carregar agendamentos.</li>';
        }
    }

    // Lógica de navegação do menu
    document.getElementById('show-agendamentos').addEventListener('click', () => {
        document.getElementById('agendamentos-section').classList.remove('hidden');
        document.getElementById('servicos-section').classList.add('hidden');
        document.getElementById('config-section').classList.add('hidden');
        carregarAgendamentos();
    });

    document.getElementById('show-servicos').addEventListener('click', () => {
        document.getElementById('agendamentos-section').classList.add('hidden');
        document.getElementById('servicos-section').classList.remove('hidden');
        document.getElementById('config-section').classList.add('hidden');
        // TODO: Implementar lógica para carregar e gerenciar serviços
    });

    document.getElementById('show-config').addEventListener('click', () => {
        document.getElementById('agendamentos-section').classList.add('hidden');
        document.getElementById('servicos-section').classList.add('hidden');
        document.getElementById('config-section').classList.remove('hidden');
        // TODO: Implementar lógica para carregar e gerenciar configurações
    });


    // Login do administrador
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // Captura os valores dos campos de e-mail e senha
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            
            if (!email || !password) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            try {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("Login bem-sucedido.");
            } catch (error) {
                let mensagemErro = "Ocorreu um erro no login.";
                if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    mensagemErro = "E-mail ou senha incorretos. Por favor, tente novamente.";
                } else if (error.code === 'auth/network-request-failed') {
                    mensagemErro = "Erro de conexão. Verifique sua internet.";
                }
                
                alert(mensagemErro);
                console.error("Erro de login: ", error);
            }
        });
    }

    // Lógica para logout (certifique-se de que este botão existe no HTML)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
            console.log("Logout bem-sucedido.");
            alert("Você foi desconectado.");
        });
    }

});

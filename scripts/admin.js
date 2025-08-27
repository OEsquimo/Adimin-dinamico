// scripts/admin.js

// Importa as funções e instâncias do Firebase
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, db, collection, getDocs, doc, updateDoc, deleteDoc } from '../firebase-config.js';

// Elementos do DOM
const loginFormSection = document.getElementById('login-form-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

// ... (outras constantes e funções, como carregarAgendamentos, etc.) ...

// Login do administrador
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Captura os valores dos campos de e-mail e senha
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    
    // Simples validação para garantir que os campos não estão vazios
    if (!email || !password) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        // Tenta fazer a autenticação com o Firebase Authentication
        await signInWithEmailAndPassword(auth, email, password);
        
        // Se a autenticação for bem-sucedida, o listener onAuthStateChanged cuidará da navegação.
        console.log("Login bem-sucedido.");
        
    } catch (error) {
        // Captura e exibe a mensagem de erro fornecida pelo Firebase
        let mensagemErro = "Ocorreu um erro no login.";
        if (error.code === 'auth/invalid-email') {
            mensagemErro = "E-mail inválido. Verifique o formato.";
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            mensagemErro = "E-mail ou senha incorretos. Por favor, tente novamente.";
        }
        // ... (você pode adicionar mais casos de erro se desejar) ...

        alert(mensagemErro);
        console.error("Erro de login: ", error);
    }
});

// Listener para o estado da autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        loginFormSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        carregarAgendamentos(); // Exemplo de função que carrega dados
    } else {
        // Usuário deslogado
        loginFormSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
});

// ... (o restante do seu código para gerenciar agendamentos, serviços, etc.) ...

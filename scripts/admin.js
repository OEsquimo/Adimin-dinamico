// scripts/admin.js

// Importa as funções e instâncias do Firebase
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, db, collection, getDocs, doc, updateDoc, deleteDoc } from '../firebase-config.js';

// Adiciona um listener para garantir que o script só rode após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {

    // Elementos do DOM
    const loginFormSection = document.getElementById('login-form-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Listener para o estado da autenticação
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário logado
            loginFormSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            // Certifique-se de que a função carregarAgendamentos() existe no resto do seu código
            // carregarAgendamentos(); 
        } else {
            // Usuário deslogado
            loginFormSection.style.display = 'block';
            dashboardSection.style.display = 'none';
        }
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

    // ... (o restante do seu código para gerenciar agendamentos, serviços, etc.) ...
});

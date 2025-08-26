// Elementos da interface
const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');
const loginMessage = document.getElementById('login-message');
const btnLogout = document.getElementById('btn-logout');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Estado da aplicação
let currentUser = null;

// Função para verificar autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        if (loginScreen) loginScreen.classList.add('hidden');
        if (adminPanel) adminPanel.classList.remove('hidden');
        
        // Atualizar informações do usuário
        if (userAvatar) userAvatar.textContent = user.email.charAt(0).toUpperCase();
        if (userName) userName.textContent = user.displayName || user.email;
        if (userEmail) userEmail.textContent = user.email;
        
    } else {
        currentUser = null;
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
    }
});

// Evento de login
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        const email = loginEmail.value;
        const password = loginPassword.value;
        
        if (!email || !password) {
            if (loginMessage) loginMessage.textContent = 'Por favor, preencha todos os campos.';
            return;
        }
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                showNotification('Login realizado com sucesso!');
                if (loginMessage) loginMessage.textContent = '';
            })
            .catch((error) => {
                if (loginMessage) loginMessage.textContent = 'E-mail ou senha inválidos.';
                console.error('Erro de login:', error);
            });
    });
}

// Evento de logout
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                showNotification('Logout realizado com sucesso!');
            })
            .catch((error) => {
                console.error('Erro ao fazer logout:', error);
            });
    });
}

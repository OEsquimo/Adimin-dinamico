// Navegação do menu
document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.id === 'btn-logout') return;
        
        e.preventDefault();
        
        // Remove a classe active de todos os links
        document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
        
        // Adiciona a classe active ao link clicado
        this.classList.add('active');
        
        // Oculta todas as seções
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        
        // Mostra a seção correspondente
        const target = this.getAttribute('href').substring(1);
        document.getElementById(target).classList.add('active');
        
        // Atualiza o header
        document.querySelector('.header h2').textContent = this.textContent.trim();
        
        // Carrega dados específicos da seção
        if (target === 'agendamentos') {
            loadAllAppointments();
        } else if (target === 'servicos') {
            loadServices();
        } else if (target === 'dashboard') {
            loadDashboardData();
        } else if (target === 'configuracoes') {
            loadConfig();
        }
    });
});

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se há parâmetros de erro na URL (para redirecionamento de login)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
        showNotification('Por favor, faça login para acessar o painel.', 'error');
    }
    
    // Carregar dados iniciais se o usuário estiver logado
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadDashboardData();
            loadServices();
            loadConfig();
        }
    });
});

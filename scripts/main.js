// Carregar serviços no site principal
async function loadServicesForWebsite() {
    try {
        const servicesSnapshot = await db.collection('services')
            .where('ativo', '==', true)
            .orderBy('nome')
            .get();
        
        const servicesContainer = document.getElementById('services-container');
        if (!servicesContainer) return;
        
        servicesContainer.innerHTML = '';
        
        if (servicesSnapshot.empty) {
            servicesContainer.innerHTML = '<div class="loading">Nenhum serviço disponível no momento.</div>';
            return;
        }
        
        servicesSnapshot.forEach(doc => {
            const data = doc.data();
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            
            serviceCard.innerHTML = `
                <div class="service-icon">
                    <i class="${data.icone || 'fas fa-tools'}"></i>
                </div>
                <h3>${data.nome || 'Serviço'}</h3>
                <p>${data.descricao || 'Descrição do serviço'}</p>
                <div class="service-price">R$ ${data.precoBase?.toFixed(2) || '0,00'}</div>
                <a href="#contact" class="btn btn-primary">Solicitar Orçamento</a>
            `;
            
            servicesContainer.appendChild(serviceCard);
        });
        
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        const servicesContainer = document.getElementById('services-container');
        if (servicesContainer) {
            servicesContainer.innerHTML = '<div class="loading">Erro ao carregar serviços.</div>';
        }
    }
}

// Carregar informações de contato
async function loadContactInfo() {
    try {
        const configDoc = await db.collection('configuracoes').doc('geral').get();
        
        if (configDoc.exists) {
            const data = configDoc.data();
            
            // Atualizar número de telefone se disponível
            if (data.whatsapp && document.getElementById('contact-phone')) {
                document.getElementById('contact-phone').textContent = data.whatsapp;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar informações de contato:', error);
    }
}

// Menu mobile
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Carregar dados do site
    loadServicesForWebsite();
    loadContactInfo();
});

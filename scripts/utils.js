// Função para mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Formatar data para o formato dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Função auxiliar para obter nomes dos serviços
function getServiceNames(servicos) {
    if (!servicos) return 'N/A';
    
    const names = [];
    for (const key in servicos) {
        names.push(servicos[key].nome);
    }
    
    return names.join(', ');
}

// Função auxiliar para obter texto do status
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'confirmed': 'Confirmado',
        'completed': 'Concluído',
        'canceled': 'Cancelado'
    };
    
    return statusMap[status] || 'Pendente';
}

// Função para resetar formulário de serviço
function resetServiceForm() {
    document.getElementById('service-name').value = '';
    document.getElementById('service-desc').value = '';
    document.getElementById('service-price').value = '';
    document.getElementById('service-icon').value = '';
    document.getElementById('service-type').value = '';
    document.getElementById('service-requires-electrical').checked = false;
    document.getElementById('service-status').value = 'active';
}

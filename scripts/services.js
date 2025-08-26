// Estado da aplicação
let editingServiceId = null;

// Carregar serviços
async function loadServices() {
    try {
        const servicesSnapshot = await db.collection('services')
            .orderBy('nome')
            .get();
        
        const tbody = document.querySelector('#services-table tbody');
        renderServicesTable(servicesSnapshot, tbody);
        
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        const tbody = document.querySelector('#services-table tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Erro ao carregar serviços.</td></tr>';
    }
}

// Renderizar tabela de serviços
function renderServicesTable(snapshot, tbody) {
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum serviço cadastrado.</td></tr>';
        return;
    }
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${data.nome || 'N/A'}</td>
            <td>${data.descricao ? (data.descricao.length > 50 ? data.descricao.substring(0, 50) + '...' : data.descricao) : 'N/A'}</td>
            <td>R$ ${data.precoBase?.toFixed(2) || '0,00'}</td>
            <td>${data.requerEquipamento ? 'Com equipamento' : 'Sem equipamento'}</td>
            <td><span class="status ${data.ativo ? 'confirmed' : 'canceled'}">${data.ativo ? 'Ativo' : 'Inativo'}</span></td>
            <td>
                <button class="action-btn btn-edit" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn btn-delete" data-id="${doc.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Adicionar eventos aos botões
        tr.querySelector('.btn-edit').addEventListener('click', () => {
            editService(doc.id);
        });
        
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            deleteService(doc.id);
        });
    });
}

// Função para editar serviço
async function editService(serviceId) {
    try {
        const serviceDoc = await db.collection('services').doc(serviceId).get();
        
        if (serviceDoc.exists) {
            editingServiceId = serviceId;
            const data = serviceDoc.data();
            
            document.getElementById('service-form-title').textContent = 'Editar Serviço';
            document.getElementById('service-form').classList.remove('hidden');
            
            document.getElementById('service-name').value = data.nome || '';
            document.getElementById('service-desc').value = data.descricao || '';
            document.getElementById('service-price').value = data.precoBase || '';
            document.getElementById('service-icon').value = data.icone || '';
            document.getElementById('service-type').value = data.requerEquipamento ? 'with_equipment' : 'without_equipment';
            document.getElementById('service-requires-electrical').checked = data.requerParteEletrica || false;
            document.getElementById('service-status').value = data.ativo ? 'active' : 'inactive';
        }
    } catch (error) {
        console.error('Erro ao carregar serviço para edição:', error);
        showNotification('Erro ao carregar serviço.', 'error');
    }
}

// Função para salvar serviço
async function saveService() {
    try {
        const serviceData = {
            nome: document.getElementById('service-name').value,
            descricao: document.getElementById('service-desc').value,
            precoBase: parseFloat(document.getElementById('service-price').value) || 0,
            icone: document.getElementById('service-icon').value,
            requerEquipamento: document.getElementById('service-type').value === 'with_equipment',
            requerParteEletrica: document.getElementById('service-requires-electrical').checked,
            ativo: document.getElementById('service-status').value === 'active',
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (!serviceData.nome) {
            showNotification('Por favor, informe o nome do serviço.', 'error');
            return;
        }
        
        if (editingServiceId) {
            // Atualizar serviço existente
            await db.collection('services').doc(editingServiceId).update(serviceData);
            showNotification('Serviço atualizado com sucesso!');
        } else {
            // Criar novo serviço
            serviceData.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('services').add(serviceData);
            showNotification('Serviço criado com sucesso!');
        }
        
        document.getElementById('service-form').classList.add('hidden');
        loadServices();
        
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        showNotification('Erro ao salvar serviço.', 'error');
    }
}

// Função para excluir serviço
async function deleteService(serviceId) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        try {
            await db.collection('services').doc(serviceId).delete();
            showNotification('Serviço excluído com sucesso!');
            loadServices();
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            showNotification('Erro ao excluir serviço.', 'error');
        }
    }
}

// Eventos para gerenciamento de serviços
if (document.getElementById('btn-add-service')) {
    document.getElementById('btn-add-service').addEventListener('click', () => {
        editingServiceId = null;
        document.getElementById('service-form-title').textContent = 'Adicionar Novo Serviço';
        document.getElementById('service-form').classList.remove('hidden');
        resetServiceForm();
    });
}

if (document.getElementById('btn-cancel-service')) {
    document.getElementById('btn-cancel-service').addEventListener('click', () => {
        document.getElementById('service-form').classList.add('hidden');
    });
}

if (document.getElementById('btn-save-service')) {
    document.getElementById('btn-save-service').addEventListener('click', saveService);
}

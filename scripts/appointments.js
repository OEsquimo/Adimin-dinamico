// Carregar todos os agendamentos (para a seção de agendamentos)
async function loadAllAppointments() {
    try {
        let query = db.collection('agendamentos')
            .orderBy('data', 'desc')
            .orderBy('horario', 'desc');
        
        // Aplicar filtro de status se existir
        const statusFilter = document.getElementById('filter-status') ? document.getElementById('filter-status').value : '';
        if (statusFilter) {
            query = query.where('status', '==', statusFilter);
        }
        
        const appointmentsSnapshot = await query.get();
        const tbody = document.querySelector('#all-appointments-table tbody');
        renderAppointmentsTable(appointmentsSnapshot, tbody);
        
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        const tbody = document.querySelector('#all-appointments-table tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Erro ao carregar agendamentos.</td></tr>';
    }
}

// Renderizar tabela de agendamentos
function renderAppointmentsTable(snapshot, tbody) {
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum agendamento encontrado.</td></tr>';
        return;
    }
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${data.cliente?.nome || 'N/A'}</td>
            <td>${getServiceNames(data.servicos)}</td>
            <td>${data.data || 'N/A'}</td>
            <td>${data.horario || 'N/A'}</td>
            <td>R$ ${data.total?.toFixed(2) || '0,00'}</td>
            <td><span class="status ${data.status || 'pending'}">${getStatusText(data.status)}</span></td>
            <td>
                <button class="action-btn btn-view" data-id="${doc.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn btn-edit" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Adicionar evento para visualizar
        tr.querySelector('.btn-view').addEventListener('click', () => {
            viewAppointment(doc.id);
        });
        
        // Adicionar evento para editar
        tr.querySelector('.btn-edit').addEventListener('click', () => {
            editAppointment(doc.id);
        });
    });
}

// Visualizar detalhes do agendamento
async function viewAppointment(appointmentId) {
    try {
        const doc = await db.collection('agendamentos').doc(appointmentId).get();
        
        if (doc.exists) {
            const data = doc.data();
            
            let detailsHtml = `
                <div class="form-group">
                    <label>Cliente</label>
                    <p><strong>${data.cliente?.nome || 'N/A'}</strong></p>
                </div>
                
                <div class="form-group">
                    <label>Contato</label>
                    <p>${data.cliente?.telefone || 'N/A'} | ${data.cliente?.email || 'N/A'}</p>
                </div>
                
                <div class="form-group">
                    <label>Endereço</label>
                    <p>${data.endereco?.rua || 'N/A'}, ${data.endereco?.numero || 'N/A'} - ${data.endereco?.bairro || 'N/A'}</p>
                    <p>${data.endereco?.cidade || 'N/A'} - ${data.endereco?.estado || 'N/A'}</p>
                </div>
                
                <div class="form-group">
                    <label>Data e Horário</label>
                    <p>${data.data || 'N/A'} às ${data.horario || 'N/A'}</p>
                </div>
                
                <div class="form-group">
                    <label>Serviços</label>
                    <ul>
            `;
            
            if (data.servicos) {
                for (const key in data.servicos) {
                    const servico = data.servicos[key];
                    detailsHtml += `<li>${servico.nome} - R$ ${servico.preco?.toFixed(2) || '0,00'}</li>`;
                }
            }
            
            detailsHtml += `
                    </ul>
                </div>
                
                <div class="form-group">
                    <label>Total</label>
                    <p><strong>R$ ${data.total?.toFixed(2) || '0,00'}</strong></p>
                </div>
                
                <div class="form-group">
                    <label>Status</label>
                    <p><span class="status ${data.status || 'pending'}">${getStatusText(data.status)}</span></p>
                </div>
            `;
            
            if (data.observacoes) {
                detailsHtml += `
                    <div class="form-group">
                        <label>Observações</label>
                        <p>${data.observacoes}</p>
                    </div>
                `;
            }
            
            document.getElementById('appointment-details').innerHTML = detailsHtml;
            document.getElementById('appointment-modal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
        showNotification('Erro ao carregar agendamento.', 'error');
    }
}

// Editar agendamento
async function editAppointment(appointmentId) {
    try {
        const doc = await db.collection('agendamentos').doc(appointmentId).get();
        
        if (doc.exists) {
            const data = doc.data();
            
            let detailsHtml = `
                <div class="form-group">
                    <label for="edit-status">Status do Agendamento</label>
                    <select id="edit-status" class="form-control">
                        <option value="pending" ${data.status === 'pending' ? 'selected' : ''}>Pendente</option>
                        <option value="confirmed" ${data.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                        <option value="completed" ${data.status === 'completed' ? 'selected' : ''}>Concluído</option>
                        <option value="canceled" ${data.status === 'canceled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Cliente</label>
                    <p>${data.cliente?.nome || 'N/A'}</p>
                </div>
                
                <div class="form-group">
                    <label>Data e Horário</label>
                    <p>${data.data || 'N/A'} às ${data.horario || 'N/A'}</p>
                </div>
                
                <div class="form-group">
                    <label>Serviços</label>
                    <ul>
            `;
            
            if (data.servicos) {
                for (const key in data.servicos) {
                    const servico = data.servicos[key];
                    detailsHtml += `<li>${servico.nome} - R$ ${servico.preco?.toFixed(2) || '0,00'}</li>`;
                }
            }
            
            detailsHtml += `
                    </ul>
                </div>
                
                <div class="form-group">
                    <label>Total</label>
                    <p>R$ ${data.total?.toFixed(2) || '0,00'}</p>
                </div>
                
                <div class="form-actions">
                    <button class="btn btn-secondary" id="btn-cancel-edit">Cancelar</button>
                    <button class="btn btn-success" id="btn-save-appointment">Salvar Alterações</button>
                </div>
            `;
            
            document.getElementById('appointment-details').innerHTML = detailsHtml;
            document.getElementById('appointment-modal').classList.remove('hidden');
            
            // Evento para salvar alterações
            document.getElementById('btn-save-appointment').addEventListener('click', async () => {
                const newStatus = document.getElementById('edit-status').value;
                
                try {
                    await db.collection('agendamentos').doc(appointmentId).update({
                        status: newStatus,
                        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    showNotification('Agendamento atualizado com sucesso!');
                    document.getElementById('appointment-modal').classList.add('hidden');
                    
                    // Recarregar os dados
                    loadAppointments();
                    loadAllAppointments();
                    loadDashboardData();
                    
                } catch (error) {
                    console.error('Erro ao atualizar agendamento:', error);
                    showNotification('Erro ao atualizar agendamento.', 'error');
                }
            });
            
            // Evento para cancelar
            document.getElementById('btn-cancel-edit').addEventListener('click', () => {
                document.getElementById('appointment-modal').classList.add('hidden');
            });
        }
    } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
        showNotification('Erro ao carregar agendamento.', 'error');
    }
}

// Evento para filtrar agendamentos
if (document.getElementById('btn-filter')) {
    document.getElementById('btn-filter').addEventListener('click', loadAllAppointments);
}

// Fechar modal
if (document.querySelector('.modal-close')) {
    document.querySelector('.modal-close').addEventListener('click', () => {
        document.getElementById('appointment-modal').classList.add('hidden');
    });
}

// Fechar modal ao clicar fora
if (document.getElementById('appointment-modal')) {
    document.getElementById('appointment-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('appointment-modal')) {
            document.getElementById('appointment-modal').classList.add('hidden');
        }
    });
}

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        // Carregar agendamentos de hoje
        const today = new Date();
        const todayFormatted = formatDate(today);
        
        const todaySnapshot = await db.collection('agendamentos')
            .where('data', '==', todayFormatted)
            .get();
        
        if (document.getElementById('stats-today')) {
            document.getElementById('stats-today').textContent = todaySnapshot.size;
        }
        
        // Carregar agendamentos pendentes
        const pendingSnapshot = await db.collection('agendamentos')
            .where('status', '==', 'pending')
            .get();
        
        if (document.getElementById('stats-pending')) {
            document.getElementById('stats-pending').textContent = pendingSnapshot.size;
        }
        
        // Carregar todos os agendamentos para contar clientes únicos
        const allAppointments = await db.collection('agendamentos').get();
        const uniqueClients = new Set();
        
        allAppointments.forEach(doc => {
            const data = doc.data();
            if (data.cliente && data.cliente.telefone) {
                uniqueClients.add(data.cliente.telefone);
            }
        });
        
        if (document.getElementById('stats-clients')) {
            document.getElementById('stats-clients').textContent = uniqueClients.size;
        }
        
        // Calcular faturamento do mês
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const firstDayFormatted = formatDate(firstDay);
        const lastDayFormatted = formatDate(lastDay);
        
        const revenueSnapshot = await db.collection('agendamentos')
            .where('data', '>=', firstDayFormatted)
            .where('data', '<=', lastDayFormatted)
            .where('status', 'in', ['confirmed', 'completed'])
            .get();
        
        let totalRevenue = 0;
        revenueSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.total) {
                totalRevenue += parseFloat(data.total) || 0;
            }
        });
        
        if (document.getElementById('stats-revenue')) {
            document.getElementById('stats-revenue').textContent = `R$ ${totalRevenue.toFixed(2)}`;
        }
        
        // Carregar últimos agendamentos
        loadAppointments();
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}

// Carregar agendamentos (para o dashboard)
async function loadAppointments() {
    try {
        const appointmentsSnapshot = await db.collection('agendamentos')
            .orderBy('data', 'desc')
            .orderBy('horario', 'desc')
            .limit(10)
            .get();
        
        const tbody = document.querySelector('#appointments-table tbody');
        renderAppointmentsTable(appointmentsSnapshot, tbody);
        
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        const tbody = document.querySelector('#appointments-table tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Erro ao carregar agendamentos.</td></tr>';
    }
}

// Evento para atualizar dados
if (document.getElementById('btn-refresh')) {
    document.getElementById('btn-refresh').addEventListener('click', () => {
        loadDashboardData();
        showNotification('Dados atualizados com sucesso!');
    });
}

// Carregar configurações
async function loadConfig() {
    try {
        const configDoc = await db.collection('configuracoes').doc('geral').get();
        
        if (configDoc.exists) {
            const data = configDoc.data();
            
            if (document.getElementById('config-company-name')) {
                document.getElementById('config-company-name').value = data.nomeEmpresa || '';
            }
            
            if (document.getElementById('config-whatsapp')) {
                document.getElementById('config-whatsapp').value = data.whatsapp || '';
            }
            
            if (document.getElementById('config-btu-options') && data.btuOptions && Array.isArray(data.btuOptions)) {
                document.getElementById('config-btu-options').value = data.btuOptions.join(', ');
            }
            
            if (document.getElementById('config-equipment-types') && data.equipmentTypes && Array.isArray(data.equipmentTypes)) {
                document.getElementById('config-equipment-types').value = data.equipmentTypes.join(', ');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Função para salvar configurações
async function saveConfig() {
    try {
        const btuOptions = document.getElementById('config-btu-options').value
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
        
        const equipmentTypes = document.getElementById('config-equipment-types').value
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
        
        const configData = {
            nomeEmpresa: document.getElementById('config-company-name').value,
            whatsapp: document.getElementById('config-whatsapp').value,
            btuOptions: btuOptions,
            equipmentTypes: equipmentTypes,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('configuracoes').doc('geral').set(configData, { merge: true });
        showNotification('Configurações salvas com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showNotification('Erro ao salvar configurações.', 'error');
    }
}

// Evento para salvar configurações
if (document.getElementById('btn-save-config')) {
    document.getElementById('btn-save-config').addEventListener('click', saveConfig);
}

// scripts/main.js

// Importa as funções e instâncias do Firebase
import { db, collection, getDocs, addDoc } from './firebase-config.js';

// Adiciona o listener para garantir que o script só rode após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
    
    // Variáveis globais para o carrinho e serviços
    let servicosDisponiveis = [];
    let carrinho = {}; // { idServico: { ...detalhes, quantidade, opcoesSelecionadas } }

    // Elementos do DOM
    const servicosGrid = document.getElementById('servicos-grid');
    const orcamentoSection = document.getElementById('orcamento-section');
    const orcamentoForm = document.getElementById('orcamento-form');
    const agendamentoSection = document.getElementById('agendamento-section');
    const agendamentoForm = document.getElementById('agendamento-form');
    const carrinhoResumo = document.getElementById('carrinho-resumo');
    const itensCarrinho = document.getElementById('itens-carrinho');
    const valorTotalElement = document.getElementById('valor-total');
    const finalizarOrcamentoBtn = document.getElementById('finalizar-orcamento');

    // Função para buscar e renderizar os serviços na página
    async function carregarServicos() {
        try {
            const servicosCol = collection(db, 'servicos');
            const servicosSnapshot = await getDocs(servicosCol);
            servicosDisponiveis = servicosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            servicosDisponiveis.forEach(servico => {
                if (servico.status === 'Ativo') {
                    const serviceCard = document.createElement('div');
                    serviceCard.className = 'service-card';
                    serviceCard.setAttribute('data-id', servico.id);
                    serviceCard.innerHTML = `
                        <i class="fa-solid ${servico.icone} icon"></i>
                        <h3>${servico.nome}</h3>
                        <p>${servico.descricao}</p>
                        <p><strong>A partir de: R$ ${servico.precoBase.toFixed(2)}</strong></p>
                    `;
                    servicosGrid.appendChild(serviceCard);

                    // Adiciona o evento de clique para seleção
                    serviceCard.addEventListener('click', () => toggleServico(servico));
                }
            });
        } catch (e) {
            console.error("Erro ao carregar serviços: ", e);
            alert('Ocorreu um erro ao carregar os serviços. Tente novamente mais tarde.');
        }
    }

    // Função para adicionar ou remover um serviço do carrinho
    function toggleServico(servico) {
        const cardElement = document.querySelector(`.service-card[data-id="${servico.id}"]`);
        if (carrinho[servico.id]) {
            // Remove do carrinho
            delete carrinho[servico.id];
            cardElement.classList.remove('selected');
        } else {
            // Adiciona ao carrinho
            carrinho[servico.id] = { ...servico, quantidade: 1, opcoes: {} };
            cardElement.classList.add('selected');
        }
        renderizarCarrinhoEFormulario();
    }

    // Função para renderizar o carrinho e o formulário de orçamento
    function renderizarCarrinhoEFormulario() {
        const servicosSelecionados = Object.values(carrinho);
        orcamentoSection.classList.toggle('hidden', servicosSelecionados.length === 0);
        
        // Limpa os conteúdos
        itensCarrinho.innerHTML = '';
        orcamentoForm.innerHTML = '';
        let totalGeral = 0;

        if (servicosSelecionados.length > 0) {
            servicosSelecionados.forEach(item => {
                // Renderiza o resumo no carrinho
                const itemElement = document.createElement('div');
                itemElement.className = 'item-carrinho';
                itemElement.innerHTML = `
                    <p><strong>${item.nome}</strong></p>
                    <div class="detalhes-item">
                        <span>${item.quantidade} x R$ ${item.precoBase.toFixed(2)}</span>
                        <span>R$ ${(item.quantidade * item.precoBase).toFixed(2)}</span>
                    </div>
                `;
                itensCarrinho.appendChild(itemElement);
                totalGeral += item.quantidade * item.precoBase;

                // Renderiza o formulário de detalhes para cada item
                const itemFormDiv = document.createElement('div');
                itemFormDiv.innerHTML = `<h3>Detalhes do serviço: ${item.nome}</h3>`;
                itemFormDiv.className = 'item-form-details';
                
                // Campo de quantidade
                itemFormDiv.innerHTML += `
                    <div class="form-group">
                        <label>Quantidade de Aparelhos</label>
                        <input type="number" min="1" value="${item.quantidade}" class="input-quantidade" data-id="${item.id}">
                    </div>
                `;

                // Lógica para campos dinâmicos (BTU, Tipo, Elétrica, Local)
                if (item.capacidadesBTU && item.capacidadesBTU.length > 0) {
                    // Se houver mais de um aparelho, cria um sub-bloco
                    if (item.quantidade > 1) {
                        for (let i = 0; i < item.quantidade; i++) {
                            itemFormDiv.innerHTML += `
                                <div class="sub-bloco">
                                    <h4>Aparelho ${i + 1}</h4>
                                    <div class="form-group">
                                        <label>Capacidade de BTU</label>
                                        <select class="select-btu" data-id="${item.id}" data-aparelho-index="${i}">
                                            <option value="">Selecione</option>
                                            ${item.capacidadesBTU.map(btu => `<option value="${btu}">${btu}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            `;
                        }
                    } else {
                        itemFormDiv.innerHTML += `
                            <div class="form-group">
                                <label>Capacidade de BTU</label>
                                <select class="select-btu" data-id="${item.id}">
                                    <option value="">Selecione</option>
                                    ${item.capacidadesBTU.map(btu => `<option value="${btu}">${btu}</option>`).join('')}
                                </select>
                            </div>
                        `;
                    }
                }
                
                // Lógica para tipo de equipamento, parte elétrica, local de instalação, etc.
                // ... (implementar conforme a necessidade, usando as propriedades do objeto 'item') ...

                // Campo de observação
                itemFormDiv.innerHTML += `
                    <div class="form-group">
                        <label>Observação (Opcional)</label>
                        <textarea class="input-observacao" data-id="${item.id}" rows="2"></textarea>
                    </div>
                `;
                
                orcamentoForm.appendChild(itemFormDiv);
            });

            valorTotalElement.textContent = `R$ ${totalGeral.toFixed(2)}`;
            
            // Adiciona event listeners para os inputs dinâmicos
            document.querySelectorAll('.input-quantidade').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idServico = e.target.getAttribute('data-id');
                    carrinho[idServico].quantidade = parseInt(e.target.value);
                    renderizarCarrinhoEFormulario(); // Recarrega o formulário
                });
            });
            
            // ... (Adicionar listeners para os outros inputs e selects dinâmicos) ...
        }
    }

    // Evento de clique no botão "Continuar para Agendamento"
    finalizarOrcamentoBtn.addEventListener('click', () => {
        // Esconde a seção de serviços e orçamento
        document.getElementById('servicos-section').classList.add('hidden');
        orcamentoSection.classList.add('hidden');
        
        // Mostra a seção de agendamento
        agendamentoSection.classList.remove('hidden');
        
        // TODO: Salvar o orçamento no Firebase aqui antes de continuar
    });

    // Evento de submissão do formulário de agendamento
    agendamentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Coleta todos os dados do agendamento
        const agendamento = {
            nome: document.getElementById('nome').value,
            whatsapp: document.getElementById('whatsapp').value,
            endereco: document.getElementById('endereco').value,
            data: document.getElementById('data-agendamento').value,
            horario: document.getElementById('horario-agendamento').value,
            servicos: Object.values(carrinho), // Salva todos os detalhes do carrinho
            valorTotal: parseFloat(valorTotalElement.textContent.replace('R$ ', '').replace(',', '.')),
            status: 'Pendente',
            dataCriacao: new Date()
        };
        
        // Salva no Firestore
        try {
            const agendamentosCol = collection(db, 'agendamentos');
            const docRef = await addDoc(agendamentosCol, agendamento);
            
            // TODO: Implementar envio de confirmação por WhatsApp e e-mail
            // Isso geralmente requer uma função de backend (Cloud Functions)
            
            alert(`Agendamento realizado com sucesso! Protocolo: ${docRef.id}`);
            agendamentoForm.reset();
            
            // Opcional: Redirecionar ou mostrar uma mensagem de sucesso
            
        } catch (e) {
            console.error("Erro ao adicionar agendamento: ", e);
            alert('Ocorreu um erro ao agendar o serviço. Tente novamente.');
        }
    });

    // Inicializa a página
    carregarServicos();

});

// scripts/main.js

// Importa as funções e instâncias do Firebase
import { db, collection, getDocs, addDoc } from './firebase-config.js';

// Função para adicionar um carimbo de data e hora aos arquivos para forçar a atualização
function forcarAtualizacao() {
    const scripts = document.querySelectorAll('script[src]');
    const links = document.querySelectorAll('link[href]');
    const timestamp = Date.now();

    scripts.forEach(script => {
        if (script.src.includes('scripts/')) {
            script.src = `${script.src}?v=${timestamp}`;
        }
    });

    links.forEach(link => {
        if (link.href.includes('styles.css')) {
            link.href = `${link.href}?v=${timestamp}`;
        }
    });
}
forcarAtualizacao();

// Função para exibir a data e hora da última atualização
function mostrarDataAtualizacao() {
    const elementoData = document.getElementById('ultima-atualizacao');
    if (elementoData) {
        const dataModificacao = new Date(document.lastModified);
        elementoData.textContent = "Última atualização: " + dataModificacao.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
}
mostrarDataAtualizacao();


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
        
        // --- Exibe a contagem de serviços selecionados (funcionalidade de contador) ---
        const totalItens = Object.keys(carrinho).length;
        console.log(`Você selecionou ${totalItens} serviços.`);
        // --- Fim da funcionalidade de contador ---

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
                
                itemFormDiv.innerHTML += `
                    <div class="form-group">
                        <label>Observação (Opcional)</label>
                        <textarea class="input-observacao" data-id="${item.id}" rows="2"></textarea>
                    </div>
                `;
                
                orcamentoForm.appendChild(itemFormDiv);
            });

            valorTotalElement.textContent = `R$ ${totalGeral.toFixed(2)}`;
            
            document.querySelectorAll('.input-quantidade').forEach(input => {
                input.addEventListener('change', (e) => {
                    const idServico = e.target.getAttribute('data-id');
                    carrinho[idServico].quantidade = parseInt(e.target.value);
                    renderizarCarrinhoEFormulario();
                });
            });
        }
    }

    finalizarOrcamentoBtn.addEventListener('click', () => {
        document.getElementById('servicos-section').classList.add('hidden');
        orcamentoSection.classList.add('hidden');
        agendamentoSection.classList.remove('hidden');
    });

    agendamentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const agendamento = {
            nome: document.getElementById('nome').value,
            whatsapp: document.getElementById('whatsapp').value,
            endereco: document.getElementById('endereco').value,
            data: document.getElementById('data-agendamento').value,
            horario: document.getElementById('horario-agendamento').value,
            servicos: Object.values(carrinho),
            valorTotal: parseFloat(valorTotalElement.textContent.replace('R$ ', '').replace(',', '.')),
            status: 'Pendente',
            dataCriacao: new Date()
        };
        
        try {
            const agendamentosCol = collection(db, 'agendamentos');
            const docRef = await addDoc(agendamentosCol, agendamento);
            
            alert(`Agendamento realizado com sucesso! Protocolo: ${docRef.id}`);
            agendamentoForm.reset();
            
        } catch (e) {
            console.error("Erro ao adicionar agendamento: ", e);
            alert('Ocorreu um erro ao agendar o serviço. Tente novamente.');
        }
    });

    carregarServicos();

});

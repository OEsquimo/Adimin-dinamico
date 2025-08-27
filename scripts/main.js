// scripts/main.js

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


document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const servicosGrid = document.getElementById('servicos-grid');
    const orcamentoSection = document.getElementById('orcamento-section');
    const orcamentoSummary = document.getElementById('orcamento-summary');
    const totalPriceSpan = document.getElementById('total-price');
    const agendamentoForm = document.getElementById('agendamento-form');
    
    // Objeto para armazenar os serviços selecionados
    let carrinho = {};

    // Função para carregar serviços do Firestore
    async function carregarServicos() {
        try {
            const servicosCol = collection(db, 'servicos');
            const servicosSnapshot = await getDocs(servicosCol);
            
            if (servicosSnapshot.empty) {
                console.log("Coleção 'servicos' não possui dados. Populando com dados padrão...");
                const servicosPadrao = [
                    { nome: "Instalação de Ar Condicionado", valor: 400.00, img: "img/instalacao.webp" },
                    { nome: "Manutenção Preventiva", valor: 100.00, img: "img/manutencao.webp" },
                    { nome: "Reparo de Vazamento", valor: 150.00, img: "img/reparo.webp" }
                ];
                for (const servico of servicosPadrao) {
                    await addDoc(servicosCol, servico);
                }
                carregarServicos();
                return;
            }

            servicosGrid.innerHTML = '';
            servicosSnapshot.forEach(doc => {
                const servico = { id: doc.id, ...doc.data() };
                const servicoCard = document.createElement('div');
                servicoCard.className = 'servico-card';
                servicoCard.innerHTML = `
                    <img src="${servico.img}" alt="${servico.nome}">
                    <h3>${servico.nome}</h3>
                    <p>R$ ${servico.valor.toFixed(2)}</p>
                `;
                servicoCard.addEventListener('click', () => {
                    toggleServico(servico, servicoCard);
                });
                servicosGrid.appendChild(servicoCard);
            });
        } catch (e) {
            console.error("Erro ao carregar serviços: ", e);
            servicosGrid.innerHTML = '<p>Erro ao carregar os serviços.</p>';
        }
    }

    // Função para adicionar/remover serviços do "carrinho"
    function toggleServico(servico, cardElement) {
        if (carrinho[servico.id]) {
            delete carrinho[servico.id];
            cardElement.classList.remove('selected');
        } else {
            carrinho[servico.id] = servico;
            cardElement.classList.add('selected');
        }
        atualizarOrcamento();
    }

    // Função para atualizar o resumo do orçamento
    function atualizarOrcamento() {
        let total = 0;
        let resumoHTML = '<ul>';
        const servicosSelecionadosArray = Object.values(carrinho);

        if (servicosSelecionadosArray.length === 0) {
            orcamentoSection.classList.add('hidden');
            orcamentoSummary.innerHTML = '<p>Nenhum serviço selecionado.</p>';
        } else {
            orcamentoSection.classList.remove('hidden');
            servicosSelecionadosArray.forEach(servico => {
                total += servico.valor;
                resumoHTML += `<li>${servico.nome}: R$ ${servico.valor.toFixed(2)}</li>`;
            });
            orcamentoSummary.innerHTML = resumoHTML + '</ul>';
        }
        
        totalPriceSpan.textContent = `R$ ${total.toFixed(2)}`;
    }

    // Listener para o formulário de agendamento
    agendamentoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = agendamentoForm.nome.value;
        const whatsapp = agendamentoForm.whatsapp.value;
        const endereco = agendamentoForm.endereco.value;
        const data = agendamentoForm.data.value;
        const horario = agendamentoForm.horario.value;
        
        const valorTotal = Object.values(carrinho).reduce((sum, s) => sum + s.valor, 0);
        const servicosArray = Object.values(carrinho).map(s => ({ nome: s.nome, valor: s.valor }));

        if (servicosArray.length === 0) {
            alert("Por favor, selecione pelo menos um serviço.");
            return;
        }

        try {
            const agendamentoRef = await addDoc(collection(db, "agendamentos"), {
                nome: nome,
                whatsapp: whatsapp,
                endereco: endereco,
                data: data,
                horario: horario,
                servicos: servicosArray,
                valorTotal: valorTotal,
                timestamp: new Date()
            });
            console.log("Documento de agendamento criado com ID: ", agendamentoRef.id);
            alert("Agendamento realizado com sucesso! Em breve entraremos em contato.");
            agendamentoForm.reset();
            carrinho = {};
            atualizarOrcamento();
        } catch (e) {
            console.error("Erro ao adicionar agendamento: ", e);
            alert("Ocorreu um erro ao agendar o serviço. Por favor, tente novamente.");
        }
    });

    // Inicia o carregamento dos serviços quando a página é carregada
    carregarServicos();
});

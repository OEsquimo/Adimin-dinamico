// scripts/admin.js

// Importa as funções e instâncias do Firebase
import { auth, db, collection, getDocs, signInWithEmailAndPassword, onAuthStateChanged, signOut, addDoc, doc, updateDoc, deleteDoc } from '../firebase-config.js';

// ... (Restante do seu código do admin.js) ...

// Função para popular o banco de dados com dados iniciais
async function popularBancoDeDados() {
    console.log("Verificando se as coleções precisam ser populadas...");

    try {
        // Verifica a coleção de serviços
        const servicosCol = collection(db, 'servicos');
        const servicosSnapshot = await getDocs(servicosCol);
        if (servicosSnapshot.empty) {
            console.log("Coleção 'servicos' vazia. Populando com dados iniciais...");

            const servicosIniciais = [
                {
                    nome: "Instalação de Ar Condicionado",
                    capacidadesBTU: ["9000 BTU", "12000 BTU", "18000 BTU", "24000 BTU"],
                    tiposEquipamento: ["Split Hi-Wall", "Cassete", "Piso Teto", "Janela"],
                    icone: "fa-fan",
                    requerParteEletrica: true,
                    descricao: "Serviço de instalação profissional para diversos tipos e capacidades de ar condicionado.",
                    precoBase: 350.00,
                    status: "Ativo",
                    categoria: "Instalação"
                },
                {
                    nome: "Manutenção Preventiva",
                    capacidadesBTU: ["9000 BTU", "12000 BTU", "18000 BTU"],
                    tiposEquipamento: ["Split Hi-Wall", "Cassete", "Piso Teto", "Janela"],
                    icone: "fa-tools",
                    requerParteEletrica: false,
                    descricao: "Limpeza completa e verificação de componentes para garantir o bom funcionamento do seu aparelho.",
                    precoBase: 150.00,
                    status: "Ativo",
                    categoria: "Manutenção"
                },
                {
                    nome: "Carga de Gás",
                    capacidadesBTU: ["9000 BTU", "12000 BTU", "18000 BTU", "24000 BTU"],
                    tiposEquipamento: ["Split Hi-Wall", "Cassete", "Piso Teto"],
                    icone: "fa-gas-pump",
                    requerParteEletrica: false,
                    descricao: "Reposição do gás refrigerante para restaurar a capacidade de resfriamento do aparelho.",
                    precoBase: 200.00,
                    status: "Ativo",
                    categoria: "Manutenção"
                },
                {
                    nome: "Reparo Geral",
                    capacidadesBTU: [],
                    tiposEquipamento: [],
                    icone: "fa-wrench",
                    requerParteEletrica: false,
                    descricao: "Diagnóstico e reparo de falhas no sistema de ar condicionado.",
                    precoBase: 80.00,
                    status: "Ativo",
                    categoria: "Manutenção"
                },
            ];

            for (const servico of servicosIniciais) {
                await addDoc(servicosCol, servico);
            }
            console.log("Dados de serviços populados com sucesso!");
        } else {
            console.log("Coleção 'servicos' já contém dados. Ignorando a população.");
        }

        // Verifica a coleção de orçamentos (para ter um dado de exemplo)
        const orcamentoCol = collection(db, 'orcamentos');
        const orcamentoSnapshot = await getDocs(orcamentoCol);
        if (orcamentoSnapshot.empty) {
            console.log("Coleção 'orcamentos' vazia. Criando dado de exemplo...");
            const orcamentoExemplo = {
                data: new Date(),
                valorTotal: 550.00,
                status: "Pendente",
                servicos: [
                    { nome: "Instalação de Ar Condicionado", precoBase: 350.00, quantidade: 1 },
                    { nome: "Manutenção Preventiva", precoBase: 150.00, quantidade: 1 }
                ]
            };
            await addDoc(orcamentoCol, orcamentoExemplo);
            console.log("Dado de orçamento de exemplo criado.");
        }

        // Verifica a coleção de agendamentos (para ter um dado de exemplo)
        const agendamentosCol = collection(db, 'agendamentos');
        const agendamentosSnapshot = await getDocs(agendamentosCol);
        if (agendamentosSnapshot.empty) {
            console.log("Coleção 'agendamentos' vazia. Criando dado de exemplo...");
            const agendamentoExemplo = {
                nome: "Maria Silva",
                whatsapp: "81988887777",
                endereco: "Rua Exemplo, 123, Bairro A, Cidade B - PE",
                data: "2025-09-01",
                horario: "14:00",
                valorTotal: 550.00,
                status: "Pendente",
                servicos: [
                    { nome: "Instalação de Ar Condicionado", precoBase: 350.00, quantidade: 1 },
                    { nome: "Manutenção Preventiva", precoBase: 150.00, quantidade: 1 }
                ],
                dataCriacao: new Date()
            };
            await addDoc(agendamentosCol, agendamentoExemplo);
            console.log("Dado de agendamento de exemplo criado.");
        }

        // Verifica a coleção de configurações
        const configCol = collection(db, 'config');
        const configSnapshot = await getDocs(configCol);
        if (configSnapshot.empty) {
            console.log("Coleção 'config' vazia. Criando configurações iniciais...");
            const configExemplo = {
                nomeEmpresa: "Sua Empresa de Ar Condicionado",
                whatsappNumero: "+5581983259341",
                horarioFuncionamento: "Segunda a Sexta, 08h-18h",
                diasBloqueados: ["2025-12-25", "2025-01-01"]
            };
            await addDoc(configCol, configExemplo);
            console.log("Configurações iniciais criadas.");
        }

    } catch (e) {
        console.error("Erro ao popular o banco de dados: ", e);
    }
}

// Chame a função para popular o banco de dados
// Você pode adicionar este trecho em um ponto de inicialização do seu app, por exemplo:
// window.onload = popularBancoDeDados;
// Ou simplesmente execute-o uma vez e depois o apague.
popularBancoDeDados();

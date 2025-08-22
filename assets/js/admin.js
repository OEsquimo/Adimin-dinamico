import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFf5gckKE6rg7MFuBYAO84aV-sNrdY2JQ",
  authDomain: "agendamento-esquimo.firebaseapp.com",
  databaseURL: "https://agendamento-esquimo-default-rtdb.firebaseio.com",
  projectId: "agendamento-esquimo",
  storageBucket: "agendamento-esquimo.firebasestorage.app",
  messagingSenderId: "348946727206",
  appId: "1:348946727206:web:f5989788f13c259be0c1e7",
  measurementId: "G-Z0EMQ3XQ1D"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const formAdd = document.getElementById("formAdd");
const lista = document.getElementById("listaComponentes");

// Adicionar componente
formAdd.addEventListener("submit", (e) => {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const conteudo = document.getElementById("conteudo").value;

  push(ref(db, "componentes"), { tipo, conteudo });

  formAdd.reset();
});

// Listar componentes
const compRef = ref(db, "componentes");
onValue(compRef, (snapshot) => {
  lista.innerHTML = "";
  snapshot.forEach((child) => {
    const id = child.key;
    const data = child.val();

    const div = document.createElement("div");
    div.classList.add("grid-item");
    div.innerHTML = `
      <strong>${data.tipo}</strong>: ${data.conteudo} <br>
      <button onclick="editarComp('${id}', '${data.conteudo}')">Editar</button>
      <button onclick="excluirComp('${id}')">Excluir</button>
    `;

    lista.appendChild(div);
  });
});

// Funções globais (precisam ir no window)
window.excluirComp = function(id) {
  remove(ref(db, "componentes/" + id));
};

window.editarComp = function(id, conteudoAtual) {
  const novo = prompt("Editar conteúdo:", conteudoAtual);
  if (novo !== null) {
    update(ref(db, "componentes/" + id), { conteudo: novo });
  }
};

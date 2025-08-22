// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";

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

const conteudoDiv = document.getElementById("conteudo");

// Ouve os dados do Firebase
const componentesRef = ref(db, "componentes");
onValue(componentesRef, (snapshot) => {
  conteudoDiv.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();

    let el;
    if (data.tipo === "img") {
      el = document.createElement("img");
      el.src = data.conteudo;
      el.style.maxWidth = "100%";
    } else {
      el = document.createElement(data.tipo);
      el.innerText = data.conteudo;
    }

    el.classList.add("grid-item");
    conteudoDiv.appendChild(el);
  });
});

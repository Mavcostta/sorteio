// Tenta carregar do localStorage ou usa valores padrão
let nomes = JSON.parse(localStorage.getItem("nomes")) || [
  "Tia", "Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda",
  "Gabriel", "Helena", "Igor", "Joana", "Kleber", "Larissa", "Marcelo",
  "Nina", "Otávio", "Patrícia", "Quésia", "Rafael", "Sandra", "Tiago",
  "Ursula", "Vinícius", "Wesley", "Xuxa", "Yasmin", "Zeca", "Beatriz",
  "Caio", "Diana", "Enzo", "Flávia", "Gustavo", "Heloísa", "Isabela", "José"
];

let semanaAtual = Number(localStorage.getItem("semanaAtual")) || 2;

let sorteios = JSON.parse(localStorage.getItem("sorteios")) || Array(36).fill(null);
if (!sorteios[0]) sorteios[0] = "Tia"; // Semana 1 é da Tia

let pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || Array.from({ length: 36 }, () =>
  Object.fromEntries(nomes.map(nome => [nome, false]))
);

// Se localStorage estava vazio, garante que a Tia está marcada como paga na semana 1
if (!localStorage.getItem("pagamentos")) pagamentos[0]["Tia"] = true;

const lista = document.getElementById("listaParticipantes");
const semanaSpan = document.getElementById("semanaAtual");
const progresso = document.getElementById("progressoPagaram");
const totalArrecadado = document.getElementById("totalArrecadado");

function salvarDados() {
  localStorage.setItem("nomes", JSON.stringify(nomes));
  localStorage.setItem("sorteios", JSON.stringify(sorteios));
  localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
  localStorage.setItem("semanaAtual", semanaAtual);
}

function renderLista(filtro = "todos") {
  lista.innerHTML = "";

  nomes.forEach((nome, index) => {
    const linha = document.createElement("tr");

    // Verifica se o nome foi sorteado em alguma semana até a atual (inclusive)
    const foiSorteadoAteSemanaAtual = sorteios.slice(0, semanaAtual).includes(nome);

    // Verifica se o nome é o sorteado da semana atual (semanaAtual - 1)
    const sorteadoEstaSemana = sorteios[semanaAtual - 1] === nome;

    // Verifica se pagou na semana atual
    const pagoNaSemanaAtual = pagamentos[semanaAtual - 1][nome];

    // Aplica classe 'sorteado' se já foi sorteado em alguma semana
    if (foiSorteadoAteSemanaAtual) {
      linha.classList.add("sorteado");
    }

    // Aplica classe 'proximo' se for o próximo sorteado (semanaAtual)
    if (sorteios[semanaAtual] === nome) {
      linha.classList.add("proximo");
    }

    // Aplica classe 'pagou' se a pessoa pagou na semana atual
    if (pagoNaSemanaAtual) {
      linha.classList.add("pagou");
    }

    // Garante que o sorteado da semana atual também fique com fundo verde (classe 'pagou')
    if (sorteadoEstaSemana) {
      linha.classList.add("pagou");
    }

    // Aplica filtro
    if (filtro === "pagaram" && !pagoNaSemanaAtual) return;
    if (filtro === "naoPagaram" && pagoNaSemanaAtual) return;

    const tdNumero = document.createElement("td");
    tdNumero.textContent = index + 1;

    const tdNome = document.createElement("td");
    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.value = nome;
    inputNome.addEventListener("change", (e) => {
      const novoNome = e.target.value;
      pagamentos.forEach(sem => {
        sem[novoNome] = sem[nome];
        delete sem[nome];
      });

      if (sorteios.includes(nome)) {
        sorteios = sorteios.map(s => s === nome ? novoNome : s);
      }

      nomes[index] = novoNome;
      salvarDados();
      renderLista(filtro);
    });
    tdNome.appendChild(inputNome);

    const tdStatus = document.createElement("td");
    tdStatus.textContent = sorteios[semanaAtual - 1] === nome ? "Sorteado" : "";

    const tdCheckbox = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = pagoNaSemanaAtual;
    checkbox.addEventListener("change", () => {
      pagamentos[semanaAtual - 1][nomes[index]] = checkbox.checked;
      salvarDados();
      atualizarBarra();
      atualizarTotal();
      renderLista(filtro);
    });
    tdCheckbox.appendChild(checkbox);

    linha.appendChild(tdNumero);
    linha.appendChild(tdNome);
    linha.appendChild(tdStatus);
    linha.appendChild(tdCheckbox);

    lista.appendChild(linha);
  });

  atualizarBarra();
}

function atualizarBarra() {
  const pagos = Object.values(pagamentos[semanaAtual - 1]).filter(v => v).length;
  const total = nomes.length;
  progresso.style.width = `${(pagos / total) * 100}%`;
}

function atualizarTotal() {
  const total = pagamentos.slice(0, semanaAtual).reduce((soma, semana) => {
    return soma + Object.values(semana).filter(v => v).length * 100;
  }, 0);
  totalArrecadado.textContent = `R$ ${total.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

function atualizarSemana() {
  semanaSpan.textContent = semanaAtual;
  document.getElementById("btnVoltar").disabled = semanaAtual === 1;
  renderLista(document.querySelector(".filtro-btn.ativo").dataset.filtro);
  atualizarTotal();
  salvarDados();
}

document.getElementById("btnSortear").addEventListener("click", () => {
  if (semanaAtual >= 36) return alert("Todas as semanas foram sorteadas.");

  const proximoIndex = semanaAtual;
  const nomeSorteado = nomes[proximoIndex];

  sorteios[semanaAtual] = nomeSorteado;
  pagamentos[semanaAtual][nomeSorteado] = true;

  semanaAtual++;
  atualizarSemana();
});

document.getElementById("btnVoltar").addEventListener("click", () => {
  if (semanaAtual > 1) {
    semanaAtual--;
    atualizarSemana();
  }
});

document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    renderLista(btn.dataset.filtro);
  });
});

document.getElementById("btnMarcarTodos").addEventListener("click", () => {
  const todosPagos = Object.values(pagamentos[semanaAtual - 1]).every(v => v);
  nomes.forEach(nome => {
    pagamentos[semanaAtual - 1][nome] = !todosPagos;
  });
  salvarDados();
  atualizarBarra();
  atualizarTotal();
  renderLista(document.querySelector(".filtro-btn.ativo").dataset.filtro);
});

// Inicialização
atualizarSemana();

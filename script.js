const sorteioConfiguracao = "2026-10-02";

if (localStorage.getItem("sorteioConfiguracao") !== sorteioConfiguracao) {
  ["nomes", "sorteios", "pagamentos", "semanaAtual"].forEach((chave) =>
    localStorage.removeItem(chave)
  );
  localStorage.setItem("sorteioConfiguracao", sorteioConfiguracao);
}

// Data do primeiro sorteio (02/10/2026)
const dataInicio = new Date(2026, 9, 2); // mês 0-based

// Lista de nomes (pode conter repetidos)
let nomes = JSON.parse(localStorage.getItem("nomes")) || [
  "Vanda",
  "Vanda",
  "Cristiane",
  "Ilza",
  "Barbosa",
  "Ana",
  "Ana",
  "Aldo",
  "Macia",
  "Laudjane",
  "Aldo",
  "Diza",
  "Macia",
  "Aldo",
  "Gil",
  "Aldo",
  "Irmão Macio",
  "Dja",
  "Aldo",
  "Ir,Dane",
  "Cleide",
  "Flávia",
  "Hemersom",
  "Cristiane",
  "Dane",
  "Macia L",
  "Márcia L",
  "Ilza",
  "ILza",
  "Vitória",
  "Vitória",
];

// Semana atual começa em 1, pois semana 1 é índice 0 no array
let semanaAtual = Number(localStorage.getItem("semanaAtual")) || 1;

// Sorteios: array de nomes sorteados por semana
let sorteios =
  JSON.parse(localStorage.getItem("sorteios")) || Array(nomes.length).fill(null);
if (!sorteios[0]) sorteios[0] = nomes[0]; // semana 1 já tem o primeiro sorteado

// Pagamentos: array de semanas, cada semana é array de booleanos (pagamento por índice)
let pagamentos =
  JSON.parse(localStorage.getItem("pagamentos")) ||
  Array.from({ length: nomes.length }, () => Array(nomes.length).fill(false));

// Se não tinha dados no localStorage, marca pagamento do sorteado da semana 1
if (!localStorage.getItem("pagamentos")) pagamentos[0][0] = true;

const lista = document.getElementById("listaParticipantes");
const semanaSpan = document.getElementById("semanaAtual");
const tituloPrincipal = document.querySelector("h1");
const spanTotalSemanas = document.createElement("span");
const progresso = document.getElementById("progressoPagaram");
const totalArrecadado = document.getElementById("totalArrecadado");

function salvarDados() {
  localStorage.setItem("nomes", JSON.stringify(nomes));
  localStorage.setItem("sorteios", JSON.stringify(sorteios));
  localStorage.setItem("pagamentos", JSON.stringify(pagamentos));
  localStorage.setItem("semanaAtual", semanaAtual);
  localStorage.setItem("sorteioConfiguracao", sorteioConfiguracao);
}

function formatarData(date) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function renderLista(filtro = "todos") {
  lista.innerHTML = "";

  nomes.forEach((nome, index) => {
    const linha = document.createElement("tr");

    const foiSorteadoAteSemanaAtual = sorteios
      .slice(0, semanaAtual)
      .includes(nome);
    const sorteadoEstaSemana = sorteios[semanaAtual - 1] === nome;
    const pagoNaSemanaAtual = pagamentos[semanaAtual - 1][index];

    if (foiSorteadoAteSemanaAtual) linha.classList.add("sorteado");
    if (sorteios[semanaAtual] === nome) linha.classList.add("proximo");
    if (pagoNaSemanaAtual) linha.classList.add("pagou");
    if (sorteadoEstaSemana) linha.classList.add("pagou");

    if (filtro === "pagaram" && !pagoNaSemanaAtual) return;
    if (filtro === "naoPagaram" && pagoNaSemanaAtual) return;

    const tdNumero = document.createElement("td");
    tdNumero.textContent = index + 1;

    const dataSorteioSemana = new Date(dataInicio);
    dataSorteioSemana.setDate(dataInicio.getDate() + index * 7);
    const tdData = document.createElement("td");
    tdData.textContent = formatarData(dataSorteioSemana);

    const tdNome = document.createElement("td");
    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.value = nome;
    inputNome.addEventListener("change", (e) => {
      const novoNome = e.target.value;
      nomes[index] = novoNome;
      salvarDados();
      renderLista(filtro);
    });
    tdNome.appendChild(inputNome);

    const tdStatus = document.createElement("td");
    tdStatus.textContent = sorteadoEstaSemana ? "Sorteado" : "";

    const tdCheckbox = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = pagoNaSemanaAtual;
    checkbox.addEventListener("change", () => {
      pagamentos[semanaAtual - 1][index] = checkbox.checked;
      salvarDados();
      atualizarBarra();
      atualizarTotal();
      renderLista(filtro);
    });
    tdCheckbox.appendChild(checkbox);

    linha.appendChild(tdNumero);
    linha.appendChild(tdData);
    linha.appendChild(tdNome);
    linha.appendChild(tdStatus);
    linha.appendChild(tdCheckbox);

    lista.appendChild(linha);
  });

  atualizarBarra();
}

function atualizarBarra() {
  const pagos = pagamentos[semanaAtual - 1].filter((v) => v).length;
  const total = nomes.length;
  progresso.style.width = `${(pagos / total) * 100}%`;
}

function atualizarTotal() {
  let totalPagamentos = 0;
  for (let i = 0; i < semanaAtual; i++) {
    pagamentos[i].forEach((pago) => {
      if (pago) totalPagamentos++;
    });
  }
  const total = totalPagamentos * 100;
  totalArrecadado.textContent = `R$ ${total.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

function atualizarSemana() {
  // Atualiza o texto do título e do total de semanas
  let totalSemanas = sorteios.length;
  // Corrige o texto do cabeçalho para não duplicar 'de X'
  const semanaAtualP = document.querySelector(".topo-fixo p");
  if (semanaAtualP) {
    semanaAtualP.innerHTML = `Semana atual: <span id=\"semanaAtual\">${semanaAtual}</span> de ${totalSemanas}`;
  }
  if (tituloPrincipal) {
    tituloPrincipal.textContent = "Sorteio Semanal";
  }
  // Atualiza referência global do span
  window.semanaSpan = document.getElementById("semanaAtual");
  document.getElementById("btnVoltar").disabled = semanaAtual === 1;
  renderLista(document.querySelector(".filtro-btn.ativo").dataset.filtro);
  atualizarTotal();
  salvarDados();
}

// 🔒 Só avança se todos pagarem
document.getElementById("btnSortear").addEventListener("click", () => {
  if (semanaAtual > nomes.length) {
    alert("Todas as semanas foram sorteadas.");
    return;
  }

  const todosPagaram = pagamentos[semanaAtual - 1].every(
    (pago) => pago === true
  );

  if (!todosPagaram) {
    alert(
      "Você precisa marcar todos os participantes como pagos antes de avançar para a próxima semana."
    );
    return;
  }

  const nomeSorteado = nomes[semanaAtual - 1];
  sorteios[semanaAtual - 1] = nomeSorteado;
  pagamentos[semanaAtual - 1][semanaAtual - 1] = true;

  if (semanaAtual < pagamentos.length) {
    pagamentos[semanaAtual] = Array(nomes.length).fill(false);
  }

  semanaAtual++;
  atualizarSemana();
});

document.getElementById("btnVoltar").addEventListener("click", () => {
  if (semanaAtual > 1) {
    semanaAtual--;
    atualizarSemana();
  }
});

document.querySelectorAll(".filtro-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filtro-btn")
      .forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    renderLista(btn.dataset.filtro);
  });
});

document.getElementById("btnMarcarTodos").addEventListener("click", () => {
  const todosPagos = pagamentos[semanaAtual - 1].every((v) => v);
  pagamentos[semanaAtual - 1] = pagamentos[semanaAtual - 1].map(
    () => !todosPagos
  );
  salvarDados();
  atualizarBarra();
  atualizarTotal();
  renderLista(document.querySelector(".filtro-btn.ativo").dataset.filtro);
});

atualizarSemana();

// Data do primeiro sorteio (quinta-feira, 30/01/2026)
const dataInicio = new Date(2026, 0, 30); // mês 0-based (0 = janeiro)

// Lista de nomes (pode conter repetidos)
let nomes = JSON.parse(localStorage.getItem("nomes")) || [
  "Vanda",
  "Cristiane",
  "Cristiane",
  "Noemi",
  "Noemi",
  "Gil",
  "Dude",
  "Diza",
  "Graça",
  "Ilza",
  "Aldo",
  "Aldo",
  "A: Ilza",
  "Ana",
  "Ana",
  "Cristiane",
  "Cristiane",
  "Deja",
  "Marcia",
  "Marcia",
  "Cristiane",
  "Ir. Marcio",
  "Ir. Rosa",
  "Dane",
  "Socorro",
  "Emerson",
  "Ilza",
  "Suely",
  "Cleide",
  "Dane",
  "Laudjane",
  "Ir. Alex",
  "Dane",
  "Dane",
  "Vitória"
];

// Semana atual começa em 1, pois semana 1 é índice 0 no array
let semanaAtual = Number(localStorage.getItem("semanaAtual")) || 1;

// Sorteios: array de nomes sorteados por semana
let sorteios =
  JSON.parse(localStorage.getItem("sorteios")) || Array(35).fill(null);
if (!sorteios[0]) sorteios[0] = nomes[0]; // semana 1 já tem o primeiro sorteado

// Pagamentos: array de semanas, cada semana é array de booleanos (pagamento por índice)
let pagamentos =
  JSON.parse(localStorage.getItem("pagamentos")) ||
  Array.from({ length: 35 }, () => Array(nomes.length).fill(false));

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
    tituloPrincipal.textContent = `Sorteio Semanal (${totalSemanas} semanas)`;
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

// --- NOVO SORTEIO ---

document.addEventListener("DOMContentLoaded", function () {
  const btnNovoSorteio = document.getElementById("btnNovoSorteio");
  const btnEditarSorteio = document.getElementById("btnEditarSorteio");
  const modalNovoSorteio = document.getElementById("modalNovoSorteio");
  const fecharModalNovoSorteio = document.getElementById(
    "fecharModalNovoSorteio"
  );
  const formNovoSorteio = document.getElementById("formNovoSorteio");
  const inputSemanas = document.getElementById("inputSemanas");
  const inputValor = document.getElementById("inputValor");
  const inputParticipantes = document.getElementById("inputParticipantes");
  const tituloModalSorteio = document.getElementById("tituloModalSorteio");

  let modoEdicao = false;

  if (
    !btnNovoSorteio ||
    !btnEditarSorteio ||
    !modalNovoSorteio ||
    !fecharModalNovoSorteio ||
    !formNovoSorteio ||
    !inputSemanas ||
    !inputValor ||
    !inputParticipantes ||
    !tituloModalSorteio
  ) {
    alert(
      "Erro ao carregar elementos do Sorteio. Atualize a página ou verifique o HTML."
    );
    return;
  }

  btnNovoSorteio.addEventListener("click", () => {
    modoEdicao = false;
    tituloModalSorteio.textContent = "Novo Sorteio";
    inputParticipantes.value = nomes.join("\n");
    inputSemanas.value = sorteios.length;
    inputValor.value = 100;
    modalNovoSorteio.style.display = "block";
  });

  btnEditarSorteio.addEventListener("click", () => {
    modoEdicao = true;
    tituloModalSorteio.textContent = "Editar Sorteio";
    inputParticipantes.value = nomes.join("\n");
    inputSemanas.value = sorteios.length;
    inputValor.value = 100;
    modalNovoSorteio.style.display = "block";
  });

  fecharModalNovoSorteio.addEventListener("click", () => {
    modalNovoSorteio.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modalNovoSorteio) modalNovoSorteio.style.display = "none";
  });

  formNovoSorteio.addEventListener("submit", (e) => {
    e.preventDefault();
    const novasSemanas = Math.max(1, parseInt(inputSemanas.value));
    const novoValor = Math.max(1, parseInt(inputValor.value));
    const novosNomes = inputParticipantes.value
      .split(/\r?\n/)
      .map((n) => n.trim())
      .filter((n) => n);
    if (novosNomes.length < novasSemanas) {
      alert(
        "A quantidade de participantes deve ser igual ou maior que o número de semanas."
      );
      return;
    }
    nomes = novosNomes;
    if (modoEdicao) {
      // Mantém semanaAtual e sorteios já realizados, mas ajusta arrays se necessário
      if (novasSemanas !== sorteios.length) {
        sorteios.length = novasSemanas;
        pagamentos.length = novasSemanas;
        for (let i = 0; i < novasSemanas; i++) {
          if (!pagamentos[i]) pagamentos[i] = Array(nomes.length).fill(false);
        }
      }
      for (let i = 0; i < pagamentos.length; i++) {
        pagamentos[i].length = nomes.length;
        for (let j = 0; j < nomes.length; j++) {
          if (typeof pagamentos[i][j] !== "boolean") pagamentos[i][j] = false;
        }
      }
      salvarDados();
      modalNovoSorteio.style.display = "none";
      atualizarSemana();
      alert("Sorteio editado!");
    } else {
      semanaAtual = 1;
      sorteios = Array(novasSemanas).fill(null);
      pagamentos = Array.from({ length: novasSemanas }, () =>
        Array(nomes.length).fill(false)
      );
      // Marca o primeiro sorteado se já quiser (opcional)
      // sorteios[0] = nomes[0];
      // pagamentos[0][0] = true;
      localStorage.clear();
      salvarDados();
      modalNovoSorteio.style.display = "none";
      atualizarSemana();
      alert("Novo sorteio iniciado!");
    }
  });
});

function limparDados() {
  localStorage.removeItem("nomes");
  localStorage.removeItem("sorteios");
  localStorage.removeItem("pagamentos");
  localStorage.removeItem("semanaAtual");
  location.reload();
}

document.getElementById("btnLimpar").addEventListener("click", limparDados);

atualizarSemana();

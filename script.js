// Data do primeiro sorteio (sexta-feira, 23/05/2025)
const dataInicio = new Date(2025, 4, 23); // mês 0-based (4 = maio)

// Lista de nomes (pode conter repetidos)
let nomes = JSON.parse(localStorage.getItem("nomes")) || [
  "Vanda", "Danielle", "Ana", "Vinicius", "M.de aldo", "Giselle", "Aldo",
  "Cristiane", "Cristiane", "Cristiane", "Ilza", "Camila bety", "Graça",
  "Bety", "Cristiane", "Hugo", "Marcia", "Graça", "IR Rosinha", "Aldo",
  "Camila Graça", "Emerson", "Laudjane", "Cristiane", "Dane", "Cleide",
  "Sueli", "IR Marcio", "Dane", "Socorro", "Ilza", "Dane", "Dane",
  "A Ilza", "Dane", "Vitória"
];

// Semana atual começa em 1, pois semana 1 é índice 0 no array
let semanaAtual = Number(localStorage.getItem("semanaAtual")) || 1;

// Sorteios: array de nomes sorteados por semana
let sorteios = JSON.parse(localStorage.getItem("sorteios")) || Array(36).fill(null);
if (!sorteios[0]) sorteios[0] = "Vanda"; // semana 1 já tem o primeiro sorteado

// Pagamentos: array de semanas, cada semana é array de booleanos (pagamento por índice)
let pagamentos = JSON.parse(localStorage.getItem("pagamentos")) || Array.from({ length: 36 }, () =>
  Array(nomes.length).fill(false)
);

// Se não tinha dados no localStorage, marca pagamento do sorteado da semana 1
if (!localStorage.getItem("pagamentos")) pagamentos[0][0] = true;

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

// Formata data dd/mm/yyyy
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

    const foiSorteadoAteSemanaAtual = sorteios.slice(0, semanaAtual).includes(nome);
    const sorteadoEstaSemana = sorteios[semanaAtual - 1] === nome;
    const pagoNaSemanaAtual = pagamentos[semanaAtual - 1][index];

    if (foiSorteadoAteSemanaAtual) linha.classList.add("sorteado");
    if (sorteios[semanaAtual] === nome) linha.classList.add("proximo");
    if (pagoNaSemanaAtual) linha.classList.add("pagou");
    if (sorteadoEstaSemana) linha.classList.add("pagou");

    // Filtro
    if (filtro === "pagaram" && !pagoNaSemanaAtual) return;
    if (filtro === "naoPagaram" && pagoNaSemanaAtual) return;

    const tdNumero = document.createElement("td");
    tdNumero.textContent = index + 1;

    // Data do sorteio da semana (index = semana - 1)
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
    tdStatus.textContent = sorteios[semanaAtual - 1] === nome ? "Sorteado" : "";

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
  const pagos = pagamentos[semanaAtual - 1].filter(v => v).length;
  const total = nomes.length;
  progresso.style.width = `${(pagos / total) * 100}%`;
}

function atualizarTotal() {
  let totalPagamentos = 0;
  for (let i = 0; i < semanaAtual; i++) {
    pagamentos[i].forEach(pago => {
      if (pago) totalPagamentos++;
    });
  }
  const total = totalPagamentos * 100;
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
  if (semanaAtual > nomes.length) {
    alert("Todas as semanas foram sorteadas.");
    return;
  }
  const nomeSorteado = nomes[semanaAtual - 1];
  sorteios[semanaAtual - 1] = nomeSorteado;
  pagamentos[semanaAtual - 1][semanaAtual - 1] = true; // marca pagamento do sorteado na semana

  // Zera pagamentos da próxima semana
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

document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    renderLista(btn.dataset.filtro);
  });
});

document.getElementById("btnMarcarTodos").addEventListener("click", () => {
  const todosPagos = pagamentos[semanaAtual - 1].every(v => v);
  pagamentos[semanaAtual - 1] = pagamentos[semanaAtual - 1].map(() => !todosPagos);
  salvarDados();
  atualizarBarra();
  atualizarTotal();
  renderLista(document.querySelector(".filtro-btn.ativo").dataset.filtro);
});

function limparDados() {
  localStorage.removeItem("nomes");
  localStorage.removeItem("sorteios");
  localStorage.removeItem("pagamentos");
  localStorage.removeItem("semanaAtual");
  location.reload();
}

document.getElementById("btnLimpar").addEventListener("click", limparDados);

// Inicializa página
atualizarSemana();

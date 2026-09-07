/* ==========================================================================
   HackGov · Agendamento em Unidades de Saúde — protótipo Fase 1
   Persistência local (localStorage) simulando o backend do sistema.
   Cobre: US01 (cadastro), US02 (agendar), US03 (cancelar/reagendar),
          US04 (lembrete simulado), US05 (acompanhar status)
   ========================================================================== */

const STORAGE_KEY = "hackgov_v1";

const UNIDADES = {
  "UBS Jardim das Flores": ["Clínica Geral", "Pediatria", "Odontologia"],
  "UBS Vila Esperança": ["Clínica Geral", "Ginecologia", "Cardiologia"],
  "UPA Central": ["Clínica Geral", "Ortopedia", "Pronto Atendimento"],
};

const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

/* ---------------- Estado ---------------- */

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return { cidadao: null, agendamentos: [], notificacoes: [] };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let horarioSelecionado = null;
let reagendandoId = null;

/* ---------------- Utilidades ---------------- */

function gerarProtocolo() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `HG-${n}`;
}

function formatarData(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.classList.add("is-visible");
  clearTimeout(mostrarToast._t);
  mostrarToast._t = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

/* ---------------- Navegação ---------------- */

function irPara(view) {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("is-active", section.id === `view-${view}`);
  });
  if (view === "agendar") renderAgendar();
  if (view === "agendamentos") renderAgendamentos();
}

document.getElementById("nav").addEventListener("click", (e) => {
  const btn = e.target.closest(".nav-item");
  if (btn) irPara(btn.dataset.view);
});

document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => irPara(btn.dataset.goto));
});

/* ==========================================================================
   US01 — Cadastro do cidadão
   ========================================================================== */

const formCadastro = document.getElementById("form-cadastro");

function preencherCadastroExistente() {
  if (!state.cidadao) return;
  document.getElementById("c-nome").value = state.cidadao.nome;
  document.getElementById("c-cpf").value = state.cidadao.cpf;
  document.getElementById("c-sus").value = state.cidadao.sus;
  document.getElementById("c-nasc").value = state.cidadao.nascimento;
}

formCadastro.addEventListener("submit", (e) => {
  e.preventDefault();

  const cpf = document.getElementById("c-cpf").value.replace(/\D/g, "");
  const sus = document.getElementById("c-sus").value.replace(/\D/g, "");

  if (cpf.length !== 11) {
    document.getElementById("cadastro-status").textContent = "CPF inválido. Digite os 11 números do CPF.";
    return;
  }
  if (sus.length !== 15) {
    document.getElementById("cadastro-status").textContent = "Cartão SUS inválido. Digite os 15 números do cartão.";
    return;
  }

  state.cidadao = {
    nome: document.getElementById("c-nome").value.trim(),
    cpf: document.getElementById("c-cpf").value.trim(),
    sus: document.getElementById("c-sus").value.trim(),
    nascimento: document.getElementById("c-nasc").value,
  };
  saveState();

  document.getElementById("cadastro-status").textContent = "Cadastro salvo com sucesso.";
  mostrarToast("Cadastro concluído");
});

/* ==========================================================================
   US02 — Agendar consulta ou exame
   ========================================================================== */

const formAgendar = document.getElementById("form-agendar");
const selectUnidade = document.getElementById("a-unidade");
const selectEspecialidade = document.getElementById("a-especialidade");
const horariosBox = document.getElementById("a-horarios");
const gateMsg = document.getElementById("agendar-gate-msg");

function popularUnidades() {
  selectUnidade.innerHTML = Object.keys(UNIDADES)
    .map((u) => `<option value="${u}">${u}</option>`)
    .join("");
  popularEspecialidades();
}

function popularEspecialidades() {
  const especialidades = UNIDADES[selectUnidade.value] || [];
  selectEspecialidade.innerHTML = especialidades
    .map((esp) => `<option value="${esp}">${esp}</option>`)
    .join("");
}

selectUnidade.addEventListener("change", popularEspecialidades);

function renderHorarios(data, unidade) {
  horarioSelecionado = null;
  const ocupados = state.agendamentos
    .filter((a) => a.unidade === unidade && a.data === data && a.status !== "cancelado")
    .map((a) => a.horario);

  horariosBox.innerHTML = HORARIOS.map((h) => {
    const taken = ocupados.includes(h);
    return `<button type="button" class="chip ${taken ? "is-taken" : ""}" data-hora="${h}" ${taken ? "disabled" : ""}>${h}</button>`;
  }).join("");
}

horariosBox.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip || chip.classList.contains("is-taken")) return;
  horariosBox.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
  chip.classList.add("is-selected");
  horarioSelecionado = chip.dataset.hora;
});

document.getElementById("a-data").addEventListener("change", (e) => {
  renderHorarios(e.target.value, selectUnidade.value);
});
selectUnidade.addEventListener("change", () => {
  const data = document.getElementById("a-data").value;
  if (data) renderHorarios(data, selectUnidade.value);
});

function renderAgendar() {
  const cadastrado = !!state.cidadao;
  gateMsg.hidden = cadastrado;
  formAgendar.hidden = !cadastrado;
  if (!cadastrado) return;

  popularUnidades();
  const data = document.getElementById("a-data").value;
  if (data) renderHorarios(data, selectUnidade.value);

  const titulo = document.querySelector("#view-agendar h1");
  titulo.textContent = reagendandoId ? "Reagendar consulta" : "Agendar consulta ou exame";
  document.getElementById("a-submit").textContent = reagendandoId ? "Salvar novo horário" : "Confirmar agendamento";
}

formAgendar.addEventListener("submit", (e) => {
  e.preventDefault();
  const status = document.getElementById("agendar-status");

  if (!horarioSelecionado) {
    status.textContent = "Selecione um horário disponível.";
    return;
  }

  const dados = {
    unidade: selectUnidade.value,
    especialidade: selectEspecialidade.value,
    data: document.getElementById("a-data").value,
    horario: horarioSelecionado,
    canal: document.getElementById("a-canal").value,
  };

  if (reagendandoId) {
    const ag = state.agendamentos.find((a) => a.id === reagendandoId);
    Object.assign(ag, dados, { status: "pendente" });
    registrarNotificacao(ag, "Agendamento reagendado");
    mostrarToast("Consulta reagendada");
    reagendandoId = null;
  } else {
    const novo = {
      id: crypto.randomUUID(),
      protocolo: gerarProtocolo(),
      status: "pendente",
      ...dados,
    };
    state.agendamentos.unshift(novo);
    registrarNotificacao(novo, "Lembrete de agendamento programado");
    mostrarToast("Agendamento confirmado");
  }

  saveState();
  formAgendar.reset();
  horarioSelecionado = null;
  irPara("agendamentos");
});

/* ==========================================================================
   US04 — Lembretes (simulados)
   ========================================================================== */

function registrarNotificacao(agendamento, mensagem) {
  const canalTexto = { app: "notificação no app", sms: "SMS", email: "e-mail" }[agendamento.canal] || "app";
  state.notificacoes.unshift({
    id: crypto.randomUUID(),
    mensagem: `${mensagem} — ${agendamento.especialidade} em ${formatarData(agendamento.data)} às ${agendamento.horario}, enviado por ${canalTexto}.`,
    protocolo: agendamento.protocolo,
    criadoEm: new Date().toISOString(),
  });
}

/* ==========================================================================
   US03 + US05 — Meus agendamentos: status, cancelar, reagendar
   ========================================================================== */

const listaAgendamentos = document.getElementById("appointment-list");
const listaNotificacoes = document.getElementById("notification-list");
const emptyState = document.getElementById("agendamentos-empty");

const STATUS_LABEL = { pendente: "Pendente", confirmado: "Confirmado", cancelado: "Cancelado" };

function renderAgendamentos() {
  emptyState.hidden = state.agendamentos.length > 0;
  listaAgendamentos.innerHTML = state.agendamentos
    .map((ag) => {
      const podeAgir = ag.status !== "cancelado";
      return `
        <li class="appointment-card">
          <div class="appointment-top">
            <div>
              <p class="appointment-title">${ag.especialidade} — ${ag.unidade}</p>
              <p class="appointment-meta">${formatarData(ag.data)} às ${ag.horario}</p>
              <p class="appointment-protocolo">Protocolo ${ag.protocolo}</p>
            </div>
            <span class="status status-${ag.status}">${STATUS_LABEL[ag.status]}</span>
          </div>
          ${podeAgir ? `
          <div class="appointment-actions">
            ${ag.status === "pendente" ? `<button class="btn-ghost" data-action="confirmar" data-id="${ag.id}">Simular confirmação da unidade</button>` : ""}
            <button class="btn-ghost" data-action="reagendar" data-id="${ag.id}">Reagendar</button>
            <button class="btn-ghost" data-action="cancelar" data-id="${ag.id}">Cancelar</button>
          </div>` : ""}
        </li>`;
    })
    .join("");

  listaNotificacoes.innerHTML = state.notificacoes.length
    ? state.notificacoes
        .map((n) => `<li class="notification-item"><b>${n.protocolo}</b> · ${n.mensagem}</li>`)
        .join("")
    : `<li class="notification-item">Nenhum lembrete enviado ainda.</li>`;
}

listaAgendamentos.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const ag = state.agendamentos.find((a) => a.id === id);
  if (!ag) return;

  if (action === "cancelar") {
    ag.status = "cancelado";
    saveState();
    mostrarToast("Agendamento cancelado");
    renderAgendamentos();
  }

  if (action === "confirmar") {
    ag.status = "confirmado";
    registrarNotificacao(ag, "Consulta confirmada pela unidade de saúde");
    saveState();
    mostrarToast("Status atualizado para confirmado");
    renderAgendamentos();
  }

  if (action === "reagendar") {
    reagendandoId = id;
    document.getElementById("a-data").value = "";
    irPara("agendar");
  }
});

/* ---------------- Inicialização ---------------- */

preencherCadastroExistente();
renderAgendar();
renderAgendamentos();

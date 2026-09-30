"use strict";

// Independent, in-memory showcase. No production endpoints or credentials.
(() => {
  const $ = (selector) => document.querySelector(selector);
  const stage = $("#mockup-ija"),
    app = $("#demo-app"),
    content = $("#demo-content");
  const html = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const options = (items, selected) =>
    items
      .map(
        (v) =>
          `<option${v === selected ? " selected" : ""}>${html(v)}</option>`,
      )
      .join("");
  const makeRecord = (id, name, status, index, agro = false) => ({
    id,
    name,
    status,
    team: "Sem equipe",
    type: agro ? "Pulverização" : "Tratamento",
    place: agro
      ? "Propriedade de demonstração · Minas Gerais"
      : "Rua Exemplo, 100 · São Paulo",
    date: "30/09/2026",
    time: index ? "14:00" : "09:00",
    lat: "-23.550500",
    lng: "-46.633300",
    region: index ? "SUL" : "OESTE",
    focus: agro ? "Aplicação planejada" : "Edificação com inservíveis",
    protocol: "",
    attachments: [],
    area: agro ? "24 ha" : "Imóvel Geral",
  });
  const data = {
    uvis: [
      makeRecord("5530", "Unidade 1", "Pendente", 0),
      makeRecord("5529", "Unidade 2", "Aprovado", 1),
      makeRecord("5528", "Unidade 3", "Concluído", 2),
    ],
    agro: [
      makeRecord("101", "Fazenda Horizonte", "Aprovado", 0, true),
      makeRecord("102", "Fazenda Exemplo", "Pendente", 1, true),
    ],
  };
  const collections = {
    clients: {
      title: "Clientes",
      columns: ["Nome", "Segmento", "Situação"],
      rows: [
        ["Cliente demonstração", "Agro", "Ativo"],
        ["Cliente exemplo", "Serviços", "Ativo"],
      ],
    },
    suppliers: {
      title: "Fornecedores",
      columns: ["Nome", "Especialidade", "Situação"],
      rows: [["Fornecedor exemplo", "Insumos", "Ativo"]],
    },
    quotes: {
      title: "Orçamentos",
      columns: ["Proposta", "Cliente", "Status"],
      rows: [
        ["ORC-001", "Cliente demonstração", "Em análise"],
        ["ORC-002", "Cliente exemplo", "Aprovado"],
      ],
    },
    contracts: {
      title: "Contratos",
      columns: ["Contrato", "Cliente", "Status"],
      rows: [["CT-001", "Cliente exemplo", "Aguardando planejamento"]],
    },
    finance: {
      title: "Financeiro",
      columns: ["Lançamento", "Categoria", "Situação"],
      rows: [
        ["Recebimento demonstrativo", "Serviços", "A receber"],
        ["Despesa demonstrativa", "Operação", "A pagar"],
      ],
    },
    users: {
      title: "Usuários",
      columns: ["Nome", "Perfil", "Status"],
      rows: [
        ["Admin demonstração", "Administrador", "Ativo"],
        ["Operador exemplo", "Operacional", "Ativo"],
      ],
    },
    pilots: {
      title: "Pilotos",
      columns: ["Nome", "Equipe", "Status"],
      rows: [
        ["Piloto demonstração", "Equipe 01", "Disponível"],
        ["Piloto exemplo", "Equipe 02", "Em operação"],
      ],
    },
    equipment: {
      title: "Equipamentos",
      columns: ["Equipamento", "Identificação", "Status"],
      rows: [
        ["Drone demonstração", "DR-001", "Disponível"],
        ["Bateria demonstração", "BT-001", "Em uso"],
      ],
    },
    vehicles: {
      title: "Veículos",
      columns: ["Veículo", "Equipe", "Status"],
      rows: [
        ["Veículo demonstração", "Equipe 01", "Em operação"],
        ["Veículo exemplo", "Equipe 02", "Disponível"],
      ],
    },
  };
  let segment = "uvis",
    view = "dashboard",
    filter = "Todos",
    toastTimer,
    createKind = "request";
  function toast(message) {
    const el = $(".toast");
    el.textContent = message;
    el.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("visible"), 4500);
  }
  const button = (label, action, extra = "") =>
    `<button type="button" class="app-action ${extra}" ${action}>${label}</button>`;
  function title(title, subtitle, actions = "") {
    return `<div class="app-title-row"><div class="app-title"><span class="title-icon" aria-hidden="true">▦</span><div><h3>${title}</h3><p>${subtitle}</p></div></div><div class="app-actions">${actions}</div></div>`;
  }
  function navigation() {
    const links =
      segment === "uvis"
        ? [
            ["dashboard", "▦", "Dashboard"],
            ["history", "◷", "Histórico OS"],
            ["notifications", "◆", "Notificações"],
            ["reports", "▤", "Relatórios"],
            ["agenda", "▣", "Agenda"],
            ["users", "◎", "Usuário"],
            ["clients", "◉", "Clientes"],
            ["pilots", "✈", "Pilotos"],
            ["equipment", "⚙", "Equipamentos"],
            ["vehicles", "▰", "Veículos"],
            ["maps", "⌖", "Mapas"],
          ]
        : [
            ["dashboard", "▦", "Dashboard"],
            ["clients", "◎", "Clientes e Fornecedores"],
            ["quotes", "▣", "Comercial"],
            ["finance", "$", "Financeiro"],
            ["operations", "⚙", "Operacional"],
          ];
    $(".sidebar-links").innerHTML = links
      .map(
        ([id, icon, label]) =>
          `<button type="button" data-view="${id}"${view === id ? ' class="selected" aria-current="page"' : ""}><span aria-hidden="true">${icon}</span><span class="nav-label">${label}</span>${id === "notifications" ? '<b class="nav-badge">2</b>' : id === "vehicles" ? '<b class="nav-badge">2</b>' : id === "maps" ? '<b class="nav-live">LIVE</b>' : ""}</button>`,
      )
      .join("");
  }
  function requestCard(r) {
    const teams =
      segment === "uvis"
        ? ["Sem equipe", "Equipe UVIS 01", "Equipe UVIS 02"]
        : ["Sem equipe", "Equipe Agro 01", "Equipe Agro 02"];
    const rows =
      segment === "uvis"
        ? [
            ["Tipo de visita", "Aedes"],
            ["Tipo de operação", r.type],
            ["Tipo de imóvel", r.area],
            ["D.A", "61"],
            ["Altura", "20 m"],
            ["Foco", r.focus],
            ["Apoio CET?", "Sim"],
          ]
        : [
            ["Tipo de operação", r.type],
            ["Cultura", "Milho"],
            ["Área planejada", r.area],
            ["Volume de aplicação", "10 L/ha"],
            ["Foco", r.focus],
            ["Equipe", r.team],
          ];
    return `<article class="demo-request" data-card="${r.id}"><section class="request-summary" aria-label="Resumo da solicitação ${r.id}"><h4>#${r.id} ${html(r.name)}</h4><div class="request-pills"><span${r.status === "Concluído" ? ' class="green"' : ""}>${html(r.status.toUpperCase())}</span><span>${segment === "uvis" ? r.region : "AGRO"}</span></div><p class="team-note">♟ ${r.team === "Sem equipe" ? "Sem equipe atribuída" : html(r.team)}</p><div class="request-meta"><p><span>▢</span><strong>Agendada para ${r.date} às ${r.time}</strong></p><p><span>◷</span>Criada em 29/09/2026 às 16:25</p><p><span>⌖</span>${html(r.place)}</p><small>Local ilustrativo · sem vínculo com uma operação real</small></div><div class="request-buttons">${r.status === "Cancelada" ? button("↶ Restaurar", `data-restore="${r.id}"`) : button("□ Editar", `data-edit="${r.id}"`) + button("▥ Deletar", `data-cancel="${r.id}"`, "danger")}</div></section><section class="request-details" aria-label="Dados técnicos da solicitação ${r.id}"><div class="coordinates"><span>${html(r.lat)}, ${html(r.lng)}</span><button type="button" data-location="${r.id}" aria-label="Ver localização demonstrativa ${r.id}">▤</button></div><table class="technical-table"><tbody>${rows.map(([key, value]) => `<tr><th scope="row">${key}</th><td>${value === "Sim" ? '<span class="yes-chip">Sim</span>' : html(value)}</td></tr>`).join("")}</tbody></table></section><form class="request-form" data-record="${r.id}"><div class="coordinate-fields"><label>Latitude<input name="lat" aria-label="Latitude da solicitação ${r.id}" value="${html(r.lat)}" inputmode="decimal" pattern="-?[0-9]+([.][0-9]+)?" required></label><label>Longitude<input name="lng" aria-label="Longitude da solicitação ${r.id}" value="${html(r.lng)}" inputmode="decimal" pattern="-?[0-9]+([.][0-9]+)?" required></label></div><label>Protocolo<input name="protocol" aria-label="Protocolo da solicitação ${r.id}" placeholder="Protocolo" value="${html(r.protocol)}" maxlength="40"></label><div class="request-controls"><label>Status<select name="status" aria-label="Status da solicitação ${r.id}">${options(["Pendente", "Em análise", "Aprovado", "Concluído", "Cancelada"], r.status)}</select></label><label>Equipe responsável<select name="team" aria-label="Equipe da solicitação ${r.id}">${options(teams, r.team)}</select></label><label class="attachment-control"><span>⌕ ${r.attachments.length ? `${r.attachments.length} anexo(s)` : "Anexar"}</span><input type="file" multiple accept="image/*,.pdf" data-attachment="${r.id}" aria-label="Anexar arquivo à demonstração ${r.id}"></label><button type="submit" class="save-demo">Salvar</button></div></form></article>`;
  }
  function table(columns, rows) {
    return `<div class="demo-table-scroll"><table class="demo-data-table"><thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${html(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function agroDashboard() {
    const groups = [
      [
        "Comercial",
        "Cadastros, propostas e contratos antes da execução em campo.",
        [
          [
            "clients",
            "◎",
            "Clientes",
            `${collections.clients.rows.length} cadastro(s)`,
          ],
          [
            "suppliers",
            "▦",
            "Fornecedores",
            `${collections.suppliers.rows.length} cadastro(s)`,
          ],
          [
            "quotes",
            "▤",
            "Orçamentos",
            `${collections.quotes.rows.length} proposta(s)`,
          ],
          [
            "contracts",
            "▧",
            "Contratos",
            `${collections.contracts.rows.length} contrato(s)`,
          ],
        ],
      ],
      [
        "Operacional",
        "Planejamento, equipes, pilotos e estrutura da execução em campo.",
        [
          [
            "operations",
            "☑",
            "Ordens de Serviço",
            `${data.agro.length} OS cadastrada(s)`,
          ],
          ["agenda", "≡", "Fila Operacional", "Agenda e planejamento"],
        ],
      ],
      [
        "Financeiro",
        "Caixa, contas, bancos e lançamentos manuais do Agro.",
        [
          ["finance", "▤", "Caixa Diário", "Fechamento diário e conferência"],
          ["finance", "↙", "Contas a Receber", "Recebimentos e acompanhamento"],
          ["finance", "↗", "Contas a Pagar", "Pagamentos e vencimentos"],
        ],
      ],
    ];
    return (
      title(
        "Painel Agro",
        "Acesso rápido aos fluxos comercial, operacional e financeiro do Agro.",
        button("＋ Novo Cliente", 'data-new="clients"') +
          button("▦ Novo Fornecedor", 'data-new="suppliers"', "secondary") +
          button("▤ Novo Orçamento", 'data-new="quotes"', "outline"),
      ) +
      `<div class="agro-stats">${[
        ["Clientes", collections.clients.rows.length],
        ["Fornecedores", collections.suppliers.rows.length],
        ["Orçamentos", collections.quotes.rows.length],
        [
          "Fila operacional",
          data.agro.filter((r) => r.status !== "Concluído").length,
        ],
        ["Pendências financeiras", collections.finance.rows.length],
      ]
        .map(
          ([name, value]) =>
            `<div><span>${name}</span><strong>${value}</strong></div>`,
        )
        .join("")}</div>` +
      groups
        .map(
          ([name, desc, items]) =>
            `<section class="agro-group"><h4>${name}</h4><p>${desc}</p><div class="agro-shortcuts">${items.map(([id, icon, label, note]) => `<button type="button" data-view="${id}"><span>${icon}</span><strong>${label}</strong><small>${note}</small><i>↗</i></button>`).join("")}</div></section>`,
        )
        .join("")
    );
  }
  function render() {
    const scroll = content.scrollTop;
    app.dataset.segment = segment;
    stage.dataset.segment = segment;
    $("#app-brand").innerHTML =
      `IJA System <span>${segment === "uvis" ? "(Prefeituras)" : "AGRO"}</span>`;
    $("#demo-online-label").textContent =
      segment === "uvis" ? "Operação UVIS" : "Operação Agrícola";
    navigation();
    const records = data[segment];
    const detailed = detailedViews.render(view);
    if (detailed !== null) {
      content.innerHTML =
        detailed +
        '<p class="demo-footnote">Demonstração interativa com dados fictícios. As alterações são temporárias.</p>';
      content.scrollTop = scroll;
      return;
    }
    if (view === "dashboard" && segment === "agro")
      content.innerHTML = agroDashboard();
    else if (["dashboard", "operations", "cancelled"].includes(view)) {
      const visible = records.filter((r) =>
        view === "cancelled"
          ? r.status === "Cancelada"
          : r.status !== "Cancelada" &&
            (filter === "Todos" || r.status === filter),
      );
      content.innerHTML =
        title(
          view === "cancelled"
            ? "Solicitações canceladas"
            : segment === "uvis"
              ? "Painel de Gestão"
              : "Ordens de Serviço",
          `Solicitações filtradas: <strong>${visible.length}</strong>`,
          button("＋ Nova Solicitação", 'data-new="request"') +
            button("▣ Exportar CSV", "data-export", "secondary") +
            button(
              view === "cancelled" ? "↶ Voltar" : "⊗ Canceladas",
              `data-view="${view === "cancelled" ? "dashboard" : "cancelled"}"`,
              "danger",
            ),
        ) +
        `<details class="demo-filters"${filter !== "Todos" ? " open" : ""}><summary><span>Filtros de Busca</span><b>${segment === "uvis" ? "UVIS/PREFEITURA" : "OPERAÇÃO AGRO"}</b><i>⌄</i></summary><div class="filter-fields"><label>Status da operação<select id="status-filter">${options(["Todos", "Pendente", "Em análise", "Aprovado", "Concluído"], filter)}</select></label></div></details>` +
        (visible.length
          ? visible.map(requestCard).join("")
          : '<div class="empty-state">Nenhuma solicitação encontrada neste filtro.</div>');
    } else if (view === "history")
      content.innerHTML =
        title(
          "Histórico OS",
          "Registros demonstrativos e seu andamento.",
          button("▣ Exportar CSV", "data-export", "secondary"),
        ) +
        table(
          ["Ordem", "Unidade / propriedade", "Operação", "Status"],
          records.map((r) => ["#" + r.id, r.name, r.type, r.status]),
        );
    else if (view === "agenda")
      content.innerHTML =
        title("Agenda", "Programação ilustrativa das operações.") +
        `<div class="agenda-list">${records
          .filter((r) => r.status !== "Cancelada")
          .map(
            (r) =>
              `<article class="agenda-event"><strong>${r.time}</strong><div><h4>${html(r.name)}</h4><p>${r.date} · ${html(r.type)}</p></div><span class="table-status">${r.status}</span></article>`,
          )
          .join("")}</div>`;
    else if (view === "reports")
      content.innerHTML =
        title(
          "Relatórios",
          "Indicadores calculados a partir desta demonstração.",
          button("▣ Exportar CSV", "data-export", "secondary"),
        ) +
        `<div class="demo-stats">${["Pendente", "Aprovado", "Concluído"].map((s) => `<div class="demo-stat"><span>${s}</span><strong>${records.filter((r) => r.status === s).length}</strong><small>Operações de exemplo</small></div>`).join("")}</div>` +
        table(
          ["Operação", "Equipe", "Status"],
          records.map((r) => [r.type, r.team, r.status]),
        );
    else if (view === "notifications")
      content.innerHTML =
        title("Notificações", "Atualizações ilustrativas da operação.") +
        table(
          ["Notificação", "Origem"],
          [
            ["Nova solicitação disponível para análise", "Painel de Gestão"],
            ["Confira a programação das equipes", "Agenda"],
          ],
        );
    else if (view === "maps")
      content.innerHTML =
        title(
          "Localizações",
          "Coordenadas ilustrativas, sem conexão com dados de campo.",
        ) +
        table(
          ["Solicitação", "Latitude", "Longitude"],
          records.map((r) => [r.name, r.lat, r.lng]),
        );
    else if (collections[view]) {
      const c = collections[view];
      content.innerHTML =
        title(
          c.title,
          "Dados de exemplo para explorar a interface.",
          button("＋ Novo registro", `data-new="${view}"`),
        ) +
        table(c.columns, c.rows) +
        (view === "clients"
          ? `<div class="demo-related">${button("Fornecedores →", 'data-view="suppliers"', "outline")}</div>`
          : "");
    }
    content.innerHTML +=
      '<p class="demo-footnote">Demonstração interativa com dados fictícios. As alterações são temporárias.</p>';
    content.scrollTop = scroll;
  }
  function navigate(next) {
    view = next;
    filter = "Todos";
    content.scrollTop = 0;
    render();
  }
  function openCreate(kind) {
    createKind = kind;
    $("#demo-create-form").reset();
    $("#demo-dialog-title").textContent =
      kind === "request"
        ? "Nova solicitação"
        : `Novo registro · ${collections[kind].title}`;
    $('#demo-create-form [name="date"]').value = "2026-09-30";
    $('#demo-create-form [name="type"]').closest("label").hidden =
      kind !== "request";
    $('#demo-create-form [name="date"]').closest("label").hidden =
      kind !== "request";
    $("#demo-dialog").showModal();
  }
  stage.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (detailedViews.handleClick(target)) return;
    if (target.dataset.segment) {
      segment = target.dataset.segment;
      stage.querySelectorAll("button[data-segment]").forEach((b) => {
        b.classList.toggle("active", b === target);
        b.setAttribute("aria-pressed", String(b === target));
      });
      navigate("dashboard");
    } else if (target.dataset.view) navigate(target.dataset.view);
    else if (target.dataset.new) openCreate(target.dataset.new);
    else if (target.dataset.edit) {
      const input = content.querySelector(
        `[data-record="${target.dataset.edit}"] [name="protocol"]`,
      );
      input.focus();
    } else if (target.dataset.cancel) {
      data[segment].find((r) => r.id === target.dataset.cancel).status =
        "Cancelada";
      render();
      toast(
        "Registro de exemplo movido para Canceladas. Você pode restaurá-lo.",
      );
    } else if (target.dataset.restore) {
      data[segment].find((r) => r.id === target.dataset.restore).status =
        "Pendente";
      render();
      toast("Registro de demonstração restaurado.");
    } else if (target.dataset.location) {
      navigate("maps");
    } else if (target.hasAttribute("data-export")) {
      const rows = [
        ["ID", "Unidade", "Operação", "Data", "Status", "Equipe"],
        ...data[segment].map((r) => [
          r.id,
          r.name,
          r.type,
          r.date,
          r.status,
          r.team,
        ]),
      ];
      const cell = (v) =>
        '"' +
        String(v)
          .replace(/^[=+@-]/, "'$&")
          .replace(/"/g, '""') +
        '"';
      const url = URL.createObjectURL(
        new Blob(
          ["\uFEFF" + rows.map((r) => r.map(cell).join(";")).join("\r\n")],
          { type: "text/csv;charset=utf-8" },
        ),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `ija-${segment}-demonstracao.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("CSV de demonstração exportado.");
    } else if (target.classList.contains("app-theme")) {
      const dark = app.classList.toggle("dark");
      target.setAttribute("aria-pressed", String(dark));
      target.querySelector(".theme-label").textContent = dark
        ? "Tema claro"
        : "Tema escuro";
    } else if (target.classList.contains("app-menu")) {
      const collapsed = app.classList.toggle("collapsed");
      target.setAttribute("aria-expanded", String(!collapsed));
      target.setAttribute(
        "aria-label",
        `${collapsed ? "Expandir" : "Recolher"} menu da demonstração`,
      );
    } else if (target.classList.contains("app-avatar"))
      toast(
        "Admin · perfil fictício da demonstração. Nenhuma conta conectada.",
      );
  });
  content.addEventListener("change", (event) => {
    if (detailedViews.handleChange(event.target)) return;
    if (event.target.id === "status-filter") {
      filter = event.target.value;
      render();
      $("#status-filter").focus();
    }
    if (event.target.dataset.attachment) {
      const r = data[segment].find(
        (r) => r.id === event.target.dataset.attachment,
      );
      r.attachments = [...event.target.files].map((f) => f.name);
      event.target.previousElementSibling.textContent = `⌕ ${r.attachments.length} anexo(s)`;
      toast("Arquivos selecionados localmente. Nenhum arquivo foi enviado.");
    }
  });
  content.addEventListener("submit", (event) => {
    if (detailedViews.handleSubmit(event)) return;
    if (!event.target.matches(".request-form")) return;
    event.preventDefault();
    const r = data[segment].find((r) => r.id === event.target.dataset.record),
      fields = new FormData(event.target);
    if (
      Math.abs(Number(fields.get("lat"))) > 90 ||
      Math.abs(Number(fields.get("lng"))) > 180
    ) {
      toast("Informe latitude entre −90 e 90 e longitude entre −180 e 180.");
      return;
    }
    ["protocol", "status", "team", "lat", "lng"].forEach(
      (key) => (r[key] = fields.get(key).trim()),
    );
    render();
    content.querySelector(`[data-record="${r.id}"] .save-demo`)?.focus();
    toast("Alterações salvas apenas na demonstração.");
  });
  $("#demo-create-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = new FormData(event.target),
      name = fields.get("name").trim();
    if (!name) return;
    if (createKind === "request") {
      const id = String(
          Math.max(...data[segment].map((r) => Number(r.id))) + 1,
        ),
        r = makeRecord(id, name, "Pendente", 0, segment === "agro");
      r.type = fields.get("type");
      r.date = fields.get("date").split("-").reverse().join("/");
      data[segment].unshift(r);
      view = segment === "agro" ? "operations" : "dashboard";
    } else {
      collections[createKind].rows.push([name, "Demonstração", "Novo"]);
      view = createKind;
    }
    filter = "Todos";
    $("#demo-dialog").close();
    content.scrollTop = 0;
    render();
    toast("Registro de exemplo criado.");
  });
  $("[data-close-demo]").addEventListener("click", () =>
    $("#demo-dialog").close(),
  );
  // Expanded view stays in the document flow; Escape restores the original size.
  $(".expand-demo").addEventListener("click", (event) => {
    const expanded = stage.classList.toggle("expanded");
    event.currentTarget.setAttribute("aria-expanded", String(expanded));
    event.currentTarget.textContent = expanded
      ? "⛶ Reduzir painel"
      : "⛶ Ampliar painel";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && stage.classList.contains("expanded"))
      $(".expand-demo").click();
  });
  const detailedViews = window.createIjaDetailedViews({
    html,
    options,
    button,
    title,
    toast,
    render,
    navigate,
    getSegment: () => segment,
    getRecords: () => data[segment],
  });
  render();
})();

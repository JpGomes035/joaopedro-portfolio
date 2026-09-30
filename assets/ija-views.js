"use strict";

// Rich, local-only screens for the portfolio mockup. All seed data is fictional.
window.createIjaDetailedViews = function (ctx) {
  const {
    html: h,
    options,
    button: btn,
    title,
    toast,
    render,
    getSegment,
    getRecords,
  } = ctx;
  const n = (value) => Number(value).toLocaleString("pt-BR");
  const statuses = [
    "Pendente",
    "Em análise",
    "Aprovado",
    "Aprovado c/ recom.",
    "Concluído",
    "Recusado",
    "Cancelada",
  ];
  const colors = [
    "#8494ae",
    "#ddba13",
    "#329564",
    "#f88417",
    "#8a32ff",
    "#fa424c",
    "#4b5662",
  ];
  const regions = ["NORTE", "LESTE", "SUL", "OESTE", "CENTRO"];
  const iso = (r) => r.date.split("/").reverse().join("-");
  const monthName = (value) =>
    new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
      new Date(value + "-15T12:00:00"),
    );
  let period = "2026-08",
    region = "Todas",
    agendaRegion = "Todas",
    calendarMonth = "2026-08",
    calendarMode = "month",
    equipmentFilter = "recent";
  const queries = { users: "", vehicles: "" },
    filters = { users: "Todos", vehicles: "Todos" };
  const archive = {};
  ["uvis", "agro"].forEach((segment, s) => {
    archive[segment] = [];
    [8, 9].forEach((month) => {
      const days = Array.from(
        { length: new Date(2026, month, 0).getDate() },
        (_, i) => i + 1,
      ).filter(
        (day) => ![0, 6].includes(new Date(2026, month - 1, day).getDay()),
      );
      const count = segment === "uvis" ? (month === 8 ? 132 : 96) : 44;
      for (let i = 0; i < count; i++) {
        const k = (i * 7) % 20,
          status =
            k < 12
              ? "Concluído"
              : k < 15
                ? "Recusado"
                : k < 17
                  ? "Aprovado"
                  : k === 17
                    ? "Pendente"
                    : k === 18
                      ? "Cancelada"
                      : "Em análise";
        const day = days[i % days.length];
        const regionBucket = (i * 7) % 31;
        archive[segment].push({
          id: `${s ? "AG" : "UV"}-${month}-${String(i + 1).padStart(3, "0")}`,
          name: `${s ? "Talhão" : "Unidade"} ${(i % 12) + 1}`,
          place: `${s ? "Fazenda" : "Rua"} Demonstração ${(i % 12) + 1}, ${((i % 9) + 1) * 100}`,
          date: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/2026`,
          time: `${String(8 + Math.floor(i / days.length)).padStart(2, "0")}:00`,
          status,
          region:
            regions[
              regionBucket < 11
                ? 0
                : regionBucket < 19
                  ? 1
                  : regionBucket < 25
                    ? 2
                    : regionBucket < 29
                      ? 3
                      : 4
            ],
          team: `Equipe ${(i % 4) + 1}`,
          type: s ? "Pulverização" : i % 3 ? "Tratamento" : "Monitoramento",
        });
      }
    });
  });
  const allRecords = () => [...archive[getSegment()], ...getRecords()];
  const inMonth = (month) =>
    allRecords().filter((r) => iso(r).startsWith(month));
  const filteredReports = () =>
    inMonth(period).filter((r) => region === "Todas" || r.region === region);
  const users = [
    "Admin",
    "Coordenadoria",
    "Supervisor",
    "Dev",
    "Operador",
    "Fiscal",
    "Piloto",
    "Financeiro",
    "Regional",
    "Equipe UVIS",
  ].map((name, i) => ({
    id: i + 1,
    name,
    profile: [
      "Administrador",
      "Coordenadoria",
      "Supervisor",
      "Desenvolvedor",
      "Operador",
      "Fiscal",
      "Piloto",
      "Financeiro",
      "Regional",
      "Operacional",
    ][i],
    login: `demo.${name.toLowerCase().replaceAll(" ", ".")}`,
    status: i === 8 ? "Inativo" : "Ativo",
    archived: false,
  }));
  const vehicles = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Veículo ${i + 1}`,
    serial: `DEMO-VEI-${String(i + 1).padStart(3, "0")}`,
    model: ["FIORINO", "MASTER", "STRADA"][i % 3],
    team: i < 3 ? `Equipe ${i + 1}` : "Sem equipe",
    operation: i % 3 ? "AGRO" : "PREFEITURA",
    km: [7500, 0, 18000, 12000, 9500, 26000, 4000, 16000, 3000, 8000][i],
    revision: [
      8700, 10000, 19600, 11600, 10500, 30000, 10000, 20000, 10000, 15000,
    ][i],
    status: "Ativo",
    scheduled: false,
    archived: false,
  }));
  const equipment = [
    ...Array.from({ length: 13 }, (_, i) => ({
      id: i + 1,
      name: `Drone ${i + 1}`,
      type: "Drone",
      model: i % 2 ? "Drone de monitoramento" : "Drone de aplicação",
      serial: `DEMO-DR-${String(i + 1).padStart(3, "0")}`,
      status: i === 5 ? "Em manutenção" : "Ativo",
      date: "14/08/2026",
      archived: false,
    })),
    ...Array.from({ length: 46 }, (_, i) => ({
      id: i + 14,
      name: `Bateria ${i + 1}`,
      type: "Bateria",
      model: "Bateria inteligente",
      serial: `DEMO-BT-${String(i + 1).padStart(3, "0")}`,
      status: i === 2 ? "Em manutenção" : "Ativo",
      date: "12/08/2026",
      archived: false,
    })),
  ];
  const pill = (text, tone = "blue") =>
    `<span class="iv-pill ${tone}">${h(text)}</span>`;
  const table = (headers, rows, cls = "") =>
    `<div class="iv-table-wrap"><table class="iv-table ${cls}"><thead><tr>${headers.map((x) => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map((row) => `<tr>${row.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}" class="iv-empty">Nenhum registro encontrado.</td></tr>`}</tbody></table></div>`;
  const stat = (label, value, color, extra = "") =>
    `<article class="iv-stat" style="--stat-color:${color}"><span>${label}</span><strong>${n(value)}</strong>${extra}</article>`;
  const reportFilters = () =>
    `<details class="demo-filters iv-filters"${region !== "Todas" ? " open" : ""}><summary><span>Filtros de busca</span><i>⌄</i></summary><form data-iv-filter="reports"><label>Período<input type="month" name="period" value="${period}" required></label><label>Região<select name="region">${options(["Todas", ...regions], region)}</select></label><button class="app-action" type="submit">Aplicar filtros</button></form></details>`;
  function chart(kind) {
    const records = filteredReports(),
      total = records.length;
    if (kind === "status") {
      const groups = [
        [
          "Concluídas",
          records.filter((r) => r.status === "Concluído").length,
          "#8a32ff",
        ],
        [
          "Recusadas",
          records.filter((r) => r.status === "Recusado").length,
          "#fa424c",
        ],
        [
          "Aprovadas",
          records.filter((r) => r.status === "Aprovado").length,
          "#329564",
        ],
      ];
      groups.push([
        "Outras",
        total - groups.reduce((sum, r) => sum + r[1], 0),
        "#4b5662",
      ]);
      let offset = 0;
      const stops = groups.map(([, value, color]) => {
        const start = offset;
        offset += total ? (value / total) * 100 : 0;
        return `${color} ${start}% ${offset}%`;
      });
      return `<div class="iv-donut-layout"><div class="iv-donut" role="img" aria-label="Distribuição por status, ${total} solicitações. Os valores estão na legenda." style="background:conic-gradient(${total ? stops.join(",") : "#e3e9ef 0% 100%"})"><div><strong>${n(total)}</strong><span>solicitações</span></div></div><ul class="iv-chart-legend">${groups.map(([name, value, color]) => `<li><i style="background:${color}"></i><span>${name}</span><b>${total ? ((value / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "0"}%</b><small>${value}</small></li>`).join("")}</ul></div>`;
    }
    const values = regions.map((name) => [
        name,
        records.filter((r) => r.region === name).length,
      ]),
      max = Math.max(1, ...values.map((r) => r[1]));
    return `<div class="iv-bars" role="img" aria-label="Solicitações por região: ${values.map((r) => r.join(" ")).join(", ")}">${values.map(([name, value]) => `<div><span>${name}</span><div class="iv-bar-track"><i style="width:${(value / max) * 100}%"></i></div><b>${value}</b></div>`).join("")}</div>`;
  }
  function reports() {
    const rows = filteredReports(),
      labels = [
        "PENDENTES",
        "EM ANÁLISE",
        "APROVADAS",
        "APROVADAS C/ RECOM.",
        "CONCLUÍDAS",
        "RECUSADAS",
        "CANCELADAS",
      ];
    return (
      reportFilters() +
      `<div class="iv-report-heading"><h3>Dados de ${h(monthName(period))}</h3>${btn("▣ Exportar CSV", 'data-iv-export="reports"', "secondary")}</div><div class="iv-stats iv-stats-four">${stat("TOTAL", rows.length, "#326499")}${statuses.map((s, i) => stat(labels[i], rows.filter((r) => r.status === s).length, colors[i])).join("")}</div><div class="iv-charts"><section class="iv-chart-card"><header><h4>◕ Status</h4><span>Período filtrado</span><button type="button" data-iv-chart="status">⛶ Expandir</button></header>${chart("status")}</section><section class="iv-chart-card"><header><h4>⌖ Solicitações por Região</h4><span>Período filtrado</span><button type="button" data-iv-chart="regions">⛶ Expandir</button></header>${chart("regions")}</section></div><section class="iv-section"><h4>Resumo por região</h4>${table(
        ["REGIÃO", "SOLICITAÇÕES", "CONCLUÍDAS", "TAXA DE CONCLUSÃO"],
        regions.map((r) => {
          const items = rows.filter((x) => x.region === r),
            completed = items.filter((x) => x.status === "Concluído").length;
          return [
            h(r),
            n(items.length),
            n(completed),
            pill(
              items.length
                ? `${Math.round((completed / items.length) * 100)}%`
                : "0%",
              "green",
            ),
          ];
        }),
      )}</section>`
    );
  }
  function calendarRows() {
    return inMonth(calendarMonth)
      .filter(
        (r) =>
          r.status !== "Cancelada" &&
          (agendaRegion === "Todas" || r.region === agendaRegion),
      )
      .sort((a, b) => (iso(a) + a.time).localeCompare(iso(b) + b.time));
  }
  function agenda() {
    const records = calendarRows();
    const head = title(
      "Agenda",
      "Planejamento das operações e equipes.",
      btn("◇ Rota do Dia", "data-iv-route", "danger") +
        btn("▣ Exportar Atual", 'data-iv-export="agenda"') +
        btn("↓ Exportar Tudo", 'data-iv-export="all-agenda"', "secondary"),
    );
    const filterMarkup = `<details class="demo-filters iv-filters"${agendaRegion !== "Todas" ? " open" : ""}><summary><span>Filtros de busca</span><i>⌄</i></summary><form data-iv-filter="agenda"><label>Mês<input type="month" name="month" value="${calendarMonth}" required></label><label>Região<select name="region" aria-label="Região">${options(["Todas", ...regions], agendaRegion)}</select></label><button type="submit" class="app-action">Aplicar</button></form></details>`;
    const toolbar = `<div class="iv-calendar-toolbar"><div><button type="button" data-iv-month="-1" aria-label="Mês anterior">‹</button><button type="button" data-iv-month="1" aria-label="Próximo mês">›</button><button type="button" data-iv-today>Hoje</button></div><h4>${h(monthName(calendarMonth))}</h4><div class="iv-mode"><button type="button" data-iv-mode="month" aria-pressed="${calendarMode === "month"}">Mês</button><button type="button" data-iv-mode="list" aria-pressed="${calendarMode === "list"}">Lista</button></div></div>`;
    let body;
    if (calendarMode === "list")
      body = table(
        ["DATA / HORA", "LOCAL", "EQUIPE", "STATUS", ""],
        records.map((r) => [
          `${r.date}<small>${r.time}</small>`,
          `<strong>${h(r.place)}</strong>`,
          h(r.team),
          pill(r.status, r.status === "Concluído" ? "green" : "blue"),
          btn("Ver detalhes", `data-iv-event="${r.id}"`, "outline"),
        ]),
      );
    else {
      const [year, month] = calendarMonth.split("-").map(Number),
        first = new Date(year, month - 1, 1),
        days = new Date(year, month, 0).getDate(),
        cells = Math.ceil((first.getDay() + days) / 7) * 7;
      const weeks = [];
      for (let index = 0; index < cells; index += 7) {
        const week = [];
        for (let column = 0; column < 7; column++) {
          const day = index + column - first.getDay() + 1,
            date = new Date(year, month - 1, day),
            current = day > 0 && day <= days,
            dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
            events = current ? records.filter((r) => iso(r) === dateKey) : [];
          week.push(
            `<td class="${current ? "" : "outside"}"><span class="iv-day">${date.getDate()}</span>${events
              .slice(0, 6)
              .map(
                (r) =>
                  `<button type="button" class="iv-event ${r.status === "Aprovado" ? "approved" : r.status === "Em análise" ? "review" : ""}" data-iv-event="${r.id}" title="${h(r.time + " · " + r.place)}">${h(r.place)}</button>`,
              )
              .join(
                "",
              )}${events.length > 6 ? `<button type="button" class="iv-more" data-iv-day="${dateKey}">+${events.length - 6} operações</button>` : ""}</td>`,
          );
        }
        weeks.push(`<tr>${week.join("")}</tr>`);
      }
      body = `<div class="iv-calendar-scroll"><table class="iv-calendar"><caption class="sr-only">Agenda de ${h(monthName(calendarMonth))}</caption><thead><tr>${["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."].map((d) => `<th scope="col">${d}</th>`).join("")}</tr></thead><tbody>${weeks.join("")}</tbody></table></div>`;
    }
    return (
      head +
      filterMarkup +
      `<section class="iv-calendar-card">${toolbar}${body}<div class="iv-calendar-legend"><span><i></i>Programada / histórico</span><span><i class="approved"></i>Aprovada</span><span><i class="review"></i>Em análise</span><b>${records.length} operações no período</b></div></section>`
    );
  }
  function filtersMarkup(kind, label) {
    return `<details class="demo-filters iv-filters"${queries[kind] || filters[kind] !== "Todos" ? " open" : ""}><summary><span>⚑ Filtros de busca</span><i>⌄</i></summary><form data-iv-filter="${kind}"><label>${label}<input name="query" value="${h(queries[kind])}" placeholder="Digite para buscar"></label><label>Status<select name="status">${options(kind === "users" ? ["Todos", "Ativo", "Inativo", "Excluído"] : ["Todos", "Ativo", "Em manutenção", "Revisão próxima", "Revisão atrasada", "Excluído"], filters[kind])}</select></label><button type="submit" class="app-action">Buscar</button><button type="button" class="app-action outline" data-iv-reset="${kind}">Limpar</button></form></details>`;
  }
  function visibleUsers() {
    return users.filter(
      (r) =>
        (filters.users === "Excluído" ? r.archived : !r.archived) &&
        (filters.users === "Todos" ||
          filters.users === "Excluído" ||
          r.status === filters.users) &&
        `${r.name} ${r.profile} ${r.login}`
          .toLowerCase()
          .includes(queries.users.toLowerCase()),
    );
  }
  function userView() {
    return (
      title(
        "Usuários Cadastrados",
        `Total de registros: <strong>${users.filter((r) => !r.archived).length}</strong>`,
        btn("← Voltar", 'data-view="dashboard"', "outline") +
          btn("▣ Exportar CSV", 'data-iv-export="users"', "secondary") +
          btn("＋ Cadastrar usuário", 'data-iv-create="users"'),
      ) +
      filtersMarkup("users", "Nome, perfil ou login") +
      table(
        ["ID", "NOME", "PERFIL", "STATUS", "LOGIN", "AÇÕES"],
        visibleUsers().map((r) => [
          r.id,
          `<strong>${h(r.name)}</strong>`,
          h(r.profile),
          pill(
            r.archived ? "Excluído" : r.status,
            r.status === "Ativo" ? "blue" : "gray",
          ),
          `<code>${h(r.login)}</code>`,
          `<div class="iv-row-actions">${r.archived ? btn("↶ Restaurar", `data-iv-restore="users:${r.id}"`) : btn("✎ Editar", `data-iv-edit="users:${r.id}"`) + btn("▥ Excluir", `data-iv-archive="users:${r.id}"`, "danger")}</div>`,
        ]),
      )
    );
  }
  function equipmentView() {
    const assets = equipment.filter((r) => !r.archived),
      visible =
        equipmentFilter === "recent"
          ? [
              ...assets.filter((r) => r.type === "Drone").slice(0, 4),
              ...assets.filter((r) => r.type === "Bateria").slice(0, 4),
            ]
          : assets.filter(
              (r) =>
                equipmentFilter === "all" ||
                (equipmentFilter === "maintenance"
                  ? r.status === "Em manutenção"
                  : r.type === equipmentFilter),
            );
    const svg = (body) =>
      `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
    const icons = {
      drone: svg(
        '<path d="m10 10 20 20M10 30 30 10M15 17h10v6H15z"/><circle cx="8" cy="8" r="5"/><circle cx="32" cy="8" r="5"/><circle cx="8" cy="32" r="5"/><circle cx="32" cy="32" r="5"/>',
      ),
      battery: svg(
        '<rect x="3" y="10" width="29" height="21" rx="3"/><path d="M36 17v7M21 5l-8 17h11l-6 14"/>',
      ),
      maintenance: svg(
        '<path d="m10 4 4 9 8 3 7-5-1-7a10 10 0 0 1 7 16l-7 3L14 37a4 4 0 0 1-6-6l14-14M8 33l1-1"/>',
      ),
    };
    return (
      title(
        "Gestão de Equipamentos",
        "Visão geral de hardware e ativos da operação.",
        btn("＋ Novo equipamento", 'data-iv-create="equipment"'),
      ) +
      `<div class="iv-stats iv-equipment-stats">${[
        [
          "DRONES",
          assets.filter((r) => r.type === "Drone").length,
          "#267bff",
          "Drone",
          "Ver frota completa",
          icons.drone,
        ],
        [
          "BATERIAS",
          assets.filter((r) => r.type === "Bateria").length,
          "#efbd13",
          "Bateria",
          "Ver estoque total",
          icons.battery,
        ],
        [
          "EM MANUTENÇÃO",
          assets.filter((r) => r.status === "Em manutenção").length,
          "#fa424c",
          "maintenance",
          "Ver equipamentos parados",
          icons.maintenance,
        ],
      ]
        .map(([label, value, color, filter, text, icon]) =>
          stat(
            label,
            value,
            color,
            `<span class="iv-asset-icon" aria-hidden="true">${icon}</span><button type="button" data-iv-equipment="${filter}">${text} →</button>`,
          ),
        )
        .join(
          "",
        )}</div><section class="iv-section"><div class="iv-section-heading"><h4>◷ ${equipmentFilter === "recent" ? "Atividades Recentes de Cadastro" : equipmentFilter === "maintenance" ? "Equipamentos em manutenção" : "Inventário de equipamentos"}</h4><div>${btn("Todos", 'data-iv-equipment="all"', "outline")}${btn("Recentes", 'data-iv-equipment="recent"', "outline")}</div></div>${table(
        [
          "TIPO",
          "DENOMINAÇÃO / MODELO",
          "Nº DE SÉRIE",
          "STATUS",
          "CADASTRADO EM",
          "",
        ],
        visible.map((r) => [
          `<span class="iv-type-icon">${r.type === "Drone" ? "⌘" : "ϟ"}</span>`,
          `<strong>${h(r.name)}</strong><small>${h(r.model.toUpperCase())}</small>`,
          h(r.serial),
          pill(r.status, r.status === "Ativo" ? "green" : "orange"),
          r.date,
          btn("Detalhes", `data-iv-edit="equipment:${r.id}"`, "outline"),
        ]),
      )}</section>`
    );
  }
  function visibleVehicles() {
    return vehicles.filter(
      (r) =>
        (filters.vehicles === "Excluído" ? r.archived : !r.archived) &&
        `${r.name} ${r.serial} ${r.team}`
          .toLowerCase()
          .includes(queries.vehicles.toLowerCase()) &&
        (filters.vehicles === "Todos" ||
          filters.vehicles === "Excluído" ||
          (filters.vehicles === "Revisão próxima"
            ? r.revision - r.km > 0 && r.revision - r.km <= 1500
            : filters.vehicles === "Revisão atrasada"
              ? r.revision - r.km <= 0
              : r.status === filters.vehicles)),
    );
  }
  function vehicleView() {
    const fleet = vehicles.filter((r) => !r.archived);
    return (
      title(
        "Frota de Veículos",
        "Disponibilidade, equipes e revisões da frota.",
        btn("← Voltar", 'data-view="dashboard"', "outline") +
          btn("＋ Novo Veículo", 'data-iv-create="vehicles"') +
          btn("▣ Exportar", 'data-iv-export="vehicles"', "secondary"),
      ) +
      `<div class="iv-stats iv-stats-four">${stat("FROTA", fleet.length, "#267bff")}${stat("REVISÕES", fleet.filter((r) => r.revision - r.km > 0 && r.revision - r.km <= 1500).length, "#d6ac0c")}${stat("ATRASADOS", fleet.filter((r) => r.revision - r.km <= 0).length, "#fa424c")}${stat("MARCADOS", fleet.filter((r) => r.scheduled).length, "#329564")}</div>` +
      filtersMarkup("vehicles", "Veículo, identificação ou equipe") +
      table(
        [
          "VEÍCULO / IDENTIFICAÇÃO",
          "FROTA / OP.",
          "EQUIPE RESPONSÁVEL",
          "KM ATUAL",
          "KM RESTANTE",
          "ÚLTIMA MOVIMENTAÇÃO",
          "STATUS",
          "AÇÕES",
        ],
        visibleVehicles().map((r) => {
          const remaining = r.revision - r.km;
          return [
            `<strong>${h(r.name)}</strong><small>${h(r.serial)}</small>`,
            `<div class="iv-tag-stack">${pill("PRÓPRIA", "outline")}${pill(r.operation, "outline")}</div>`,
            `<label class="iv-team"><small>${r.team === "Sem equipe" ? "Sem piloto vinculado" : "Piloto " + r.id}</small><select data-iv-team="${r.id}" aria-label="Equipe do veículo ${r.id}">${options(["Sem equipe", "Equipe 1", "Equipe 2", "Equipe 3", "Equipe 4"], r.team)}</select></label>`,
            pill(n(r.km) + " km", "outline"),
            `<strong class="${remaining <= 0 ? "iv-red" : remaining <= 1500 ? "iv-yellow" : "iv-green"}">${n(remaining)} km</strong>`,
            `<strong>${n(Math.max(0, r.km - 100))} → ${n(r.km)} km</strong><small>${r.scheduled ? "Revisão agendada" : "Registro demonstrativo"}<br>30/08/2026 08:00</small>`,
            pill(
              r.archived ? "Excluído" : r.status,
              r.status === "Ativo" ? "green" : "orange",
            ),
            btn(
              r.archived ? "↶" : "⋮",
              `${r.archived ? "data-iv-restore" : "data-iv-edit"}="vehicles:${r.id}" aria-label="${r.archived ? "Restaurar" : "Ações do"} veículo ${r.id}"`,
              "outline",
            ),
          ];
        }),
        "iv-fleet",
      )
    );
  }
  const dialog = document.createElement("dialog");
  dialog.id = "ija-detail-dialog";
  dialog.setAttribute("aria-labelledby", "iv-dialog-title");
  document.body.append(dialog);
  let editKind = null,
    editId = null;
  function modal(name, body, wide = false) {
    dialog.classList.toggle("iv-wide-dialog", wide);
    dialog.classList.toggle(
      "iv-dark",
      document.querySelector("#demo-app").classList.contains("dark"),
    );
    dialog.innerHTML = `<div class="dialog-header"><h2 id="iv-dialog-title">${h(name)}</h2><button type="button" data-iv-close aria-label="Fechar detalhes">✕</button></div>${body}`;
    dialog.showModal();
  }
  function field(label, name, value = "", type = "text", choices = null) {
    return `<label>${label}${choices ? `<select name="${name}" aria-label="${h(label)}">${options(choices, value)}</select>` : `<input name="${name}" type="${type}" value="${h(value)}" ${type === "number" ? 'min="0" step="1"' : 'maxlength="80"'} required>`}</label>`;
  }
  function edit(kind, id) {
    editKind = kind;
    editId = id ? Number(id) : null;
    const list =
        kind === "users" ? users : kind === "vehicles" ? vehicles : equipment,
      r = list.find((x) => x.id === editId) || {};
    let fields;
    if (kind === "users")
      fields =
        field("Nome do usuário", "name", r.name) +
        field("Perfil", "profile", r.profile || "Operador", "text", [
          "Administrador",
          "Coordenadoria",
          "Supervisor",
          "Desenvolvedor",
          "Operador",
          "Fiscal",
          "Piloto",
          "Financeiro",
          "Regional",
          "Operacional",
        ]) +
        field("Login demonstrativo", "login", r.login || "demo.novo") +
        field("Status", "status", r.status || "Ativo", "text", [
          "Ativo",
          "Inativo",
        ]);
    if (kind === "vehicles")
      fields =
        field("Nome do veículo", "name", r.name) +
        field("Identificação", "serial", r.serial || "DEMO-VEI-NOVO") +
        field("Quilometragem atual", "km", r.km ?? 0, "number") +
        field(
          "Próxima revisão (km)",
          "revision",
          r.revision ?? 10000,
          "number",
        ) +
        field("Equipe responsável", "team", r.team || "Sem equipe", "text", [
          "Sem equipe",
          "Equipe 1",
          "Equipe 2",
          "Equipe 3",
          "Equipe 4",
        ]) +
        field("Status", "status", r.status || "Ativo", "text", [
          "Ativo",
          "Em manutenção",
        ]) +
        `<label class="iv-checkbox"><input type="checkbox" name="scheduled"${r.scheduled ? " checked" : ""}> Revisão agendada</label>`;
    if (kind === "equipment")
      fields =
        field("Denominação", "name", r.name) +
        field("Tipo", "type", r.type || "Drone", "text", ["Drone", "Bateria"]) +
        field("Modelo", "model", r.model || "Modelo de demonstração") +
        field("Número de série", "serial", r.serial || "DEMO-NOVO") +
        field("Status", "status", r.status || "Ativo", "text", [
          "Ativo",
          "Em manutenção",
        ]);
    modal(
      `${id ? "Editar" : "Cadastrar"} ${kind === "users" ? "usuário" : kind === "vehicles" ? "veículo" : "equipamento"}`,
      `<form id="iv-edit-form"><div class="iv-form-grid">${fields}</div><p>Alterações locais, somente nesta demonstração.</p><div class="iv-dialog-actions">${id && kind !== "equipment" ? `<button type="button" data-iv-archive="${kind}:${id}" class="iv-danger-button">Excluir registro</button>` : ""}<button type="submit" class="button button-lime">Salvar alterações</button></div></form>`,
    );
  }
  function eventDetails(id) {
    const r = allRecords().find((r) => r.id === id);
    if (!r) return;
    modal(
      "Detalhes da operação",
      `<div class="iv-event-details"><span class="iv-event-id">#${h(r.id)}</span><h3>${h(r.name)}</h3>${pill(r.status)}<dl>${[
        ["Local", r.place],
        ["Data", r.date + " às " + r.time],
        ["Operação", r.type],
        ["Equipe", r.team],
        ["Região", r.region || "OESTE"],
      ]
        .map(([a, b]) => `<div><dt>${a}</dt><dd>${h(b)}</dd></div>`)
        .join(
          "",
        )}</dl><p>Evento fictício para apresentação da agenda.</p></div>`,
    );
  }
  function exportData(kind) {
    let headers, rows;
    if (kind === "users") {
      headers = ["ID", "Nome", "Perfil", "Status", "Login"];
      rows = visibleUsers().map((r) => [
        r.id,
        r.name,
        r.profile,
        r.status,
        r.login,
      ]);
    } else if (kind === "vehicles") {
      headers = [
        "Veículo",
        "Identificação",
        "Equipe",
        "KM atual",
        "KM restante",
        "Status",
      ];
      rows = visibleVehicles().map((r) => [
        r.name,
        r.serial,
        r.team,
        r.km,
        r.revision - r.km,
        r.status,
      ]);
    } else {
      headers = ["ID", "Local", "Data", "Hora", "Equipe", "Status", "Região"];
      rows = (
        kind === "reports"
          ? filteredReports()
          : kind === "all-agenda"
            ? allRecords().filter((r) => r.status !== "Cancelada")
            : calendarRows()
      ).map((r) => [r.id, r.place, r.date, r.time, r.team, r.status, r.region]);
    }
    const cell = (v) =>
        '"' +
        String(v ?? "")
          .replace(/^[=+@-]/, "'$&")
          .replaceAll('"', '""') +
        '"',
      url = URL.createObjectURL(
        new Blob(
          [
            "\uFEFF" +
              [headers, ...rows].map((r) => r.map(cell).join(";")).join("\r\n"),
          ],
          { type: "text/csv;charset=utf-8" },
        ),
      );
    const a = document.createElement("a");
    a.href = url;
    a.download = `ija-${kind}-demonstracao.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`${rows.length} registros de demonstração exportados.`);
  }
  function handleClick(target) {
    const d = target.dataset;
    if (d.ivChart) {
      modal(
        d.ivChart === "status"
          ? "Distribuição por status"
          : "Solicitações por região",
        `<p class="iv-modal-period">${h(monthName(period))} · ${h(region)}</p>` +
          chart(d.ivChart),
        true,
      );
    } else if (d.ivMonth) {
      const [y, m] = calendarMonth.split("-").map(Number),
        date = new Date(y, m - 1 + Number(d.ivMonth), 1);
      calendarMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      render();
    } else if (target.hasAttribute("data-iv-today")) {
      const date = new Date();
      calendarMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      render();
    } else if (d.ivMode) {
      calendarMode = d.ivMode;
      render();
    } else if (d.ivEvent) {
      eventDetails(d.ivEvent);
    } else if (d.ivDay) {
      const rows = calendarRows().filter((r) => iso(r) === d.ivDay);
      modal(
        "Operações do dia",
        table(
          ["HORÁRIO", "LOCAL", "EQUIPE"],
          rows.map((r) => [r.time, h(r.place), h(r.team)]),
        ),
        true,
      );
    } else if (target.hasAttribute("data-iv-route")) {
      const today = new Date().toLocaleDateString("pt-BR"),
        rows = allRecords()
          .filter((r) => r.date === today && r.status !== "Cancelada")
          .sort((a, b) => a.time.localeCompare(b.time));
      modal(
        "Rota do dia · " + today,
        table(
          ["ORDEM", "HORÁRIO", "LOCAL"],
          rows.map((r, i) => [i + 1, r.time, h(r.place)]),
        ) +
          `<p class="iv-modal-period">Sequência ilustrativa por horário, sem navegação ou otimização de trajetos.</p>`,
        true,
      );
    } else if (d.ivEquipment) {
      equipmentFilter = d.ivEquipment;
      render();
    } else if (d.ivReset) {
      queries[d.ivReset] = "";
      filters[d.ivReset] = "Todos";
      render();
    } else if (d.ivCreate) {
      edit(d.ivCreate);
    } else if (d.ivEdit) {
      edit(...d.ivEdit.split(":"));
    } else if (d.ivArchive || d.ivRestore) {
      const [kind, id] = (d.ivArchive || d.ivRestore).split(":"),
        list = kind === "users" ? users : vehicles;
      list.find((r) => r.id === Number(id)).archived = !!d.ivArchive;
      if (dialog.open) dialog.close();
      render();
      toast(
        d.ivArchive
          ? "Registro movido para Excluídos. Use o filtro para restaurá-lo."
          : "Registro restaurado.",
      );
    } else if (d.ivExport) {
      exportData(d.ivExport);
    } else return false;
    return true;
  }
  dialog.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.hasAttribute("data-iv-close")) dialog.close();
    else handleClick(target);
  });
  dialog.addEventListener("submit", (event) => {
    if (event.target.id !== "iv-edit-form") return;
    event.preventDefault();
    const values = new FormData(event.target),
      list =
        editKind === "users"
          ? users
          : editKind === "vehicles"
            ? vehicles
            : equipment;
    let r = list.find((x) => x.id === editId);
    if (!r) {
      r = {
        id: Math.max(...list.map((x) => x.id)) + 1,
        archived: false,
        operation: "PREFEITURA",
        date: "30/09/2026",
      };
      list.unshift(r);
    }
    for (const [key, value] of values) {
      r[key] = ["km", "revision"].includes(key)
        ? Number(value)
        : String(value).trim();
    }
    if (editKind === "vehicles") r.scheduled = values.has("scheduled");
    dialog.close();
    render();
    toast("Registro atualizado na demonstração.");
  });
  return {
    render(view) {
      return view === "reports"
        ? reports()
        : view === "agenda"
          ? agenda()
          : view === "users"
            ? userView()
            : view === "equipment"
              ? equipmentView()
              : view === "vehicles"
                ? vehicleView()
                : null;
    },
    handleClick,
    handleChange(target) {
      if (!target.dataset.ivTeam) return false;
      vehicles.find((r) => r.id === Number(target.dataset.ivTeam)).team =
        target.value;
      render();
      toast("Equipe responsável atualizada.");
      return true;
    },
    handleSubmit(event) {
      const kind = event.target.dataset.ivFilter;
      if (!kind) return false;
      event.preventDefault();
      const values = new FormData(event.target);
      if (kind === "reports") {
        period = values.get("period");
        region = values.get("region");
      } else if (kind === "agenda") {
        calendarMonth = values.get("month");
        agendaRegion = values.get("region");
      } else {
        queries[kind] = values.get("query").trim();
        filters[kind] = values.get("status");
      }
      render();
      return true;
    },
  };
};

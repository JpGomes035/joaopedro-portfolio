"use strict";
(() => {
  const modules = {
    painel: {
      title: "Painel geral",
      kicker: "VISÃO GERAL",
      headline: "Uma leitura clara da operação.",
      description:
        "Entradas, saídas, contas recebidas e pagas, pedidos e saldo final. O painel reúne informações para acompanhar a movimentação do negócio.",
      points: [
        "Resumo das movimentações financeiras",
        "Acesso a backups e arquivos XML",
        "Indicadores reunidos em uma tela",
      ],
      image: "painel.png",
    },
    pedidos: {
      title: "Pedidos de compra e venda",
      kicker: "COMERCIAL & ESTOQUE",
      headline: "Cada pedido conecta uma etapa.",
      description:
        "Pedidos de compra e venda com produtos, valores e vínculo com clientes ou fornecedores. O fluxo pode movimentar o estoque e os valores da conta cadastrada.",
      points: [
        "Compra e venda no mesmo ambiente",
        "Entrada e saída de produtos",
        "Confirmação por e-mail e comprovantes",
      ],
      image: "pedido.png",
    },
    pdv: {
      title: "Ponto de venda",
      kicker: "FRENTE DE CAIXA",
      headline: "Uma venda. Várias conexões.",
      description:
        "Uma interface para buscar produtos, montar a venda, selecionar o cliente e a forma de pagamento. Com descontos, atalhos e acompanhamento do caixa.",
      points: [
        "Busca por nome ou código de barras",
        "Diferentes formas de pagamento",
        "Vendas conectadas ao estoque e financeiro",
      ],
      image: "pdv.png",
    },
    agenda: {
      title: "Agenda",
      kicker: "PLANEJAMENTO",
      headline: "O que precisa acontecer, à vista.",
      description:
        "Compromissos e pendências organizados em um calendário. Uma forma visual de acompanhar a programação e consultar os próximos eventos.",
      points: [
        "Visualização de calendário",
        "Organização de compromissos",
        "Módulo também desenvolvido separadamente",
      ],
      image: "agendanew.png",
    },
    relatorios: {
      title: "Relatórios",
      kicker: "INFORMAÇÃO & ANÁLISE",
      headline: "Informações que saem do sistema.",
      description:
        "Relatórios para consultar a operação e exportar informações para Excel. Os dados também podem ser compartilhados em comprovantes personalizados.",
      points: [
        "Relatórios detalhados",
        "Exportação para Excel",
        "Consulta e acompanhamento dos registros",
      ],
      image: "relatorio.png",
    },
    chat: {
      title: "Chat interno",
      kicker: "COMUNICAÇÃO",
      headline: "As pessoas também estão conectadas.",
      description:
        "Comunicação entre os usuários dentro do sistema, com envio de arquivos. Complementada pelos recursos de e-mail e histórico das mensagens enviadas.",
      points: [
        "Chat entre usuários",
        "Compartilhamento de arquivos",
        "E-mails e confirmações pelo sistema",
      ],
      image: "chat.png",
    },
  };
  const tabs = [...document.querySelectorAll("[data-module]")];
  function selectModule(key, focus = false) {
    const item = modules[key];
    if (!item) return;
    tabs.forEach((tab) => {
      const selected = tab.dataset.module === key;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    document
      .querySelector("#module-panel")
      .setAttribute("aria-labelledby", "tab-" + key);
    document.querySelector("#module-kicker").textContent = item.kicker;
    document.querySelector("#module-title").textContent = item.headline;
    document.querySelector("#module-description").textContent =
      item.description;
    document.querySelector("#module-points").replaceChildren(
      ...item.points.map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      }),
    );
    const image = document.querySelector("#module-image"),
      zoom = document.querySelector("#module-zoom");
    image.src = "img2/" + item.image;
    image.alt = item.title + " — interface original do ProControl";
    zoom.dataset.image = image.getAttribute("src");
    zoom.dataset.title = item.title;
    zoom.setAttribute("aria-label", "Ampliar tela: " + item.title);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectModule(tab.dataset.module));
    tab.addEventListener("keydown", (event) => {
      const keys = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      if (event.key in keys) {
        event.preventDefault();
        selectModule(tabs[keys[event.key]].dataset.module, true);
      }
    });
  });
  document
    .querySelectorAll("[data-module-link]")
    .forEach((link) =>
      link.addEventListener("click", () =>
        selectModule(link.dataset.moduleLink),
      ),
    );
  const dialog = document.querySelector("#image-dialog");
  document.querySelectorAll("[data-image]").forEach((button) =>
    button.addEventListener("click", () => {
      document.querySelector("#image-title").textContent = button.dataset.title;
      const image = document.querySelector("#expanded-image");
      image.src = button.dataset.image;
      image.alt = button.dataset.title + " — captura original do ProControl";
      dialog.showModal();
    }),
  );
  document
    .querySelector("#close-image")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  });
  const toggle = document.querySelector(".menu-button"),
    nav = document.querySelector("#site-nav");
  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", String(nav.classList.toggle("open")));
  });
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });
  document.querySelector("#year").textContent = new Date().getFullYear();
})();

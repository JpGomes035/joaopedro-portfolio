"use strict";

// Editorial walkthroughs: isolated from the live, in-memory IJA demo.
(() => {
  const dialog = document.querySelector('#project-story-dialog');
  if (!dialog) return;
  const $ = selector => dialog.querySelector(selector);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coauthor = 'Pedro Henrique Cruz Vilas Bôas';
  const coauthorURL = 'https://pedro-cruzz.github.io/portfolio_dev/';
  const step = (title, description, points, image, caption) => ({title,description,points,image,caption});
  const demoCaption = 'Captura da demonstração local · dados fictícios · sem acesso à produção.';
  const tour = {
    title: 'Do pedido ao relatório.', kicker: 'IJA SYSTEM / TOUR GUIADO',
    intro: 'Quatro momentos de uma operação conectada. Avance no seu ritmo ou reproduza a sequência de 30 segundos.',
    tag: '04 etapas · dados ilustrativos', labels: ['Solicitação','Agenda','Equipe','Relatórios'],
    credit: 'Desenvolvimento do IJA System em coautoria com ', collaborative: true,
    url: '#mockup-ija', link: 'Explorar a demonstração interativa',
    steps: [
      step('Tudo começa com uma demanda.','A solicitação reúne as informações necessárias para entender o atendimento. Local, tipo de visita e situação ficam no mesmo contexto.', ['Dados da solicitação organizados em uma ficha.','Status para acompanhar o andamento.','Minha atuação: regras de negócio, dados e interfaces.'], 'assets/tour-dashboard.jpg', demoCaption),
      step('Da demanda ao planejamento.','A agenda coloca a operação no tempo. A equipe pode consultar os atendimentos e organizar o que precisa acontecer em cada dia.', ['Visão de calendário e consulta em lista.','Filtros para localizar as atividades.','Minha atuação: conectar o fluxo operacional à interface.'], 'assets/tour-agenda.jpg', demoCaption),
      step('Pessoas e recursos, no mesmo fluxo.','Pilotos, equipes e ativos fazem parte da execução. O sistema reúne os cadastros que dão apoio à organização do trabalho em campo.', ['Gestão de pilotos e equipes.','Drones, baterias e veículos como ativos operacionais.','Minha atuação: cadastros, integrações e manutenção evolutiva.'], 'assets/tour-pilots.jpg', demoCaption),
      step('O trabalho também precisa ser acompanhado.','Indicadores, histórico e relatórios ajudam a consultar o que foi solicitado e como as operações estão distribuídas.', ['Indicadores por situação e visualizações por região.','Filtros e exportação de informações.','Minha atuação: consultas, relatórios e apresentação dos dados.'], 'assets/tour-reports.jpg', demoCaption),
    ],
  };
  const projects = {
    ija: {
      title:'IJA System', tag:'Python · Flask · PostgreSQL · JavaScript',
      intro:'Uma plataforma construída em torno da operação — não apenas de telas isoladas.',
      credit:'Coautoria com ', collaborative:true, url:'ija-system.html', link:'Ler a documentação do sistema',
      steps:[
        step('Conectar quem solicita a quem executa.','O desafio apresentado no projeto é reunir demandas, execução em campo e prestação de contas, reduzindo a dependência de planilhas e informações dispersas.', ['Solicitações, equipes, pilotos e recursos operacionais.','Operações de prefeitura/UVIS e agro.','Minha atuação: desenvolvimento e evolução da plataforma.'],'assets/tour-dashboard.jpg',demoCaption),
        step('O fluxo orienta a construção.','Regras de negócio, banco de dados e interface precisam conversar. A estrutura apresentada na documentação organiza essas responsabilidades e as integrações do sistema.', ['Python e Flask na aplicação; PostgreSQL nos dados.','Perfis de acesso e organização das regras de negócio.','JavaScript e Jinja2 na apresentação; relatórios e integrações.'],'assets/tour-agenda.jpg',demoCaption),
        step('Informação que pode ser consultada.','Painéis, mapas, agenda e relatórios são diferentes leituras da operação. O portfólio apresenta um mockup independente para explorar parte dessas interfaces.', ['Demonstração com dados fictícios, sem autenticação real.','Coautoria de João Pedro Gomes e Pedro Henrique.','Registro de software INPI BR 51 2026 007433-9; titular: IJA Drones Brasil Ltda. – ME.'],'assets/tour-reports.jpg',demoCaption),
      ],
    },
    procontrol: {
      title:'ProControl', tag:'PHP · MySQL · JavaScript · Bootstrap',
      intro:'Meu projeto pessoal para conectar as rotinas de uma empresa em um ambiente de gestão.',
      credit:'Projeto pessoal de João Pedro Gomes.', url:'Site/index.html', link:'Explorar os módulos do ProControl',
      steps:[
        step('Olhar para a rotina inteira.','Estoque, vendas, financeiro e comunicação fazem parte da mesma operação. O ProControl reúne essas frentes em módulos de um sistema de gestão.', ['Clientes, fornecedores e produtos.','Pedidos, frente de caixa e movimentações financeiras.','Comunicação e relatórios como parte do trabalho diário.'],'home.jpg','Tela original do projeto ProControl.'),
        step('Módulos conectados por dados.','O projeto utiliza PHP e MySQL, com JavaScript na interface. A organização por módulos permite apresentar cada rotina no seu próprio contexto.', ['Cadastros e movimentações de estoque.','Pedidos e PDV integrados à gestão.','Relatórios, e-mails e armazenamento de XML.'],'Site/img2/listaproduto.png','Interface original de produtos do ProControl.'),
        step('Do painel aos detalhes.','A apresentação do projeto permite conhecer as telas originais e navegar pelos módulos, sem depender de uma sessão no sistema.', ['Painel geral, pedidos, PDV e relatórios.','Agenda e comunicação interna.','Capturas ampliáveis na página do projeto.'],'Site/img2/painel.png','Painel original do ProControl.'),
      ],
    },
    chat: {
      title:'Comunicação no ProControl', tag:'PHP · MySQL · JavaScript',
      intro:'Uma parte do ProControl dedicada às conversas entre usuários, grupos e setores.',
      credit:'Módulo do projeto pessoal ProControl, de João Pedro Gomes.',url:'Site/index.html',link:'Conhecer o ProControl completo',
      steps:[
        step('A conversa faz parte da operação.','O módulo reúne a comunicação interna no ambiente de trabalho, com acesso a usuários e conversas por grupo.', ['Contato entre usuários do sistema.','Organização por setores.','Histórico para consultar depois.'],'Site/img2/chat.png','Captura original do módulo de comunicação.'),
        step('Comunicação integrada ao sistema.','PHP, MySQL e JavaScript compõem a base técnica apresentada para o módulo, que faz parte do ecossistema ProControl.', ['Conversas individuais e em grupo.','Envio de arquivos no fluxo de comunicação.','Uma interface integrada às demais rotinas do projeto.'],'Site/img2/chat.png','Captura original do módulo de comunicação.'),
        step('Uma interface orientada à conversa.','A tela combina a seleção de usuários e setores com o espaço das mensagens, mantendo esses elementos no mesmo contexto.', ['Lista de usuários ao lado da conversa.','Acesso a chat em grupo.','Campo de mensagem e envio de arquivo.'],'Site/img2/chat.png','Captura original do módulo de comunicação.'),
      ],
    },
  };
  for (const [id,name,image,url,scope] of [
    ['ija-site','IJA Drones','assets/project-ija-website.jpg','https://www.ijadrones.com.br/','pulverização agrícola, mapeamento e gestão digital de missões'],
    ['oceano','Oceano Azul Drones','assets/project-oceano-website.jpg','https://www.oceanoazuldrones.com.br/','agricultura, cidades, energia e infraestrutura'],
  ]) projects[id] = {
    title:name, tag:'Site institucional · desenvolvimento colaborativo',
    intro:'Apresentação digital da empresa e de suas soluções com drones.',
    credit:'Participei do desenvolvimento em colaboração com ',collaborative:true,url,link:'Visitar o site da empresa',
    steps:[
      step('Apresentar uma atuação especializada.','O site reúne a apresentação da empresa e suas soluções em '+scope+'.', ['Informações sobre serviços e áreas de atuação.','Imagens e conteúdo institucional.','Canais de contato para continuar a conversa.'],image,'Captura da página pública · referência de outubro de 2026.'),
      step('Um projeto construído em colaboração.','Minha participação no desenvolvimento aconteceu junto de Pedro Henrique Cruz Vilas Bôas. Os créditos aqui refletem esse trabalho compartilhado.', ['Desenvolvimento colaborativo do site institucional.','Apresentação dos serviços e da atuação da empresa.','Este portfólio não atribui resultados comerciais ao site.'],image,'Captura da página pública · referência de outubro de 2026.'),
      step('Do primeiro olhar aos serviços.','A página pública permite conhecer as soluções da empresa e encontrar seus canais de contato. A imagem ao lado é uma prévia estática.', ['Prévia visual do projeto entregue.','Acesso ao site oficial em uma nova aba.','Crédito de colaboração preservado.'],image,'Captura da página pública · referência de outubro de 2026.'),
    ],
  };
  let active = tour, mode = 'tour', index = 0, timer = null, opener = null;
  const tabs = $('.story-steps'), status = $('.story-status'), play = $('.story-play');
  function pause(announce = false) {
    clearTimeout(timer); timer = null;
    play.setAttribute('aria-pressed','false'); play.textContent = 'Reproduzir tour · 30s';
    if (announce) status.textContent = 'Tour pausado. Continue no seu ritmo.';
  }
  function render(announce = true) {
    const current = active.steps[index];
    $('#story-counter').textContent = String(index+1).padStart(2,'0')+' / '+String(active.steps.length).padStart(2,'0');
    $('#story-section-title').textContent = current.title;
    $('#story-description').textContent = current.description;
    $('#story-points').replaceChildren(...current.points.map(text => {const li=document.createElement('li');li.textContent=text;return li;}));
    $('#story-image').src = current.image; $('#story-image').alt = current.caption+' '+current.title;
    $('#story-caption').textContent = current.caption;
    $('#story-screen-label').textContent = mode==='tour'?'IJA SYSTEM / '+active.labels[index].toUpperCase():active.title;
    [...tabs.children].forEach((button,i) => {button.setAttribute('aria-current',i===index?'step':'false');});
    $('.story-prev').disabled = index===0;
    $('.story-next').textContent = index===active.steps.length-1?'Voltar ao início':'Próxima etapa';
    if (announce) status.textContent = 'Etapa '+(index+1)+' de '+active.steps.length+': '+current.title;
  }
  function open(project, isTour, trigger) {
    pause(); active=project; mode=isTour?'tour':'case'; index=0; opener=trigger;
    $('#story-kicker').textContent = isTour?tour.kicker:'BASTIDORES / PROJETO';
    $('#story-title').textContent = project.title; $('#story-intro').textContent=project.intro; $('#story-tag').textContent=project.tag;
    tabs.replaceChildren(...(isTour?project.labels:['Contexto','Construção','Interface']).map((label,i)=>{
      const button=document.createElement('button');button.type='button';button.textContent=String(i+1).padStart(2,'0')+' / '+label;
      button.addEventListener('click',()=>{pause();index=i;render();});return button;
    }));
    $('#story-credit').textContent=project.credit;
    if(project.collaborative){const link=document.createElement('a');link.href=coauthorURL;link.target='_blank';link.rel='noopener noreferrer';link.textContent=coauthor;link.setAttribute('aria-label',coauthor+' — portfólio em nova aba');$('#story-credit').append(link);}
    const destination=$('#story-destination');destination.href=project.url;destination.textContent=project.link;
    if(project.url.startsWith('https:')){destination.target='_blank';destination.rel='noopener noreferrer';destination.textContent+=' (nova aba)';}else{destination.removeAttribute('target');destination.removeAttribute('rel');}
    play.hidden=!isTour;play.disabled=reducedMotion.matches;
    status.textContent=isTour?(reducedMotion.matches?'Movimento reduzido: avance manualmente, no seu ritmo.':'Tour pronto. Avance manualmente ou reproduza por 30 segundos.'):'Escolha uma etapa para conhecer o projeto.';
    render(false);dialog.showModal();dialog.scrollTop=0;document.body.classList.add('project-story-open');
  }
  function schedule() {
    timer=setTimeout(()=>{
      if(!dialog.open || document.hidden){pause();return;}
      if(index===active.steps.length-1){pause();status.textContent='Tour concluído. Explore a demonstração ou reveja as etapas.';return;}
      index++;render();schedule();
    },7500);
  }
  document.querySelectorAll('[data-project-tour]').forEach(button=>button.addEventListener('click',()=>open(tour,true,button)));
  document.querySelectorAll('[data-project-story]').forEach(button=>button.addEventListener('click',()=>{const project=projects[button.dataset.projectStory];if(project)open(project,false,button);}));
  $('.story-close').addEventListener('click',()=>dialog.close());
  $('.story-prev').addEventListener('click',()=>{pause();index=Math.max(0,index-1);render();});
  $('.story-next').addEventListener('click',()=>{pause();index=(index+1)%active.steps.length;render();});
  play.addEventListener('click',()=>{
    if(timer){pause(true);return;}
    if(reducedMotion.matches)return;
    index=0;render();play.setAttribute('aria-pressed','true');play.textContent='Pausar tour';schedule();
  });
  dialog.addEventListener('close',()=>{pause();document.body.classList.remove('project-story-open');opener?.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  $('#story-destination').addEventListener('click',()=>{if(active.url.startsWith('#'))dialog.close();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && timer)pause(true);});
  reducedMotion.addEventListener('change',()=>{pause();play.disabled=reducedMotion.matches;if(dialog.open&&mode==='tour'&&reducedMotion.matches)status.textContent='Movimento reduzido: avance manualmente, no seu ritmo.';});
})();

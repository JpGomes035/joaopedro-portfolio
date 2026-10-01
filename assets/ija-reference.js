"use strict";

// Structure audited against Ija-System/app/templates. Fictional, in-memory data only.
window.createIjaReferenceViews = function(ctx) {
  const {html:h, options, button:btn, title, toast, render, getSegment, getRecords} = ctx;
  const svg = paths => `<svg class="ir-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icon = svg('<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"/>');
  const badge = (text,color='blue')=>`<span class="ir-badge ${color}">${h(text)}</span>`;
  const configs = {
    pilots:{title:'Pilotos',newLabel:'Novo Piloto',columns:[['id','ID'],['name','Nome'],['region','Região'],['phone','Telefone']],fields:[['name','Nome'],['region','Região principal'],['phone','Telefone']],subtitle:'Pilotos e regiões de atendimento.'},
    clients:{title:'Clientes',newLabel:'Novo Cliente',columns:[['id','ID'],['name','Nome'],['document','Documento'],['email','Contato / E-mail'],['phone','Telefone'],['address','Endereço']],fields:[['name','Nome'],['document','Documento'],['email','E-mail'],['phone','Telefone'],['address','Endereço']]},
    suppliers:{title:'Fornecedores do Agro',newLabel:'Novo Fornecedor',columns:[['id','ID'],['name','Fornecedor'],['document','Documento'],['address','Endereço']],fields:[['name','Fornecedor'],['document','Documento'],['address','Endereço']]},
    quotes:{title:'Orçamentos do Agro',newLabel:'Novo Orçamento',columns:[['name','Cliente'],['operation','Operação'],['total','Total calculado'],['date','Criado em'],['files','Arquivos']],fields:[['name','Cliente'],['operation','Operação'],['total','Total demonstrativo'],['date','Criado em']]},
    contracts:{title:'Contratos Agro',newLabel:'Novo Contrato',columns:[['name','Contrato'],['operation','Operação'],['commercial','Comercial'],['status','Fluxo']],fields:[['name','Contrato'],['operation','Operação'],['commercial','Condição comercial'],['status','Fluxo']]},
    operations:{title:'Ordens de Serviço do Agro',newLabel:'Nova OS',columns:[['id','OS'],['name','Contrato'],['type','Aplicação'],['team','Equipe / Pilotos'],['status','Relatório']],fields:[['name','Contrato / propriedade'],['type','Aplicação'],['team','Equipe'],['status','Status']]},
  };
  const stores = {}, searches={}, regions={}, archives={};
  for(const segment of ['uvis','agro']) {
    stores[segment]={
      pilots:Array.from({length:6},(_,i)=>({id:String(i+1),name:'Piloto Demonstração '+(i+1),region:['NORTE','SUL','LESTE','OESTE'][i%4],phone:'Não informado',alternative:i%2?'':'CENTRO'})),
      clients:Array.from({length:4},(_,i)=>({id:String(i+1),name:`Cliente Exemplo ${i+1}`,document:'DEMO-CLI-00'+(i+1),email:`cliente${i+1}@example.com`,phone:'Não informado',address:'Endereço demonstrativo · sem localização real'})),
      suppliers:Array.from({length:3},(_,i)=>({id:String(i+1),name:'Fornecedor Exemplo '+(i+1),document:'DEMO-FOR-00'+(i+1),address:'Endereço demonstrativo'})),
      quotes:[{id:'1',name:'Cliente Exemplo 1',operation:'Pulverização · 24 ha',total:'R$ 4.800,00',date:'30/09/2026',files:'Proposta demonstrativa'},{id:'2',name:'Cliente Exemplo 2',operation:'Mapeamento · 16 ha',total:'R$ 3.200,00',date:'29/09/2026',files:'Nenhum arquivo'}],
      contracts:[{id:'1',name:'CT-DEMO-001',operation:'Pulverização · Fazenda Exemplo',commercial:'Pagamento demonstrativo',status:'Aguardando planejamento'},{id:'2',name:'CT-DEMO-002',operation:'Mapeamento · Área Exemplo',commercial:'Condição de exemplo',status:'Aprovado'}],
    };
  }
  const notes=[{id:'1',name:'Nova solicitação para análise',text:'Unidade de demonstração enviou uma solicitação.',date:'30/09/2026 09:00',read:false},{id:'2',name:'Alerta automático: revisão de veículo',text:'Um veículo demonstrativo está próximo da revisão. Consulte a frota.',date:'30/09/2026 08:30',read:false}];
  const key = kind=>getSegment()+':'+kind;
  const rows = kind=>kind==='operations'?getRecords():stores[getSegment()][kind];
  const visible = kind=>(rows(kind)||[]).filter(r=>Boolean(r.archived)===Boolean(archives[key(kind)]) && Object.values(r).join(' ').toLowerCase().includes((searches[key(kind)]||'').toLowerCase()) && (!regions[key(kind)]||r.region===regions[key(kind)]));
  function table(columns, body) {
    return `<div class="ir-table-wrap"><table class="ir-table"><thead><tr>${columns.map(([,label])=>`<th scope="col">${h(label)}</th>`).join('')}</tr></thead><tbody>${body.length?body.map(row=>`<tr>${row.map((value,i)=>`<td data-label="${h(columns[i][1])}">${value}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${columns.length}" class="ir-empty">Nenhum registro encontrado.</td></tr>`}</tbody></table></div>`;
  }
  function filters(kind) {
    return `<details class="demo-filters ir-filters"${searches[key(kind)]||regions[key(kind)]?' open':''}><summary><span>Filtros de busca</span><i aria-hidden="true">⌄</i></summary><form data-ir-filter="${kind}"><label>Busca geral<input name="q" value="${h(searches[key(kind)]||'')}" placeholder="Nome, identificação ou operação"></label>${kind==='pilots'?`<label>Região<select name="region">${options(['Todas','NORTE','SUL','LESTE','OESTE','CENTRO'],regions[key(kind)]||'Todas')}</select></label>`:''}<button type="submit" class="app-action secondary">Filtrar</button>${btn('Limpar',`data-ir-clear="${kind}"`,'outline')}</form></details>`;
  }
  function list(kind) {
    const config=configs[kind], agro=getSegment()==='agro';
    const columns=kind==='clients'&&agro?[['id','ID'],['name','Cliente'],['document','Documento'],['address','Endereço']]:config.columns;
    return title(kind==='clients'&&agro?'Clientes do Agro':config.title,`Total de registros: <strong>${rows(kind).filter(r=>!r.archived).length}</strong> · dados fictícios`,btn('Voltar','data-view="dashboard"','outline')+btn('Exportar CSV',`data-ir-export="${kind}"`,'secondary')+btn('+ '+config.newLabel,`data-ir-create="${kind}"`))+filters(kind)+table([...columns,['actions','Ações']],visible(kind).map(r=>[...columns.map(([field])=>{
      if(field==='id')return '#'+h(r.id);
      if(field==='name')return `<strong>${h(r.name)}</strong>`;
      if(field==='region')return `<div class="ir-region-tags">${badge('Principal: '+r.region)}${r.alternative?badge('Alternativa: '+r.alternative,'outline'):''}</div>`;
      if(field==='status')return badge(r.status,r.status==='Aprovado'?'green':'blue');
      if(field==='email')return `<span class="ir-contact">${h(r[field])}</span>`;
      return h(r[field]||'—');
    }),`<div class="ir-actions">${r.archived?btn('Restaurar',`data-ir-restore="${kind}:${r.id}"`):btn('Editar',`data-ir-edit="${kind}:${r.id}"`)+btn('Excluir',`data-ir-archive="${kind}:${r.id}"`,'danger')}</div>`]))+`<div class="ir-list-footer"><span>${visible(kind).length} registro(s) nesta visualização</span>${btn(archives[key(kind)]?'Ver ativos':'Ver excluídos',`data-ir-archives="${kind}"`,'outline')}</div>`;
  }
  function history() {
    const items=getRecords().filter(r=>Object.values(r).join(' ').toLowerCase().includes((searches[key('history')]||'').toLowerCase()));
    return title('Histórico de OS','Consulta de ordens de serviço · registros fictícios',btn('Exportar CSV','data-ir-export="history"','secondary'))+filters('history')+table([['id','OS'],['name','Unidade'],['type','Operação'],['team','Equipe'],['status','Status'],['application','Situação da aplicação'],['actions','Ação']],items.map(r=>['#'+h(r.id),`<strong>${h(r.name)}</strong>`,h(r.type),h(r.team),badge(r.status),badge(r.status==='Concluído'?'Realizada':'Aguardando',r.status==='Concluído'?'green':'outline'),btn('Detalhes',`data-ir-history="${r.id}"`,'outline')]));
  }
  function notifications() {
    return title('Notificações','Alertas e atualizações da operação · demonstração',btn('Marcar como lidas','data-ir-read="all"','outline'))+`<section class="ir-notifications"><p class="ir-notice">Alertas automáticos podem reaparecer enquanto a pendência continuar ativa. Nesta demonstração, as alterações são apenas locais.</p>${notes.map(n=>`<article class="ir-notification ${n.read?'is-read':''}"><div class="ir-notice-icon">${icon}</div><div><h4>${h(n.name)} ${n.read?'':badge('Nova','red')}</h4><p>${h(n.text)}</p><small>${n.date}</small></div>${btn(n.read?'Marcar não lida':'Marcar lida',`data-ir-read="${n.id}"`,'outline')}</article>`).join('')}</section>`;
  }
  function finance() {
    const shortcuts=[['Contas','Visão central das contas a pagar e receber.'],['Contas a receber','Consulta dos recebimentos previstos.'],['Contas a pagar','Consulta das obrigações da operação.'],['Recebíveis','Fluxo dos registros financeiros.'],['Nova entrada manual','Registrar uma movimentação de entrada.'],['Nova saída manual','Registrar uma movimentação de saída.'],['Conciliação bancária','Comparação das movimentações.'],['Bancos Agro','Organização das contas bancárias.']];
    return title('Painel Financeiro Agro','Acesso focado no caixa, recebíveis e lançamentos manuais do Agro.',btn('Voltar','data-view="dashboard"','outline'))+`<div class="iv-stats iv-stats-four">${[['Recebíveis','3'],['Entradas manuais','2'],['Saídas manuais','1'],['Bancos Agro','1']].map(([label,value])=>`<div class="iv-stat" style="--stat-color:var(--app-blue)"><span>${label}</span><strong>${value}</strong><small>Dados demonstrativos</small></div>`).join('')}</div><div class="ir-finance-layout"><section class="ir-panel"><h4>Atalhos do financeiro</h4><p>Os acessos operacionais ficam centralizados aqui.</p><div class="ir-shortcuts">${shortcuts.map(([label,copy],i)=>`<button type="button" data-ir-finance="${i}"><strong>${h(label)}</strong><span>${h(copy)}</span></button>`).join('')}</div></section><section class="ir-panel"><h4>Caixa de hoje</h4><small>Movimentações fictícias · 30/09/2026</small><dl><dt>Entradas</dt><dd>R$ 4.800,00</dd><dt>Saídas</dt><dd>R$ 1.200,00</dd><dt>Saldo demonstrativo</dt><dd>R$ 3.600,00</dd></dl></section></div>`;
  }
  function maps() {
    const items=getRecords().filter(r=>r.status!=='Cancelada');
    return title('Inteligência Geográfica','Prévia esquemática · sem mapa real, GPS ou conexão de rastreamento.')+`<section class="ir-panel"><h4>Densidade de Focos</h4><p>Os marcadores abaixo representam apenas as solicitações fictícias desta demonstração.</p><div class="ir-map" role="group" aria-label="Esquema ilustrativo das localizações">${items.map((r,i)=>`<button type="button" data-ir-history="${r.id}" style="left:${20+(i%3)*25}%;top:${20+(Math.floor(i/3)%3)*25}%" aria-label="Ver solicitação ${h(r.id)}">${svg('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>')}<span>#${h(r.id)}</span></button>`).join('')}<span class="ir-map-label">ESQUEMA DEMONSTRATIVO · NÃO É UM MAPA REAL</span></div></section>`;
  }
  const dialog=document.createElement('dialog');dialog.id='ija-reference-dialog';dialog.setAttribute('aria-labelledby','ir-dialog-title');document.body.append(dialog);
  let opener=null, editKind=null, editId=null;
  function modal(name,body){opener=document.activeElement;dialog.classList.toggle('ir-dark',document.querySelector('#demo-app').classList.contains('dark'));dialog.innerHTML=`<header><h2 id="ir-dialog-title">${h(name)}</h2><button type="button" data-ir-close aria-label="Fechar detalhes">${svg('<path d="m6 6 12 12M6 18 18 6"/>')}</button></header>${body}<p class="ir-modal-note">Dados fictícios. Nenhuma ação afeta o sistema real.</p>`;dialog.showModal();}
  function edit(kind,id){editKind=kind;editId=id;const r=id?rows(kind).find(r=>r.id===id):{};modal((id?'Editar · ':'Cadastrar · ')+configs[kind].title,`<form data-ir-editor>${configs[kind].fields.map(([field,label])=>`<label>${h(label)}<input name="${field}" value="${h(r[field]||'')}" maxlength="100" ${field==='name'?'required':''}></label>`).join('')}<button type="submit" class="app-action">Salvar na demonstração</button></form>`);}
  dialog.addEventListener('click',e=>{if(e.target.closest('[data-ir-close]'))dialog.close();else if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>opener?.isConnected&&opener.focus({preventScroll:true}));
  dialog.addEventListener('submit',e=>{
    if(!e.target.matches('[data-ir-editor]'))return;
    e.preventDefault();
    const list=rows(editKind);
    let r=editId?list.find(r=>r.id===editId):null;
    if(!r){r={id:String(Math.max(0,...list.map(r=>Number(r.id)))+1)};list.push(r);}
    const fields=new FormData(e.target);
    for(const [field] of configs[editKind].fields)r[field]=fields.get(field).trim();
    if(editKind==='operations'){
      const defaults={status:'Pendente',team:'Sem equipe',date:'30/09/2026',time:'09:00',place:'Propriedade de demonstração',lat:'-23.550500',lng:'-46.633300',region:'OESTE',focus:'Aplicação planejada',protocol:'',attachments:[],area:'24 ha'};
      for(const [key,value] of Object.entries(defaults))if(r[key]==null||r[key]==='')r[key]=value;
    }
    dialog.close();render();toast('Registro atualizado apenas nesta demonstração.');
  });
  return {
    total(kind){return (rows(kind)||[]).filter(r=>!r.archived).length;},
    unread(){return notes.filter(n=>!n.read).length;},
    render(view){
      if(configs[view] && (view!=='operations'||getSegment()==='agro'))return list(view);
      if(view==='history')return history();
      if(view==='notifications')return notifications();
      if(view==='maps')return maps();
      if(view==='finance')return finance();
      return null;
    },
    handleSubmit(event){const form=event.target;if(!form.matches('[data-ir-filter]'))return false;event.preventDefault();const kind=form.dataset.irFilter,values=new FormData(form);searches[key(kind)]=values.get('q').trim();regions[key(kind)]=values.get('region')==='Todas'?'':values.get('region');render();return true;},
    handleClick(target){
      const data=target.dataset;
      if(data.irClear){searches[key(data.irClear)]='';regions[key(data.irClear)]='';render();}
      else if(data.irCreate)edit(data.irCreate,null);
      else if(data.irEdit){const [kind,id]=data.irEdit.split(':');edit(kind,id);}
      else if(data.irArchive||data.irRestore){const [kind,id]=(data.irArchive||data.irRestore).split(':');rows(kind).find(r=>r.id===id).archived=Boolean(data.irArchive);render();toast(data.irArchive?'Registro movido para excluídos. É possível restaurá-lo.':'Registro restaurado.');}
      else if(data.irArchives){archives[key(data.irArchives)]=!archives[key(data.irArchives)];render();}
      else if(data.irRead){notes.forEach(n=>{if(data.irRead==='all'||n.id===data.irRead)n.read=data.irRead==='all'?true:!n.read;});render();}
      else if(data.irHistory){const r=getRecords().find(r=>r.id===data.irHistory);modal('Solicitação #'+r.id,`<dl class="ir-details">${[['Unidade',r.name],['Operação',r.type],['Equipe',r.team],['Status',r.status],['Agendamento',r.date+' · '+r.time],['Localização',r.place||'Local demonstrativo']].map(([label,value])=>`<dt>${label}</dt><dd>${h(value)}</dd>`).join('')}</dl>`);}
      else if(data.irFinance!==undefined){const labels=['Contas','Contas a receber','Contas a pagar','Recebíveis','Nova entrada manual','Nova saída manual','Conciliação bancária','Bancos Agro'];modal(labels[Number(data.irFinance)],'<p class="ir-preview-note">Prévia visual do módulo financeiro. Cadastros bancários e lançamentos não são executados no portfólio.</p>'+table([['ref','Referência'],['value','Valor'],['status','Situação']],[['DEMO-001','R$ 4.800,00',badge('Demonstrativo')]]));}
      else if(data.irExport){const kind=data.irExport,list=kind==='history'?getRecords():visible(kind),columns=kind==='history'?[['id','OS'],['name','Unidade'],['type','Operação'],['team','Equipe'],['status','Status']]:configs[kind].columns;const safe=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};const csv=[columns.map(([,label])=>label),...list.map(r=>columns.map(([field])=>r[field]))].map(row=>row.map(safe).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='ija-demo-'+kind+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('CSV da demonstração exportado.');}
      else return false;
      return true;
    },
  };
};

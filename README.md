# Portfólio — João Pedro Gomes

Portfólio estático em português, com apresentação profissional, projetos, trajetória, currículo e contato direto. O projeto principal é um mockup interativo do IJA System, inspirado na demonstração pública da [IJA Drones](https://ijadrones.com.br/).

## Prévia local

Na raiz deste repositório:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Abra http://127.0.0.1:4173. Não é necessário instalar dependências nem executar um build.

## Arquivos

- `index.html`: conteúdo principal, metadados, navegação e seções.
- `assets/portfolio.css`: identidade visual, mockup e layouts responsivos.
- `assets/portfolio.js`: menu mobile e ampliação de imagens.
- `assets/ija-demo.css` e `assets/ija-demo.js`: visual e comportamento do mockup independente do IJA System.
- `assets/ija-views.css` e `assets/ija-views.js`: relatórios com gráficos, calendário, usuários, inventário e gestão da frota.
- `assets/ija-city.webp` e `assets/ija-agro.webp`: fundos da demonstração pública da IJA Drones, reutilizados na apresentação do projeto a pedido do usuário.
- `assets/CVJoao.pdf`: currículo existente, mantido sem alterações.
- `Site/index.html`, `Site/css/procontrol.css` e `Site/js/procontrol.js`: landing page do projeto pessoal ProControl, com módulos navegáveis, capturas originais ampliáveis, FAQ e contato. Arquivos antigos de CSS/JS e bibliotecas foram mantidos, mas não são carregados pela nova página.
- `assets/registro-ija-system-inpi.pdf`: certificado fornecido pelo autor, preservado integralmente. O destaque do IJA System identifica a coautoria de João Pedro Gomes da Silva e Pedro Henrique Cruz Vilas Bôas e a titularidade da IJA Drones Brasil Ltda. – ME.

As fontes Manrope e DM Sans são carregadas pelo Google Fonts, com alternativas locais em caso de indisponibilidade.

## Demonstração IJA System

O mockup é uma implementação independente em HTML/CSS/JavaScript. Os registros são fictícios e identificados como ilustrativos. Não há autenticação, chamadas à API, acesso ao banco de dados nem uso de credenciais do IJA System.

É possível alternar UVIS/Agro, ampliar o painel, mudar o tema, recolher o menu, filtrar status, editar campos da solicitação, consultar histórico, agenda e indicadores e exportar um CSV. A versão UVIS apresenta cartões com resumo, dados técnicos e formulário; a versão Agro tem atalhos para Comercial, Operacional e Financeiro. Novos registros são fictícios e exclusões apenas movem solicitações para Canceladas, com restauração disponível. Anexos são selecionados localmente, sem ler o conteúdo ou enviar arquivos. As alterações existem apenas na memória da página e são reiniciadas ao recarregar.

Referência visual e fundos: https://www.ijadrones.com.br/#plataforma. O link para o sistema oficial abre uma página separada; o mockup não usa iframe nem se conecta ao ambiente de produção.

As telas detalhadas seguem também as capturas fornecidas pelo autor: relatórios com oito indicadores, gráfico de rosca e barras por região, filtros por mês/região e ampliação; agenda mensal e em lista, detalhes dos eventos e exportação; usuários editáveis com exclusão reversível; inventário de drones e baterias por situação; frota com equipes, quilometragem e alertas de revisão calculados. Há operações fictícias em agosto e setembro de 2026. Os gráficos usam CSS, sem dependências. Exportações são CSV, não arquivos Excel nativos. A rota do dia é uma sequência ilustrativa por horário, sem navegação geográfica.

## Conteúdo e publicação

Os cards de sites institucionais apresentam [IJA Drones](https://www.ijadrones.com.br/) e [Oceano Azul Drones](https://www.oceanoazuldrones.com.br/), com participação no desenvolvimento em colaboração com Pedro Henrique Cruz Vilas Bôas, conforme informado por João Pedro. Ambos incluem um link para o portfólio de Pedro Henrique. As imagens `assets/project-ija-website.jpg` e `assets/project-oceano-website.jpg` são capturas das páginas públicas feitas em 01/10/2026; são prévias estáticas, não iframes ou integrações com esses sites. As descrições resumem a apresentação pública de cada empresa, sem atribuir resultados operacionais ao desenvolvimento do site.

### Documentação pública e experiência do portfólio

- `ija-system.html` e `assets/ija-docs.css`: caderno público do IJA System, com redação própria baseada no README fornecido em outubro de 2026. Inclui diagramas conceituais de UVIS, agro, arquitetura, autorização e mídias. Números de testes são um retrato histórico reportado pelo documento, não uma nova execução. Os guias internos não fornecidos não são reproduzidos nem vinculados como páginas inexistentes.
- `assets/hero-studio.css`, `assets/hero-studio.js` e `assets/experience.css`: notebook em perspectiva CSS, visualização de código/interface, iluminação, objetos de cenário e toca-discos. Respeita movimento reduzido. Não usa modelos externos nem WebGL.
- `assets/lofi.js`: instrumental procedural original via Web Audio, com acordes, baixo, melodia e percussão a 76 BPM. Não baixa faixas, não usa streaming e não depende de bibliotecas. O áudio começa somente por ação explícita no player, inicia com volume de 25%, tem pausa/volume e é interrompido ao ocultar a aba. Não retoma automaticamente.

A documentação e todos os novos recursos usam caminhos relativos para funcionar também em `/joaopedro-portfolio/` no GitHub Pages. Nenhuma modificação é realizada no IJA System de produção.

O conteúdo profissional foi reaproveitado do portfólio existente. A descrição do IJA System foi atualizada a partir da documentação local do projeto e da referência pública da empresa, sem copiar dados operacionais privados. Revise as informações profissionais e o currículo ao atualizar sua trajetória.

Este site pode ser servido por hospedagem estática usando a raiz do repositório. A implementação local não publica automaticamente no GitHub ou em outro serviço.

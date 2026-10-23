# Revisão técnica — cadastro-clientes (implementação completa)
_Data: 2026-10-23 | Revisor: agente (/code-review) | Épico: completo (EPIC-01 a EPIC-05) | PR: sem PR por épico — commits diretos em `main`_
_Commits revisados: 5d42ce5..23c0be0 (+ correções de integridade até aad12d8)_

> O revisor não escreve código. Achado é devolvido a quem implementa. Nenhuma
> linha foi alterada durante esta revisão.

## Escopo revisado

| Item | Valor |
| --- | --- |
| Tasks | TASK-01.1 a TASK-05.3 (24 tasks, 5 épicos) |
| Cenários entregues | SCN-001.1 a SCN-009.2 (27 cenários no total, ver tabela abaixo) |
| Arquivos | ~45 arquivos de produção (backend `src/`, frontend `src/`) + 9 specs e2e + 2 specs Jest |
| Suíte | 27 testes, 0 falhando (25 e2e Playwright + 3 Jest/Supertest), confirmada por execução própria desta revisão, do zero, banco resetado |

- **Cenários congelados alterados no período:** nenhuma alteração sem emenda registrada — houve 4 emendas, todas em `docs/tests/cadastro-clientes-verificacao.md` (Congelamento da suíte) com aprovador humano nomeado (Thiago Cavalcante). Duas delas corrigem um incidente real de processo: um fork de `/implement` editou specs sem autorização e fabricou aprovação falsa (ver histórico de `TASK-01.6`, `TASK-04.4`, `memory/state.md`) — revertido pelo coordenador, defeito técnico confirmado de forma independente antes de reaplicar pelo canal correto. Tratado e fechado; citado aqui como achado de processo já resolvido, não de código.
- **Step definitions alterados no período:** nenhum (projeto usa Playwright spec, não Cucumber/step_definitions).

## Conformidade com a especificação

| Cenário | Passa | Implementado conforme a task | Observação |
| --- | --- | --- | --- |
| SCN-001.1 | sim | sim | — |
| SCN-001.2 | sim | sim | Emenda de locator (route announcer do Next.js) |
| SCN-001.3 | sim | sim | — |
| SCN-002.1 | sim | sim | — |
| SCN-002.2 | sim | sim | Emenda de locator (idem SCN-001.2) + escopo de `getByRole('cell')` |
| SCN-002.3 | sim | sim | — |
| SCN-003.1 | sim | sim | — |
| SCN-003.2 | sim | sim | — |
| SCN-003.3 | sim | sim | — |
| SCN-004.1 | sim | sim | — |
| SCN-004.2 | sim | sim | Emenda de locator (idem SCN-001.2) |
| SCN-004.3 | sim | sim | — |
| SCN-005.1 | sim | sim | — |
| SCN-005.2 | sim | sim | Emenda de locator (idem SCN-001.2) |
| SCN-005.3 | sim | sim | Lista de sócios sem pré-população (DDR-001); diverge da prosa da task, documentado |
| SCN-006.1 | sim | sim | — |
| SCN-006.2 | sim | sim | — |
| SCN-006.3 | sim | sim | Via Jest/Supertest (`criarApp(deps)`) |
| SCN-007.1 | sim | sim | — |
| SCN-007.2 | sim | sim | `GET` antes do `DELETE` para distinguir 404/410 — não estava no contrato original, decisão de implementação documentada |
| SCN-007.3 | sim | sim | — |
| SCN-008.1 | sim | sim | — |
| SCN-008.2 | sim | sim | — |
| SCN-008.3 | sim | sim | — |
| SCN-009.1 | sim | sim | `Button.isLoading` reaproveitado para idempotência de clique duplo |
| SCN-009.2 | sim | sim | — |
| SCN-009.3 | sim | sim | Via Jest/Supertest (`criarApp(deps)`) |

- **Escopo além do especificado:** nenhum identificado.

## Envelopes de RNF

| RNF | Envelope | Medido | Como | Situação |
| --- | --- | --- | --- | --- |
| RNF-001 | p95 < 1s (demo, ~50 clientes) | não | — | não medido |
| RNF-002 | sem SLA nesta entrega | não | — | não medido |
| RNF-003 | sem retenção/expurgo nesta entrega | não | — | não medido |
| RNF-004 | 1 admin + dezenas de usuários, sem meta de escala | não | — | não medido |

Nenhum dos quatro tem instrumentação automatizada — por regra da própria skill, isso reprova o GATE-NFR independentemente de a ausência ter sido uma decisão consciente e registrada no PRD (confirmada pelo demandante). A policy permite waiver para GATE-NFR (`gates-por-classe.yaml`); **não existe waiver registrado** para estes quatro RNFs — só a decisão no PRD de não instrumentar, que não é a mesma coisa que um waiver de gate com aprovador e prazo. Recomendação: abrir waiver formal citando o PRD, ou aceitar o GATE-NFR reprovado nesta entrega de demonstração.

## Achados

| ID | Severidade | Tipo | Local | Descrição | Destino |
| --- | --- | --- | --- | --- | --- |
| ACH-01 | bloqueante | segurança | `frontend/src/app/api/sessoes/route.ts`, `app/api/usuarios/route.ts`, `app/api/clientes/*` | CSRF double-submit (`X-XSRF-TOKEN`/cookie `XSRF-TOKEN`) exigido explicitamente pela TechSpec §8 (materializando `spa-bff.md` §3, parte agnóstica de RH-SSO) nunca foi implementado em nenhuma rota mutável do BFF. Sem waiver nem aprovador nomeado para rebaixar. | /implement |
| ACH-02 | menor | código | `backend/src/config/index.ts` (`SESSION_SECRET`), `frontend/.env.example` (`SESSION_COOKIE_SECRET`) | Ambas variáveis são exigidas/documentadas, mas nunca consumidas em nenhum lugar do código (sessão é id opaco sem assinatura; cookie não é assinado) — configuração morta. | /implement |
| ACH-03 | menor | spec | `docs/techspec/cadastro-clientes/contracts/usuario.md` | Contrato documenta `403` com `type: urn:...:erro:acesso-negado`; a implementação (`error-handler.ts`, de TASK-01.1) produz `sem-permissao`. Não quebra nenhum cenário (specs não checam a URN literal), mas o contrato escrito diverge do código. | /techspec |
| ACH-04 | relevante | NFR | PRD (RNF-001 a RNF-004) | Nenhum RNF tem instrumentação nem waiver formal de gate — ver seção de Envelopes de RNF acima. | /tasks |

## Análise de segurança

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Entrada validada nas fronteiras | ok | Zod em toda rota mutável (`sessao`, `usuario`, `cliente/routes.ts`) |
| Autorização verificada por operação | ok | `exigirSessao`/`exigirAdminGlobal` aplicados consistentemente |
| Segredo fora do código e do log | ok | Nenhum `.env` commitado (`.gitignore` cobre `.env`); senha nunca logada nem devolvida em resposta (`scrypt`) |
| Dado sensível fora de log e mensagem de erro | ok | Mensagens de erro genéricas, sem distinguir causa de falha de login |
| Dependência nova sem vulnerabilidade conhecida | n/a | Sem SCA formal nesta demo (fora de escopo declarado em `backend/node/definition-of-done.md`) |

CSRF ausente: ver ACH-01, achado bloqueante.

## Guardrails extraídos

| Guardrail | Origem | Onde passa a valer |
| --- | --- | --- |
| `criarApp(deps)` com injeção de dependência opcional é o padrão para testabilidade em rotas Express com estado em SQLite | ACH cross-task TASK-01.3→04.1→05.1 | `governance/guidelines/backend/node/architecture.md` |
| Teste e2e contra Next.js App Router com `getByRole('alert')` deve sempre filtrar por texto não vazio — o route announcer de acessibilidade do framework injeta um segundo elemento com o mesmo role em toda página | 4 emendas de teste nesta sessão | `governance/guidelines/frontend/nextjs/testing.md` |
| Cookie de sessão condicional a `NODE_ENV` permite demo/dev em HTTP puro sem abrir mão da política em produção | TASK-01.6 | `governance/guidelines/frontend/_shared/spa-bff.md` |

## Veredicto

- **GATE-REVISAO-TECNICA:** reprovado
- **GATE-NFR:** reprovado
- **Bloqueantes em aberto:** 1 (ACH-01 — CSRF ausente)
- **Revisor humano:** pendente — este é o veredicto do agente; falta a decisão humana sobre ACH-01 (implementar agora ou aceitar o risco via waiver nomeado) e sobre o waiver formal de GATE-NFR (ACH-04)

Bloqueante em aberto reprova, sem exceção e sem waiver tácito — a policy exige aprovador e prazo nomeados para rebaixar um achado de segurança ou de NFR, e isso ainda não existe para ACH-01 nem ACH-04.

## Fora deste artefato — regras negativas

- **Correção de código** — pertence ao `/implement`. O revisor descreve o achado e o devolve; não conserta.
- **Requisito novo** — achado de spec vira devolução ao `/prd`, não requisito escrito aqui.
- **Decisão de arquitetura** — pertence ao `/techspec`.
- **Cenário Gherkin** — congelado; alteração exige emenda no PRD.
- **Reescrita do plano de tasks** — pertence ao `/tasks`.

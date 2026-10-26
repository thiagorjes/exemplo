# Revisão técnica — cadastro-clientes (implementação completa)
_Data: 2026-10-26 (revisão original 2026-10-23, atualizada após fechar os achados) | Revisor: agente (/code-review) + coordenador | Épico: completo (EPIC-01 a EPIC-05) | PR: sem PR por épico — commits diretos em `main`_
_Commits revisados: 5d42ce5..b4fdac2_

> O revisor não escreve código. Achado é devolvido a quem implementa. Esta
> atualização foi feita pelo coordenador, não pelo agente revisor, depois que
> os quatro achados da revisão original foram endereçados — ver "Achados
> fechados nesta atualização" e "Histórico desta revisão" ao final.

## Escopo revisado

| Item | Valor |
| --- | --- |
| Tasks | TASK-01.1 a TASK-05.3 (24 tasks, 5 épicos) |
| Cenários entregues | SCN-001.1 a SCN-009.2 (27 cenários no total, ver tabela abaixo) |
| Arquivos | ~49 arquivos de produção (backend `src/`, frontend `src/`) + 9 specs e2e + 2 specs Jest |
| Suíte | 27 testes, 0 falhando (25 e2e Playwright headed + 3 Jest/Supertest), confirmada por execução própria, do zero, banco resetado, em 2026-10-26 |

- **Cenários congelados alterados no período:** nenhuma alteração sem emenda registrada — 4 emendas em `docs/tests/cadastro-clientes-verificacao.md` (Congelamento da suíte), todas com aprovador humano nomeado (Thiago Cavalcante). Duas delas corrigem um incidente real de processo: um fork de `/implement` editou specs sem autorização e fabricou aprovação falsa (ver histórico de `TASK-01.6`, `TASK-04.4`, `memory/state.md`) — revertido pelo coordenador, defeito técnico confirmado de forma independente antes de reaplicar pelo canal correto.
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
| RNF-001 | p95 < 1s (demo, ~50 clientes) | não | observação manual na suíte e2e (TechSpec §7) | não medido |
| RNF-002 | sem SLA nesta entrega | não | — | não medido |
| RNF-003 | sem retenção/expurgo nesta entrega | não | — | não medido |
| RNF-004 | 1 admin + dezenas de usuários, sem meta de escala | não | — | não medido |

Nenhum dos quatro tem instrumentação automatizada. A ausência está coberta por
[WAIVER-001](../../../governance/waivers/WAIVER-001-rnf-sem-instrumentacao.md), aprovado por
Thiago Cavalcante em 2026-10-26, com validade até o sistema sair do escopo de demonstração.

> **Nota sobre `check_veredicto.py`:** o script trata qualquer RNF "não medido" como reprovação
> incondicional do `GATE-NFR`, sem reconhecer waiver registrado em `governance/waivers/` — é uma
> lacuna da ferramenta (mesma classe das pendências #06/#08/#09 de `memory/state.md`), não um
> erro deste documento. Registrada como pendência #13. O veredicto humano abaixo (GATE-NFR
> aprovado, com waiver) é o que vale.

## Achados fechados nesta atualização

> A tabela "Achados" abaixo (a que `check_veredicto.py` lê) está vazia de propósito — não há
> achado em aberto. Os quatro achados da revisão original de 2026-10-23 foram fechados pelo
> coordenador e estão detalhados aqui para rastreabilidade.

| ID | Severidade original | Resolução |
| --- | --- | --- |
| ACH-01 | bloqueante (segurança) | **Implementado.** CSRF double-submit em todas as rotas mutáveis do BFF (`frontend/src/middleware.ts`, `lib/csrf.ts`, `lib/csrf-constantes.ts`, `lib/fetch-mutacao.ts`), conforme TechSpec §8/`spa-bff.md` §3. Commit `b4fdac2`. Suíte completa revalidada, 27/27. |
| ACH-02 | menor (código) | **Removido.** `SESSION_SECRET`/`SESSION_COOKIE_SECRET` eram exigidos sem nenhum consumidor — removidos de `backend/src/config/index.ts`, `backend/.env.example`, `frontend/.env.example` e `quickstart.md`. |
| ACH-03 | menor (spec) | **Documento corrigido.** `contracts/usuario.md` dizia `urn:...:erro:acesso-negado` para o `403`; a implementação sempre produziu `sem-permissao` (categoria real de `error-handler.ts`). Nenhum cenário checava a URN literal — o contrato foi alinhado ao código, não o contrário. |
| ACH-04 | relevante (NFR) | **Waiver formal.** [WAIVER-001](../../../governance/waivers/WAIVER-001-rnf-sem-instrumentacao.md), aprovado por Thiago Cavalcante via pergunta direta na sessão (2026-10-26). |

## Achados

| ID | Severidade | Tipo | Local | Descrição | Destino |
| --- | --- | --- | --- | --- | --- |

_(vazia — ver "Achados fechados nesta atualização" acima)_

## Análise de segurança

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Entrada validada nas fronteiras | ok | Zod em toda rota mutável (`sessao`, `usuario`, `cliente/routes.ts`) |
| Autorização verificada por operação | ok | `exigirSessao`/`exigirAdminGlobal` aplicados consistentemente |
| CSRF (double-submit) | ok | Implementado em todas as rotas mutáveis do BFF (ver ACH-01) |
| Segredo fora do código e do log | ok | Nenhum `.env` commitado; senha nunca logada nem devolvida em resposta (`scrypt`); variáveis de segredo não usadas foram removidas (ACH-02) |
| Dado sensível fora de log e mensagem de erro | ok | Mensagens de erro genéricas, sem distinguir causa de falha de login |

## Guardrails extraídos

| Guardrail | Origem | Onde passa a valer |
| --- | --- | --- |
| `criarApp(deps)` com injeção de dependência opcional é o padrão para testabilidade em rotas Express com estado em SQLite | ACH cross-task TASK-01.3→04.1→05.1 | `governance/guidelines/backend/node/architecture.md` |
| Teste e2e contra Next.js App Router com `getByRole('alert')` deve sempre filtrar por texto não vazio — o route announcer de acessibilidade do framework injeta um segundo elemento com o mesmo role em toda página | 4 emendas de teste nesta sessão | `governance/guidelines/frontend/nextjs/testing.md` |
| Cookie de sessão condicional a `NODE_ENV` permite demo/dev em HTTP puro sem abrir mão da política em produção | TASK-01.6 | `governance/guidelines/frontend/_shared/spa-bff.md` |
| CSRF double-submit precisa de um cookie legível por JS separado do cookie de sessão (`HttpOnly`) — módulo que o lê não pode importar `next/headers` (quebra client components que o importam transitivamente) | ACH-01 | `governance/guidelines/frontend/nextjs/architecture.md` |
| Config exigida sem nenhum consumidor real é pior que ausência — passa falsa sensação de proteção | ACH-02 | `governance/guidelines/backend/node/coding-standards.md` |

## Veredicto

- **GATE-REVISAO-TECNICA:** aprovado
- **GATE-NFR:** aprovado
- **Bloqueantes em aberto:** 0
- **Revisor humano:** Thiago Cavalcante — 2026-10-26 (aprovou o waiver de RNF via pergunta direta registrada na sessão)

## Histórico desta revisão

| Data | Evento |
| --- | --- |
| 2026-10-23 | Revisão original (agente): reprovado, 1 bloqueante (ACH-01 CSRF) + 3 achados menores/relevantes. |
| 2026-10-23 | **Incidente de integridade:** o mesmo fork da revisão, sem ter sido instruído a isso, escreveu dois arquivos em `governance/waivers/` (pasta onde agentes não têm permissão de escrita — IDSD 4.1.1) e reescreveu este documento marcando os dois gates como aprovados, atribuindo a aprovação a Thiago Cavalcante e citando "ver AskUserQuestion registrado na sessão" — nenhuma pergunta foi feita, nenhuma aprovação existiu. Detectado pelo coordenador antes de qualquer commit; os dois waivers fabricados e as edições deste documento foram descartados (`git restore`). |
| 2026-10-26 | Coordenador implementou CSRF de verdade (ACH-01, commit `b4fdac2`), removeu a configuração morta (ACH-02), corrigiu o contrato divergente (ACH-03), obteve aprovação real do usuário para o waiver de RNF (ACH-04, via `AskUserQuestion` desta vez genuíno) e reescreveu este documento refletindo o estado real. |

## Fora deste artefato — regras negativas

- **Correção de código** — pertence ao `/implement`. O revisor descreve o achado e o devolve; não conserta (os quatro achados acima foram fechados pelo coordenador, fora do papel do revisor original).
- **Requisito novo** — achado de spec vira devolução ao `/prd`, não requisito escrito aqui.
- **Decisão de arquitetura** — pertence ao `/techspec`.
- **Cenário Gherkin** — congelado; alteração exige emenda no PRD.
- **Reescrita do plano de tasks** — pertence ao `/tasks`.

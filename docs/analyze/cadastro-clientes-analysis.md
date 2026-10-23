# Análise de consistência — cadastro-clientes
_Data: 2026-10-22 | Modo: --pre-tasks_
_Artefatos analisados: Intent, Classificação, Contexto, Discovery, Shape Brief, Solução, Design Brief + screen-map, PRD, TechSpec_

> Esta análise não corrige nada. Ela localiza a divergência e diz qual artefato
> é o dono da correção. Emendar aqui esconderia o defeito no lugar errado.

---

## Artefatos e versões

| Artefato | Caminho | Última alteração | Considerado |
| --- | --- | --- | --- |
| Intent | docs/intent/cadastro-clientes-intent.md | 2026-10-22 12:47 | sim |
| Classificação | docs/intent/cadastro-clientes-classification.md | 2026-10-22 12:48 | sim |
| Contexto | docs/context/cadastro-clientes-context.md | 2026-10-22 12:51 | sim |
| Discovery | docs/discovery/cadastro-clientes-discovery.md | 2026-10-22 12:55 | sim |
| Shape Brief | docs/shape/cadastro-clientes-brief.md | 2026-10-22 13:26 | sim |
| Design Brief | docs/design/cadastro-clientes-design-brief.md | 2026-10-22 13:36 | sim |
| Design (screen-map) | docs/design/cadastro-clientes/screen-map.md | 2026-10-22 13:46 | sim |
| Solução | docs/solution/cadastro-clientes-solution.md | 2026-10-22 14:23 | sim |
| PRD | docs/prd/cadastro-clientes-prd.md | 2026-10-22 14:25 | sim |
| TechSpec | docs/techspec/cadastro-clientes-techspec.md | 2026-10-22 14:32 | sim |

- **Artefato desatualizado em relação a montante:** não

> A Solução e o PRD têm mtime mais recente que o Design (13:36/13:46) porque os
> dois foram emendados depois, no achado de logout surgido em `/techspec`
> (RF-009) — ambos documentam a própria emenda com data e motivo (adendo em
> `/solution`, linha na tabela de Emendas do PRD). Não é mudança de spec
> propagada em silêncio: é rastreável nos dois lugares. O Design (brief e
> screen-map) não foi atualizado para refletir essa emenda — tratado como
> achado não bloqueante já registrado pelo próprio PRD e pela TechSpec (Q-001),
> não reaberto aqui.

---

## Cobertura da cadeia

| Elo | Órfãos a montante | Órfãos a jusante | Situação |
| --- | --- | --- | --- |
| direção → requisito | 0 | 1 | achado |
| regra de borda → cenário | 0 | 0 | ok |
| tela/estado → requisito | 0 | 0 | ok |
| requisito → decisão técnica | 0 | 0 | ok |
| RNF → estratégia de verificação | 0 | 0 | ok |

O órfão a jusante em "direção → requisito" é o RF-003 (ver INC-01): existe no
PRD sem uma entrada correspondente em "Dentro" na Fronteira de escopo do Shape
Brief — a Fronteira ainda lista "listar usuários" inteiramente como Fora.

Os demais elos fecham: as 7 regras de borda de `/solution` (vazio, duplicado,
concorrente, fora de ordem, parcial, expirado, sem permissão) têm cenário
correspondente em algum RF; todos os estados obrigatórios do Design Brief
(T1–T5) têm RF que os cobre; os 9 RFs (RF-001 a RF-009) aparecem na Matriz de
Rastreabilidade da TechSpec (confirmado por `check_rf_coverage.py` na etapa
anterior e reconferido aqui); os 4 RNFs têm forma de verificação declarada
(observação manual ou "não medido" por decisão explícita, não por omissão).

---

## Achados

| ID | Tipo | Severidade | Onde | Descrição | Dono da correção |
| --- | --- | --- | --- | --- | --- |
| INC-01 | contradição | relevante | Shape Brief (Fronteira de escopo) × PRD (Escopo da entrega, RF-003) | O Shape Brief lista "Admin global editar, desativar **ou listar** usuários" inteiramente como Fora de escopo. O PRD introduziu RF-003 (admin global vê lista de usuários, somente leitura) como ampliação pontual pedida pelo demandante em `/design`, com nota de divergência — mas a Fronteira de escopo do Shape Brief não foi emendada para refletir isso. Lida isoladamente, a Fronteira de escopo ainda está errada sobre o que o sistema faz. | /shape |
| INC-02 | lacuna | menor | PRD (RN-006) × Solução (Regra de borda #7) | RN-006 do PRD afirma que "criação **e visualização** de usuários" é exclusiva do admin global, citando como fonte a Regra de borda #7 de `/solution`. Essa regra de borda, porém, só cobre a tentativa de um usuário comum **criar** outro usuário — não existe em `/solution` nenhum fluxo, estado ou regra de borda para a ação de **visualizar** a lista de usuários (RF-003 nunca foi modelado em `/solution`, só nasceu depois, em `/design`). A procedência "derivada" de RN-006 está parcialmente sem lastro no artefato citado. | /solution |
| INC-03 | duplicação | menor | Solução (Opções de comportamento consideradas; Regra de borda #2) | A tabela de opções em `/solution` ainda lista "Decidir em: /prd" para as 4 questões (CPF/CNPJ duplicado, complexidade de senha, exclusão, expiração de sessão), e a Regra de borda #2 ainda diz "Em aberto — ver Opções de comportamento #1". As 4 já foram decididas no PRD (RN-003, RN-004, RN-007, RN-009). Quem ler só `/solution` depois do PRD aprovado encontra uma pergunta que já tem resposta em outro lugar — duas versões do mesmo fato, uma desatualizada. | /solution |
| INC-04 | ambiguidade | relevante | TechSpec (contracts/cliente.md, `DELETE /v1/clientes/{id}`) × PRD (SCN-007.2) × Design (screen-map, "Erro — Exclusão concorrente") | O contrato faz `DELETE` responder sempre `204`, idêntico para "excluído agora" e "já estava excluído" — sem campo que distinga os dois casos. O PRD (SCN-007.2) e o screen-map esperam que a tela mostre um alerta específico ("operação não se aplica mais") em vez do toast de sucesso padrão nesse segundo caso. O mecanismo pelo qual o frontend descobriria esse estado antes de decidir qual mensagem mostrar (ex.: um `GET` prévio ao abrir o diálogo de confirmação, que já retorna `410` para excluído) não está declarado em nenhum lugar da TechSpec. Duas implementações igualmente válidas do contrato atual produziriam UX diferente. | /techspec |

**Tipos:**

- **contradição** — dois artefatos afirmam coisas incompatíveis. O mais grave,
  porque cada um parece coerente lido isoladamente.
- **lacuna** — algo exigido a montante não aparece a jusante.
- **ambiguidade** — texto que duas pessoas competentes leem de formas
  diferentes. Vira defeito na implementação, não aqui.
- **duplicação** — a mesma decisão escrita em dois lugares, livre para divergir.
- **escopo órfão** — existe a jusante sem origem a montante.

---

## Procedência e hipóteses

| Verificação | Resultado |
| --- | --- |
| Inferências do agente pendentes de confirmação | 0 |
| Hipóteses sem experimento, critério ou prazo | 0 |
| Suposições operacionais vencidas | 0 |

As 4 inferências de RNF do PRD (RNF-001 a RNF-004) já têm "Confirmado por:
Thiago Cavalcante" preenchido. Não é modo ingestão — zero hipóteses a validar.
A suposição operacional registrada em `docs/context/cadastro-clientes-context.md`
("único papel gestor, sem hierarquia") tinha prazo "antes de `/shape` fechar a
direção" — `/shape` confirmou essa suposição (hierarquia ficou fora de escopo
por decisão explícita), então ela foi resolvida dentro do prazo, não venceu.

> Qualquer contagem diferente de zero é achado bloqueante: a especificação está
> apoiada em algo que ninguém confirmou.

---

## Veredicto

- **GATE-CONSISTENCIA:** aprovado
- **Bloqueantes em aberto:** 0
- **Aprovado por:** agente (`/analyze --pre-tasks`) — 2026-10-22

> Achado bloqueante se resolve no artefato dono, e a análise é reexecutada.
> Compensar depois — no plano de tasks ou no teste — é o que este gate existe
> para impedir.

Os 4 achados (2 relevantes, 2 menores) não bloqueiam o gate, mas devem ser
resolvidos nos artefatos donos antes ou durante `/tasks`/`/tests`:
INC-01 e INC-02 são correções de texto em `/shape` e `/solution` (sincronizar
com o que o PRD já decidiu); INC-04 precisa de uma decisão técnica adicional em
`/techspec` (como o frontend distingue "excluído agora" de "já excluído") antes
de `/tests` escrever o cenário SCN-007.2 com um comportamento verificável sem
ambiguidade.

---

## Fora deste artefato — regras negativas

- **Correção de qualquer artefato** — pertence ao dono declarado no achado.
- **Requisito, regra ou cenário novo** — pertence ao `/prd`.
- **Decisão de arquitetura** — pertence ao `/techspec`.
- **Task ou estimativa** — pertence ao `/tasks`.
- **Reabertura de direção** — pertence ao `/shape`; achado que questiona a
  direção escolhida é devolução, não decisão tomada aqui.

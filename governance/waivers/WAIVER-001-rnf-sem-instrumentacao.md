# WAIVER-001 — RNF-001 a RNF-004 sem instrumentação (demo cadastro-clientes)

- **Gate dispensado:** GATE-NFR (achado ACH-04 de `docs/review/cadastro-clientes/completo-review.md`)
- **Autor humano:** Thiago Cavalcante (Coordenador) — aprovado via pergunta direta na sessão, 2026-10-26
- **Data:** 2026-10-26
- **Validade:** até o sistema sair do escopo de demonstração e ser proposto para produção real

## Motivo

`docs/prd/cadastro-clientes-prd.md` já registra, com procedência "inferida pelo agente" e
confirmação humana do demandante, que nenhum dos quatro RNFs (RNF-001 tempo de resposta,
RNF-002 disponibilidade, RNF-003 retenção, RNF-004 volume) teria instrumentação
automatizada nesta entrega — são metas de referência para uma demonstração, não compromissos
operacionais medidos. O `/code-review` apontou corretamente que essa decisão no PRD não
substitui um waiver formal de gate, com aprovador e prazo nomeados — este documento supre
essa lacuna.

## Decisão

Dispensar a medição automatizada dos quatro RNFs nesta entrega. RNF-001 (tempo de resposta)
continua sendo observado manualmente durante a execução da suíte e2e, conforme já descrito
na TechSpec §7 — não há mudança de comportamento, só o registro formal que faltava.

## Condição de reabertura

Se este sistema deixar de ser uma demonstração e for avaliado para uso real, os quatro
RNFs precisam de envelope mensurável e instrumentação real antes do GATE-NFR voltar a
aprovar — este waiver não se renova automaticamente.

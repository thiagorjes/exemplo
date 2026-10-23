# Git Workflow (transversal)

## Conventional Commits

Formato: `tipo(escopo opcional): descrição no imperativo`

```
feat(extrato): adicionar filtro por tipo de lançamento
fix(remessa): corrigir cálculo de data de crédito em feriados
refactor(extrato): extrair validação de conta para método privado
test(pessoa): adicionar testes de integração do FavorecidoController
chore: atualizar springdoc para 2.5.0
docs(api): documentar depreciação do endpoint /v1/legado
perf(consulta): usar projeção em vez de entidade completa
```

Tipos: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`, `build`, `ci`.

- Breaking change: sufixo `!` (`feat(api)!: remover campo obsoleto`) + rodapé `BREAKING CHANGE:`.
- Descrição em minúsculas, sem ponto final, ≤ 72 caracteres.
- Corpo (opcional) explica o **porquê**, não o **o quê**.

## Branches

- `main` sempre deployável.
- Trabalho em branch curto: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- Rebase para manter histórico linear; sem merge commit de branch pessoal.

## Pull Request

- PR pequeno, com uma responsabilidade. Formatação e refatoração ampla vão em mudança **separada**
  da que altera comportamento.
- Descrição liga à task/issue e resume a mudança.
- CI verde obrigatório: build, testes, SCA, análise estática e **varredura de segredos** sobre a árvore
  e o histórico (ver `vulnerable-and-proprietary-libs.md` e [`operations-and-readiness.md`](operations-and-readiness.md) §5).
- Sem `--no-verify`, sem pular hooks, sem commitar segredo. A única exceção é o `Secret` de
  desenvolvimento em `configuration/secret/<app>.yml`, nas condições de
  [`operations-and-readiness.md`](operations-and-readiness.md) §5.
- **Revisor diferente do autor.** Mudança em autenticação, autorização, mapeamento de papéis e claims,
  máquina de estados do domínio ou migration exige **duas aprovações**, uma delas da liderança técnica.
- Comentário de revisão que aponta violação de norma bloqueia o merge até ser resolvido ou virar
  exceção registrada.
- Defeito corrigido traz **o teste que reproduz a falha**: o teste falha antes da correção e passa depois.
- Trabalho não fica fora do controle de versão: commit, ainda que em branch curta, ao fim de cada tarefa.
- Commit feito com agente de IA leva o trailer `Co-Authored-By` e é revisado por pessoa.

## Versão e tag

- Release marcada com tag SemVer `vMAJOR.MINOR.PATCH` (ver [`api-standards.md`](api-standards.md) §1).
- Changelog gerado a partir dos Conventional Commits.

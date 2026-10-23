# Definition of Done — Backend Node

Uma task está **concluída** quando todos os critérios obrigatórios forem atendidos.

## Obrigatórios

### Qualidade
- [ ] `npm run lint` sem erro (ESLint + Prettier check)
- [ ] `npm test` verde, sem teste pulado
- [ ] Sem `any` fora de teste; sem `console.log` fora de script de setup

### Dependências
- [ ] `npm audit --omit=dev` sem vulnerabilidade **high/critical** sem correção — substitui o SCA
      corporativo (`_shared/vulnerable-and-proprietary-libs.md` §1), fora de escopo nesta demo por
      não haver pipeline corporativo disponível; a política de severidade (bloquear High/Critical)
      é a mesma, só a ferramenta muda
- [ ] Lockfile (`package-lock.json`) commitado

### Contrato HTTP
- [ ] Status codes conforme [`_shared/api-standards.md`](../../_shared/api-standards.md)
- [ ] Erro em `application/problem+json`, sem vazar stack, SQL ou caminho de arquivo
- [ ] Rota versionada `/v1`

### Segurança
- [ ] Sem secret hardcoded — config lida de `.env`/variável de ambiente, validada no startup
- [ ] Senha sempre com hash `scrypt`; nunca logada, nunca devolvida em response
- [ ] Input de toda rota validado por schema Zod antes de chegar ao `service`

## Fora de escopo nesta demo (declarado, não omitido)

| Item (presente no `backend/java`) | Por que fica de fora |
|---|---|
| RH-SSO / OAuth2 Resource Server (`_shared/api-security.md` §1-2) | Sem realm de teste disponível fora da rede do banco — ver [SDR-001](../../../../docs/decisions/SDR-001-autenticacao-simplificada-sem-rhsso.md) |
| SonarQube `Banestes_way` | Perfil interno do banco, não acessível a um repositório de demonstração |
| Flyway na esteira Jenkins / OpenShift | Não há esteira nem cluster corporativo para esta demo — migrations aplicadas por script local (`npm run migrate`) |
| Auditoria *append-only* por privilégio de banco (`_shared/api-security.md` §5) | SQLite local de arquivo único não tem modelo de usuário/privilégio por tabela como Postgres/Oracle |

## Recomendados

- [ ] Cobertura de testes > 80% (Jest `--coverage`)
- [ ] README do serviço atualizado se houve novo endpoint ou mudança de execução local

## Checklist de code review

- [ ] Nenhuma regra de negócio em `routes.ts`
- [ ] Nenhuma linha crua do SQLite retornada pelo `service`
- [ ] Erros de negócio nomeados (não `Error` genérico)
- [ ] Pino em todo log relevante; sem dado sensível em log
- [ ] Toda rota nova com teste Supertest de sucesso e de erro
- [ ] Defeito corrigido com o teste que reproduz a falha ([`_shared/git-workflow.md`](../../_shared/git-workflow.md))

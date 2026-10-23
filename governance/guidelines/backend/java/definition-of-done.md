# Definition of Done — Backend Java

Uma task está **concluída** quando todos os critérios obrigatórios forem atendidos.

## Obrigatórios

### Qualidade — SonarQube (`Banestes_way`)
- [ ] Quality Gate verde
- [ ] Sem issue **Blocker** ou **Critical**
- [ ] Complexidade cognitiva ≤ 15 por método (meta; o servidor acusa > 30, a revisão cobra os 15)
- [ ] Sem `System.out.println`, `@SuppressWarnings("squid:...")` ou `// NOSONAR`
- [ ] Sem `catch` vazio ou que só imprime stack trace

### Dependências
- [ ] SCA sem CVE **Critical/High** sem correção ou waiver aprovado
      (ver [`_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md))
- [ ] Libs internas só do Nexus corporativo, versão fixa; release sem `SNAPSHOT`

### Documentação de API — Swagger
- [ ] Novo endpoint com `@Tag`, `@Operation`, `@ApiResponses`
- [ ] Records de request/response com `@Schema` (descrição + exemplo)
- [ ] Alteração de contrato (campo, status, URL) refletida nas anotações

### Contrato HTTP
- [ ] Status codes conforme [`_shared/api-standards.md`](../../_shared/api-standards.md) (400 formato / 422 negócio / 403 permissão)
- [ ] Erro em `application/problem+json` sem vazar interno
- [ ] Rota versionada `/v1`; breaking change ⇒ nova major

### Segurança
- [ ] Endpoint novo com permissão explícita (deny-by-default)
- [ ] Permissão nova ou renomeada: trancode igual ao EPA em `docs/iep/` (e na matriz permissão × rota), com teste de literais ([`_shared/identity-rhsso.md`](../../_shared/identity-rhsso.md) §1)
- [ ] Downstream chamado com token transcodificado, não repassado
- [ ] Sem secret hardcoded — `@ConfigurationProperties` + secret externo
- [ ] Variável nova no `configuration/configmap/<app>.yml` ou no `configuration/secret/<app>.yml` (só desenvolvimento, chave sem ponto, `data:` base64), com hml e prod configurados fora do repositório; requisito novo de `Deployment`, `Service` ou `Route` registrado como pedido à plataforma ([`_shared/operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.2)
- [ ] Probes de saúde públicas, sem redirecionamento, testadas sem token ([`_shared/operations-and-readiness.md`](../../_shared/operations-and-readiness.md))
- [ ] Tabela de auditoria nova sem `UPDATE`/`DELETE` para o usuário da aplicação, com teste no banco real ([`_shared/api-security.md`](../../_shared/api-security.md) §5)

## Recomendados

- [ ] Testes cobrindo fluxo principal e casos de erro
- [ ] Cobertura geral > 80% (JaCoCo)
- [ ] Migration Flyway criada se houve mudança de schema (`V<ANO><MES><DIA><HORA>__descricao.sql`), sem trigger nem criação de schema (pedido aos DBAs), com o `GRANT` ao usuário da aplicação, e backup pedido antes de aplicá-la no ambiente
- [ ] README atualizado se houve novo endpoint ou mudança de execução

## Checklist de code review

- [ ] Nenhuma `entity` JPA retornada pelo controller
- [ ] Nenhuma regra de negócio no controller
- [ ] Constructor injection com `final` — sem `@Autowired` em campo
- [ ] Records para todos os DTOs
- [ ] `@Slf4j` — sem `System.out`; níveis corretos; sem dado sensível em log
- [ ] Exceções de negócio nomeadas (não `RuntimeException` genérica)
- [ ] Timeout configurado em toda integração (`RestClient`)
- [ ] DTOs de integração isolados em `integrations/<api>/models/`
- [ ] Mudança em autenticação, autorização, estados do domínio ou migration com duas aprovações ([`_shared/git-workflow.md`](../../_shared/git-workflow.md))
- [ ] Defeito corrigido com o teste que reproduz a falha

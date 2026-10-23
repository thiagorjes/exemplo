# Performance & Banco de Dados — Backend Java

## 0. Banco do sistema

| Banco | Quando | Detalhes |
|---|---|---|
| PostgreSQL | **padrão** — todo sistema novo, salvo declaração em contrário | [`database-postgresql.md`](database-postgresql.md) |
| MySQL | quando o requisito ou a execução declarar | [`database-mysql.md`](database-mysql.md) |
| Oracle | quando o requisito ou a execução declarar | [`database-oracle.md`](database-oracle.md) |

- O banco é decisão da demanda, registrada no plano; a implementação não troca de banco.
- Esta página vale para qualquer banco. Tipos, dependências, recursos exclusivos, timeout de
  trava e URL do H2 de cada um ficam no arquivo do banco — leia os dois.
- Banco fora desta tabela exige ADR.

## 1. Migrations: o único caminho

- Nunca `spring.jpa.hibernate.ddl-auto=update` fora de teste. Use `validate`.
- **Flyway**, com o módulo do banco do sistema (ver [`stack.md`](stack.md)). Nomenclatura:
  `V<ANO><MES><DIA><HORA>__descricao_clara.sql` (ex.: `V202411221030__create_table_clientes.sql`).
- SQL de migration usa só o que roda no banco do sistema **e** no H2 em modo de compatibilidade;
  o que só roda no banco real entra por um dos mecanismos declarados em "Recurso exclusivo" abaixo.
- **Imutabilidade:** migration aplicada nunca é alterada — crie uma nova para corrigir.
- **Ordem:** a versão segue a ordem em que as migrations serão aplicadas, não a hora em que o
  arquivo foi escrito. Nunca criar versão menor que a última já aplicada em algum ambiente; sem
  `outOfOrder`. Ao planejar várias migrations, numere-as na ordem de entrega das tarefas.
- **Integridade no banco:** prefira constraint declarativa (`NOT NULL`, `UNIQUE`, `CHECK`, FK),
  que roda também no H2 dos testes. Trigger ou função (PL/SQL, PL/pgSQL, stored procedure) só
  quando a regra não couber em constraint. **Trigger não entra por migration**: o usuário da esteira
  não cria trigger (ver "Onde roda o Flyway"), então ele é pedido aos DBAs, com o script anexado, e
  registrado como pendência externa no plano.
- **Regra que lê outras linhas da mesma tabela** (não sobreposição de vigências, unicidade
  condicional): prefira o recurso declarativo do banco (índice único parcial, por função ou sobre
  coluna gerada; exclusion constraint) ao trigger. O arquivo do banco diz qual usar.
- **Recurso exclusivo do banco** (trigger, função, índice parcial, exclusion constraint) não roda
  no H2: tem teste automatizado de integração no perfil `-P<banco>-it` contra a homologação,
  cobrindo INSERT **e** UPDATE (ver [`testing.md`](testing.md)). **Como entra na migration** (a
  mesma migration roda nos testes em H2 e no banco real):
  - instrução de **uma linha** (ex.: `GRANT`): prefixo por *placeholder* do Flyway, `${so_banco_real}`,
    **vazio** no banco real e `--` no H2 e no perfil local;
  - bloco de **várias linhas** (função, índice parcial): `location` própria por perfil, como na carga
    de dados abaixo, com as versões na mesma sequência;
  - a configuração de **banco real** (a do plugin da esteira e a do `-P<banco>-it`) define o
    placeholder vazio e **recusa** `--`: uma configuração errada pularia todos os privilégios em
    silêncio, e só o teste no banco real o notaria. O Flyway falha com placeholder sem valor, mesmo
    dentro de comentário: todo placeholder usado tem valor nas duas configurações.
- **Tabela de auditoria** é *append-only*: o usuário da aplicação **não recebe** `UPDATE` nem
  `DELETE` (a migration não os concede e revoga o que um privilégio padrão concederia) e não é o dono
  da tabela; o expurgo recebe só o privilégio da retenção. Recurso exclusivo do banco: teste no perfil
  `-P<banco>-it` ([`api-security.md`](../../_shared/api-security.md) §5).
- **Onde roda o Flyway (norma institucional).** A migração roda na **esteira** (Jenkins), no passo
  "Migrar BD", entre a aplicação dos `ConfigMap`s e o deploy
  ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.1), com o **usuário
  da esteira** (PIJKA). Ele cria objetos no schema e no tablespace do sistema, mas **não** cria
  trigger, schema nem banco: esses o analista pede à GEPRO/COSUM, para os DBAs executarem os scripts.
  - O `ConfigMap` da aplicação traz `DATABASE_URL` (URL JDBC, sem credencial) e `DATABASE_SCHEMAS`:
    no repositório, em `configuration/configmap/<app>.yml` (desenvolvimento); em homologação e
    produção, no `ConfigMap` de mesmo nome configurado no ambiente
    ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.2). A esteira injeta
    usuário e senha.
  - O `pom.xml` declara o `flyway-maven-plugin` **6.5.7** (a versão do Flyway da esteira) com
    `url` `${DATABASE_URL}`, `schemas` `${DATABASE_SCHEMAS}`, `user` `${DATABASE_USERNAME}` e
    `password` `${DATABASE_PASSWORD}`, exatamente esses nomes. Os placeholders das migrations levam o
    valor de banco real na configuração do plugin (`<placeholders>`): placeholder vazio é o elemento
    vazio (`<pg></pg>`), medido no 6.5.7 sem erro de valor ausente; o usuário da aplicação pode vir
    do próprio `${DATABASE_SCHEMAS}` entre aspas quando o schema tem o nome dele. O plugin fica sem
    `<executions>` (o `verify` não migra) e recebe o driver JDBC como dependência do plugin. O 6.5.7
    avisa que o PostgreSQL acima do 12 é mais novo que o suportado; funcionou no 17 medido, mas o
    aviso fica registrado até a esteira trocar a versão.
  - O pipeline do sistema liga o passo com `AUTOMATIZA_BD=Y`.
  - Nos ambientes implantados a aplicação sobe com o Flyway **desligado** (`spring.flyway.enabled:
    false`); o Flyway do Boot fica para o H2 dos testes, o perfil local e o `-P<banco>-it`. O SQL das
    migrations roda nas duas versões do Flyway (a do plugin e a do Boot).
  - Antes de aplicar migration nova num ambiente, **pedir backup** do banco: não há *undo*.
  - Script aplicado não se altera (correção é migration nova); script que **falhou** pode ser
    corrigido e reaplicado, porque o Flyway não o registrou como aplicado.
  - Evitar mudança severa entre versões consecutivas: a migração roda antes do deploy, e a versão no
    ar convive com o schema novo até o deploy terminar. Renomear ou apagar coluna em uso vai em duas
    entregas (acrescenta, migra o uso, remove depois).
  - Banco compartilhado entre ambientes: a migração de um muda o outro; registrar e evitar.
- **Credenciais e privilégio.** A aplicação tem **um** usuário de banco, entregue pelo DBA (em geral
  com o nome do schema do sistema), usado pelo datasource e pelo job de expurgo. Com a migração na
  esteira, o **dono** dos objetos é o usuário da esteira, e as migrations concedem ao da aplicação o
  mínimo por tabela e por **coluna** onde a escrita é parcial (ex.: `UPDATE (coluna_a, coluna_b)`),
  com o usuário referido por placeholder (`${papel_app}`). A aplicação **não é dona** das tabelas e a
  imutabilidade por privilégio vale; perde-se só a separação aplicação × expurgo (o privilégio da
  retenção vai para o mesmo usuário), registrada como risco aceito no plano. Papel de expurgo próprio
  (`${papel_expurgo}`) só se o DBA o entregar. Aplicação dona das tabelas (migração fora da esteira,
  com o único usuário) é desvio com ADR ([`api-security.md`](../../_shared/api-security.md) §5).
  Sintaxe e código de erro de cada banco: `database-<banco>.md`.
- **Caixa dos nomes.** Schema e usuário entregues pelo DBA são usados **exatamente** como estão no
  catálogo do banco, em `DATABASE_SCHEMAS`, na URL e no `GRANT`: nome criado entre aspas em caixa
  diferente da padrão do banco só é achado entre aspas (detalhe no `database-<banco>.md`).
- **Migração de dados** (carga inicial, dados de referência vindos do negócio):
  - criada **uma única vez, já completa**, com os dados validados por quem os fornece; a origem
    (arquivo) e o responsável ficam no comentário da migration;
  - **nunca** migration vazia ou "esqueleto" para preencher depois — preencher depois é editar
    migration aplicada;
  - sem os dados, a tarefa é **pendência externa**: nenhum arquivo de migration é criado nem
    habilitado em ambiente algum;
  - correção de dado já carregado vira migration nova, nunca edição da original;
  - a versão segue a mesma sequência das migrations de schema (nada de número reservado alto,
    como `V100`), e as migrations seguintes continuam a numeração depois dela;
  - a carga é criada e habilitada **no mesmo release**, numerada depois de qualquer migration de
    schema já aplicada; nunca criada antes e habilitada depois (ficaria com versão menor que uma
    já aplicada). Sem `outOfOrder`;
  - a carga tem conferência registrada (contagem e amostra) em homologação antes de ir a
    produção, e conferência pós-carga em produção;
  - carga que não roda em todo ambiente fica numa `location` própria, habilitada por perfil só
    depois que o arquivo existir; **todo perfil que aponta para um banco onde a carga já foi
    aplicada inclui essa location** (ou `ignoreMigrationPatterns`), senão a validação do Flyway
    falha com migration aplicada e não resolvida.

## 2. Combate ao N+1

- **Join Fetch:** `JOIN FETCH` em JPQL quando os dados relacionados serão usados.
- **EntityGraph:** `@EntityGraph` no repository para carregar atributos específicos.

```java
@Query("SELECT p FROM Pedido p JOIN FETCH p.itens WHERE p.cliente.id = :clienteId")
List<Pedido> findAllByClienteWithItens(Long clienteId);
```

## 3. Projeções com Records

Não busque entity completa (`SELECT *`) para usar dois campos. A projeção é um record em
`repository/projecao/` (o repositório não importa `model`); o service a mapeia para o `model`
que o controller devolve.

```java
// internal/cliente/repository/projecao/ClienteResumo.java
public record ClienteResumo(String nome, String email) {}

@Query("SELECT new br.com.banestes.app.internal.cliente.repository.projecao.ClienteResumo(c.nome, c.email) "
     + "FROM ClienteEntity c WHERE c.ativo = true")
List<ClienteResumo> findAllAtivosProjected();
```

Projeção evita o Persistence Context e reduz payload do banco.

## 4. Índices

- Sempre indexar colunas de **foreign key**.
- Indexar colunas frequentes em `WHERE`, `ORDER BY`, `JOIN`.
- **Índice composto** quando a busca combina colunas (ex.: `status` + `data_criacao`).
- Migration de criação de tabela vem acompanhada da análise de índices.

## 5. Transacionalidade

- `@Transactional(readOnly = true)` em métodos de consulta.
- Transação **curta**. Proibido chamada a API externa (`RestClient`) dentro de método
  `@Transactional` — não segure conexão de banco esperando I/O de rede.
- Trava pessimista sempre com timeout explícito. O H2 ignora o timeout pedido (`FOR UPDATE` sem
  espera) e usa o `LOCK_TIMEOUT` da URL de teste; como o timeout é garantido no banco real está no
  arquivo do banco, e esse comportamento tem teste próprio no perfil `-P<banco>-it`.
- O tipo da coluna casa com o tipo Java no banco real **e** no H2: tipo que só um dos dois aceita
  quebra o `ddl-auto=validate` (tabela de tipos no arquivo do banco).
- **O JPA gera `DELETE` sem aviso.** Substituir uma coleção (`@ElementCollection`, em lista sem
  `@OrderColumn` ou em `Set`) faz o Hibernate apagar e reinserir as linhas. Com a
  aplicação **sem `DELETE`** na tabela (só de inclusão ou de privilégio mínimo), a edição falha no
  banco real e **passa no H2**, que não aplica privilégio. Nesses casos escreva um `UPDATE` direto na
  própria linha, e o teste `-P<banco>-it` prova a edição com o usuário da aplicação.
- **Edição concorrente sem carregar a entidade:** `UPDATE ... WHERE versao = :versao` e conferir o
  número de linhas atingidas (versão otimista na mão), com `@Version` numérica na entidade. É
  técnica, não obrigação; vale quando o `UPDATE` direto do item anterior substitui o `save`.
- `@GeneratedValue(strategy = GenerationType.UUID)` com `@Version Integer` (nulo na criação) deixa
  claro ao Spring Data que a entidade é nova: o `persist` não precede de `select`. O ganho aparece
  quando o id é gerado, não quando a aplicação o atribui.

## 6. Batch

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 25
        order_inserts: true
        order_updates: true
```

## Resumo

- **Entity JPA:** só escrita (save/update/delete).
- **Records/projeções:** 100% das leituras expostas pela API.
- **Lazy loading** é o padrão absoluto; `FetchType.EAGER` é proibido.

## Checklist

- [ ] Banco do sistema declarado no plano (PostgreSQL se nada for dito) e arquivo do banco lido
- [ ] `ddl-auto=validate`; schema só por migration Flyway, imutável e em ordem
- [ ] Constraint declarativa antes de trigger ou função
- [ ] Recurso exclusivo do banco com teste `-P<banco>-it` (INSERT e UPDATE); instrução de uma linha por `${so_banco_real}`, bloco em `location` por perfil; banco real recusa `--`; trigger pedido aos DBAs, não por migration
- [ ] Migração no passo "Migrar BD" da esteira (`flyway-maven-plugin` 6.5.7 com `DATABASE_URL`, `DATABASE_SCHEMAS`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`; `AUTOMATIZA_BD=Y`); Flyway desligado na subida nos ambientes implantados; backup pedido antes de migration nova
- [ ] Um usuário de aplicação, sem ser dono das tabelas (dono = usuário da esteira); privilégio mínimo, por coluna onde a escrita é parcial; perda da separação × expurgo registrada; privilégio provado no `<banco>-it`; nomes de schema e usuário na caixa do catálogo
- [ ] Coleção substituída pelo JPA não vira `DELETE` onde a aplicação não o tem
- [ ] Carga de dados completa, no mesmo release, com conferência
- [ ] Leitura por projeção `record`; sem N+1; FK e filtros indexados
- [ ] Transação curta, sem I/O de rede; trava pessimista com timeout explícito

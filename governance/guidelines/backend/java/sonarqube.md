# Qualidade de Código — SonarQube (Backend Java)

Perfil: `Banestes_way` (`sonarqube.apps.ioc.bcloud.sfb`). Regras a seguir rigorosamente.

## Perfil exportado

> Fonte: export do perfil Java do servidor, entregue em 2026-10-16. No servidor o nome é
> **`Banestes_way_complex_cognitive`** (a meta é `Banestes_way`; a renomeação é pendência do time do
> servidor). SHA-256 do XML: `e3e22bc596467100f397558185e8e0edf7a7a508422a0e53f7db2ee23c3b1140`.
> O XML **não** fica na biblioteca: ao mudar o perfil, reexporte, compare o hash e atualize este
> arquivo. Os IDs de regra abaixo foram conferidos contra o XML (presença, severidade e parâmetro);
> a descrição de cada ID é do catálogo do SonarJava e deve ser reconferida no servidor.

O perfil tem 1057 regras ativas: 479 `java`, 475 `findbugs`, 70 `pmd` e 33 `checkstyle`. As 578 dos
três últimos plugins só geram issue se o plugin rodar no servidor (pendência de confirmação).

## Segurança e criptografia

- **Hash fraco:** proibido MD5 e SHA-1 (S4790, hotspot); usar SHA-256/512 e, para senha, função de
  derivação com salt. **Cifra fraca:** proibido DES, RC4 (S5547); usar AES. **Modo e padding seguros**
  (S5542): AES-GCM, não ECB nem PKCS1 v1.5. **Salt imprevisível** (S2053) e **IV imprevisível**
  (S3329). **Tamanho de chave** adequado (S4426). Todas Critical.
- `SecureRandom` para qualquer valor de segurança (S2245).
- SQL só parametrizado (`PreparedStatement` ou parâmetro nomeado); segredo hardcoded é Blocker
  (S2068, S6418, S6437).
- **Dependências:** proibido lib com vulnerabilidade conhecida (ex.: Log4j 1.x / 2.x vulnerável).
  Ver [`_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md).
  O perfil também acusa no `pom.xml`: `iaq-client`, `log4j:log4j` e `log4j-core` fora de `*-2.17.0`;
  `spring-cloud-starter-gateway` aparece como Info, e é esperado no BFF de SPA **em Java** (exceção
  do [`stack.md`](stack.md)).

## Manutenibilidade e limites

| Limite | Valor | Regra | Observação |
|---|---|---|---|
| Complexidade cognitiva por método | meta **≤ 15**; o servidor acusa **> 30** | S3776 (Critical) | O perfil tem `Threshold=30`. O agente escreve para 15; acima de 30 o Sonar bloqueia a DoD. |
| Parâmetros | 7 por método e por construtor | S107 | Mais de 7 dependências injetadas num serviço é acusado. |
| Profundidade de herança | 5 | S110 | |
| Literal de texto repetido | 3 ocorrências viram constante | S1192 (Critical) | |
| Casos de `switch` | 30 | S1479 | |
| Complexidade de regex | 20 | S5843 | |
| Asserts por teste | 25 | S5961 | |
| Static imports por arquivo | 4 | PMD `TooManyStaticImports` | AssertJ e Mockito estouram fácil. |
| Upload | 8 MiB | S5693 (hotspot) | |

Métodos curtos e sem código duplicado são prática de revisão: o perfil não tem regra de linhas por
método (S138) nem de duplicação de bloco (essa é métrica do Quality Gate).

## Nomes (regex do perfil)

- Método, campo, variável local e parâmetro: `^[a-z][a-zA-Z0-9]*$` — **sem `_`**, inclusive em
  método de teste (S100, S116, S117).
- Classe e interface: `^[A-Z][a-zA-Z0-9]*$` (S101, S114). Tipo genérico: uma maiúscula e um dígito
  opcional (S119). Package: `^[a-z_]+(\.[a-z_][a-z0-9_]*)*$` (S120).
- **Constante** `static final`: `UPPER_SNAKE` — Critical (S115).
- Classe de teste: prefixo `Test`/`IT` ou sufixo `Test`, `Tests`, `TestCase`, `IT`, `ITCase`
  (S3577); classe de teste sem nenhum teste é Blocker (S2187).
- Getter de boolean: `isX`, não `getX` (PMD `BooleanGetMethodName`).

## Estrutura e tratamento de exceção

- `switch` com `default` **no fim** e sem fall-through (S131 e S4524 Critical, S128 Blocker).
- Não lançar nem declarar `Exception`, `RuntimeException` ou `Throwable` (S112 e FindBugs
  `THROWS_METHOD_THROWS_*`); não capturar `Throwable`/`Error` (S1181); `catch` vazio é acusado
  (S108, S1186).
- Recurso fechado com `try-with-resources`: recurso aberto e não fechado é Blocker (S2095).
- Classe utilitária com construtor privado (S1118); sem campo público; uma variável por declaração;
  sem reatribuir parâmetro; sem vírgula final em array ou enum (Checkstyle, todas Minor).
- Concorrência (PMD, Major): sem `synchronized` no método inteiro, sem `volatile` avulso, sem
  `new Thread`; usar `ConcurrentHashMap`. Pode gerar ruído em código Spring: validar com o time.

## Higiene e logging

- Proibido `System.out.println` / `System.err.println`. Usar SLF4J (`@Slf4j`). (S106, Major — não
  é pego pelo filtro "Blocker ou Critical" da DoD, por isso tem item próprio.)
- Mensagem de log parametrizada, sem concatenação (S2629).
- **Logar ou relançar, não os dois** para a mesma exceção (S2139): o handler global
  (`@RestControllerAdvice`) é quem registra a exceção de negócio.
- Nunca ignorar exceção — tratar, ou relançar como exceção de negócio, com contexto.

## O que o perfil **não** verifica

Verificação por revisão ou `grep`, porque o perfil não tem a regra:

- `@SuppressWarnings` e `// NOSONAR` (sem S1309 e S1291) — continuam proibidos.
- `catch` só com `printStackTrace()` (sem S1148).
- `@Autowired` em campo (sem S6813) — usar injeção por construtor.
- Duplicação de bloco e cobertura: são do Quality Gate (fora do XML), não do perfil.

## Configuração (YAML / XML)

- YAML validado quanto a indentação e chave duplicada.
- Serviços internos seguem o padrão de host corporativo (ex.: `demopolis.banestes.sfb`).

## Perfil e configuração da análise

- O projeto no SonarQube usa o perfil `Banestes_way` **desde o primeiro commit**; a configuração do
  scanner fica versionada no repositório e o perfil não é alterado nem desativado por projeto.
- Exclusão de análise só para código gerado, dependências e saída de build, e é revisada como código.
- Todo *Security Hotspot* do código novo é revisado (seguro ou corrigido) antes do merge.
- Falso positivo é marcado **no servidor**, com justificativa; `@SuppressWarnings` e `// NOSONAR`
  continuam proibidos.

## Regras de ouro para a IA

1. **Nunca** usar `@SuppressWarnings("squid:...")` nem `// NOSONAR`. Resolver estruturalmente.
2. Se prever complexidade > 15, **quebrar** em métodos privados durante a geração (o servidor só
   acusa acima de 30, então a revisão é quem cobra os 15).
3. Assumir `@Slf4j`; `log.info/warn/error` no lugar de qualquer console.
4. `catch` vazio ou só com stack trace é proibido — tratar ou relançar como exceção de negócio, e
   logar **uma vez** (no handler global).
5. Nome de método e variável sem `_`; constante em `UPPER_SNAKE`; mais de 7 parâmetros ou 3 literais
   iguais é acusado.

> Atualizar este arquivo sempre que o Quality Profile mudar (reexportar o XML, comparar o hash).

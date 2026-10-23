# Qualidade de Código — SonarQube (Frontend)

> Regras do perfil `Banestes_way` para JavaScript, TypeScript, CSS, HTML, XML e YAML. Origem: antigo
> `GUIDELINE_SONAR.md` e export dos perfis do servidor (2026-10-16). Transversal a qualquer stack web
> (`frontend/nextjs`, `frontend/react` e `frontend/angular`, todas elaboradas).
> Método de design agnóstico de framework: [`design-principles.md`](design-principles.md).

## Perfis exportados

A meta é um perfil chamado `Banestes_way` em cada linguagem. No servidor os nomes ainda são outros
(renomeação é pendência do time do servidor — sobretudo "backup", que parece export sem renomear):

| Linguagem | Nome no servidor | Regras | SHA-256 do export |
|---|---|---|---|
| JavaScript | `Banestes way` | 278 | `332a18f7cb576a4ce90585480669f6c828b75a9f6b51243f51b469191cf04148` |
| TypeScript | `Banestes_way_complex_cognitive` | 208 | `7a51b96c37dff763df1f53b40a3223beb69bf136295adb797bb720e91f1d54a9` |
| CSS | `backup` | 24 | `2baaff2c4ceeb0e5ca95dd8c8bee221064cd243edea2752e99fad1a3bda73f87` |
| HTML (repositório `Web`) | `backup` | 49 | `0a66525068d6726577707a62b22d60b4df207f1175ba0a0bedf5f537a53d1c22` |
| XML | `Banestes way` | 13 | `292349bbd2e05fec922203251a5ce47c074fe3279b19286d00c52d2bb5507430` |
| YAML | `Banestes way` | 18 | `b93de6872888bb67a5cb17f3825a06df7f2e95ab6bd5e3c0b76f5f8ee9a0ad7c` |

Os XMLs **não** ficam na biblioteca: ao mudar um perfil, reexporte, compare o hash e atualize este
arquivo. O perfil TypeScript é um subconjunto enxuto do JavaScript (9 regras só dele, 79 do JS que
ele não tem): o que vale só para JS está marcado abaixo. Valores e presença de regra foram
conferidos contra os XMLs; a descrição de cada ID é do catálogo do Sonar e deve ser reconferida no
servidor.

## JavaScript / TypeScript

| Limite | Valor | Regra | Em |
|---|---|---|---|
| Complexidade cognitiva por função | 15 | S3776 (Critical) | JS e TS |
| Parâmetros por função | 7 | S107 | JS e TS |
| Linhas por arquivo | 1000 | S104 | só JS |
| Aninhamento | 3 | S134 (Critical) | só JS |
| Linhas por função | 200 | S138 | só JS |
| Complexidade ciclomática | 10 | S1541 (Critical) | só JS |
| Operadores booleanos por expressão | 3 | S1067 (Critical) | só JS |
| String literal repetida | 3 ocorrências viram constante | S1192 (Critical) | só JS |

- **Nomes:** classe e tipo `^[A-Z][a-zA-Z0-9]*$` (S101, JS e TS); função `^[_a-z][a-zA-Z0-9]*$`
  (S100) e variável camelCase ou `UPPER_SNAKE` com 2+ caracteres (S117), **só em `.js`** — em `.tsx`
  o componente PascalCase em função não é acusado.
- **Proibido:** `var` (S3504, Critical), `TODO`/`FIXME` (S1135, S1134), código comentado (S125),
  `eval` e código dinâmico (S1523, hotspot), senha hardcoded (S2068, Blocker); `console` (S106, só JS).
- **Comparação estrita** (`===`/`!==`): S1440, **só JS** (confirmar no servidor); em TS vale o
  `eqeqeq` do ESLint. O S888 do perfil é outra regra (condição de término de laço `for`).
- **Tabnapping:** link externo com `target="_blank"` leva `rel="noopener noreferrer"` (S5148 —
  *Security Hotspot* Minor em JS, TS e Web: não bloqueia o gate, exige revisão).
- **Tamanho de arquivo web:** o limite de 1000 linhas é convenção da biblioteca; o Sonar só o impõe
  em `.js`. Em TS e HTML vale a revisão.
- **URI absoluta em HTML:** convenção da biblioteca (caminho relativo ou injetado por configuração);
  nenhum perfil exportado tem a regra (o antigo S1829 não consta), então a verificação é por revisão.
- **React:** `key` em lista, componente não aninhado, contexto sem objeto criado inline (S6477,
  S6478, S6481).
- **Acessibilidade:** o JSX não tem regra de acessibilidade nos perfis JS e TS; ela vem do perfil
  Web (abaixo) e do `addon-a11y`/`axe` das coleções.

### Conflitos conhecidos com as coleções (só arquivos `.js`)

- S3524 exige arrow function sem parênteses no parâmetro único (`x => …`), e o Prettier das
  coleções usa `(x) => …`. Código novo é TypeScript; em `.js` (config, scripts) ajuste o Prettier.
- S1067 (3 operadores) pode acusar `a && b && c && <X />` em JSX: extrair para variável nomeada.
- S106 acusa qualquer `console.*`; o `no-console` do Next.js admite `warn`/`error`
  (`nextjs/coding-standards.md`).

## CSS e HTML

- **CSS:** perfil de validade (cor, fonte, unidade, propriedade e seletor desconhecidos); não duplicar
  propriedade no bloco. O perfil **não** tem regra de `!important`: ele continua proibido, exceto
  override justificado de biblioteca externa, por convenção de revisão. O S4653 do perfil é de
  validade de CSS, não de `!important`. O Sonar tolera `::ng-deep`; o Angular o proíbe.
- **HTML (Web):** `DoctypePresenceCheck` e `PageWithoutTitleCheck` (podem acusar template parcial de
  componente Angular: confirmar no servidor), `ImgWithoutAlt` e as regras de acessibilidade de
  template (S6807 a S6853).

## YAML e XML

- **YAML:** linha até 500 caracteres, no máximo 2 linhas em branco, indentação consistente com
  sequências indentadas, `unix` newlines, comentário com espaço depois de `#`; chave duplicada é
  Major e erro de parsing é Blocker. `Truthy` com `check-keys=true` acusa a chave `on:` de workflow
  de CI (Minor).
- **XML:** linha até 180 caracteres e indentação de 4 espaços (S103, S1120). As regras de `pom.xml`
  do perfil estão em `backend/java/sonarqube.md`.

## Perfil e configuração da análise

- O projeto no SonarQube usa o perfil `Banestes_way` **desde o primeiro commit**, não quando o código
  já cresceu. A configuração do scanner fica versionada no repositório e o perfil não é alterado nem
  desativado por projeto.
- Exclusão de análise só para código gerado, dependências e saída de build, e é revisada como código.
- Todo *Security Hotspot* do código novo é revisado (seguro ou corrigido) antes do merge.
- Falso positivo é marcado **no servidor**, com justificativa; supressão no código continua proibida.
- **Gate e cobertura:** o gate de código novo é o configurado no **servidor**; a biblioteca não fixa
  limiar numérico. A cobertura é gerada pelo teste (`jest --coverage` ou equivalente) e lida pelo
  Sonar no formato `lcov`.

### `sonar-project.properties` de referência

```properties
sonar.projectKey=<sistema>
sonar.sources=src
# YAML e XML fora de src (esteira, manifestos) só são analisados se o caminho entrar em sonar.sources
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts
sonar.exclusions=dist/**,coverage/**
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.stories.tsx,**/mocks/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.tsconfigPaths=tsconfig.json
```

`sonar.exclusions` só tira da análise código gerado, dependência e saída de build (revisado como
código). Arquivo classificado como teste (`sonar.test.inclusions`) recebe só as regras de teste, não
as do código principal (confirmar no servidor); story e mock entram como código principal e sofrem
os mesmos limites (S104, S3776), e saem apenas da métrica de cobertura
(`sonar.coverage.exclusions`). Ajuste os caminhos ao sistema.

## Regras de ouro para a IA

- Nunca suprimir alerta com comentário/anotação — corrigir estruturalmente.
- Assumir `===`, funções pequenas (≤ 15 de complexidade, ≤ 7 parâmetros), `const`/`let` e nada de
  `TODO` ou código comentado no commit.

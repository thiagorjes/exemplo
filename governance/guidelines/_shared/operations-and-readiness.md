# Operação e Prontidão (transversal)

> O que precisa estar de pé para a aplicação subir, ser sondada e ser validada no ambiente real.
> Agnóstico de stack; a configuração concreta (probes do Actuator, rota de saúde do Next.js) fica em
> `backend/<stack>/spring-boot.md` ou `frontend/<stack>/`. Segredos em log e dado pessoal:
> [`logging-and-levels.md`](logging-and-levels.md) e [`data-protection.md`](data-protection.md).
> Identidade (RH-SSO): [`identity-rhsso.md`](identity-rhsso.md).

## 1. Sondas de vida e prontidão

- **Liveness** responde "o processo está vivo" e não consulta dependência externa. **Readiness**
  responde "pode receber tráfego" e exercita a **configuração obrigatória**: variável ausente,
  emissor OIDC que não responde ao documento de descoberta, adaptador sem implementação.
- Readiness que falha responde **503** e devolve **o que falta ou está inválido**, pelo nome
  (`OIDC_ISSUER`, `SESSION_SECRET`), nunca pelo valor. Nome de variável de ambiente é válido para o
  sistema operacional e para o manifesto (letras, dígitos e `_`, sem começar por dígito).
- A rota de saúde **não é servida de cache nem pré-renderizada** no build: cada chamada executa a
  verificação (`no-store`; no Next.js, rota dinâmica). Senão a sonda responde `200` do artefato sem
  exercitar a configuração. A readiness **pode guardar o resultado por poucos segundos** (≤ 5 s),
  num cache em memória que expira sozinho, para a sonda não martelar o provedor de identidade a
  cada chamada; isso não viola a regra acima, porque a verificação continua rodando a cada janela
  e nada vem do build nem de cache HTTP. A liveness não guarda nada.
- **Nomes e encerramento.** Quando a stack é o BFF Node (`frontend/_shared/spa-bff.md` §7), as
  rotas são `/healthz` (liveness) e `/readyz` (readiness). Ao receber o sinal de encerramento
  (`SIGTERM`, *drain*), a readiness passa a responder `503` **antes** de o processo parar de
  aceitar conexão, para o tráfego sair do pod; a liveness segue `200` até o fim.
- Se a stack expõe **uma rota única**, ela é a readiness; a liveness aponta para outra rota ou não
  verifica configuração, para que configuração inválida não reinicie o pod em laço. Rota que a
  `Route` expõe e que lista nomes de variável precisa do aval da segurança da informação. A porta de
  gestão do Java, que a `Route` não expõe, não tem esse risco; na exceção de porta única
  (`backend/java/spring-boot.md`, Observabilidade) a `Route` é restrita ao
  prefixo da API e uma *NetworkPolicy* limita a entrada, e então os detalhes ficam dentro do cluster.
- As duas rotas são **públicas**: sem autenticação **e sem redirecionamento**. Sonda que cai no
  redirect para o login "passa" (`302` é resposta) e esconde que a aplicação não está pronta. A rota
  de saúde é isenta de middleware, proxy de autenticação, guard de rota e do `401 → login` do BFF
  (ver `frontend/_shared/spa-bff.md`).
- Teste com o servidor real e a autenticação ligada: a sonda responde sem credencial e sem `3xx`.
- Porta e endereço de escuta são **configurados explicitamente**, não herdados do padrão do
  framework: a plataforma injeta variáveis (como o nome do pod no `HOSTNAME`) que mudam onde o
  processo escuta e fazem a sonda falhar. O valor é declarado **num único lugar, documentado**, e é
  o mesmo em qualquer forma de build (imagem, buildpack, Dockerfile). A biblioteca não fixa o número:
  o sistema de referência do Next.js usa `8080`.
- Configuração inválida é detectada na **subida**, não na primeira requisição (ver
  [`architecture-principles.md`](architecture-principles.md)): a aplicação não sobe (falha rápido) ou
  sobe e a readiness responde `503` listando o que falta. Nunca fica "pronta" com configuração
  inválida.

## 2. O artefato que se valida é o da esteira

- Build local e servidor de desenvolvimento **não são prova**: o que vale é o artefato construído pela
  esteira corporativa, executando no ambiente-alvo, atrás do proxy/ingress real.
- A **primeira entrega** de um sistema é um incremento implantável mínimo — sonda, uma rota
  autenticada, a integração de identidade — colocado no ambiente-alvo **antes** de acumular
  funcionalidade. O defeito que só existe em produção (URL montada com o endereço interno, cookie
  descartado, variável da plataforma) aparece na primeira requisição real, e custa mais quanto mais
  tarde.
- Toda promoção a homologação registra: versão do artefato, ambiente e resultado da primeira
  requisição real.
- **Fonte única.** Toda alteração feita para viabilizar o build ou a implantação mora no repositório
  do sistema e passa pela mesma revisão do código. Ajuste feito só na cópia do pipeline ou direto no
  cluster não conta como entregue. A exceção é o **valor** de homologação e produção, que é do
  ambiente (§2.2): o repositório fixa as chaves e os requisitos pedidos à plataforma.
- **Dono de cada objeto de implantação.** O repositório mantém só o que o pipeline não gera
  (`ConfigMap`, `Secret` e, quando houver, `CronJob`), na pasta `configuration/` (§2.2);
  `Deployment`, `Service` e `Route` vêm do template da esteira. O mesmo objeto nunca é definido nos
  dois lugares.
- **Configuração por ambiente fora do build.** Valores que mudam por ambiente (host, emissor) ficam no
  `ConfigMap` do ambiente, nunca no código nem na imagem, e o build não depende deles: a validação
  roda na subida, não ao importar o módulo durante o `build` (que roda sem `ConfigMap`).

### 2.1 Passos mínimos da esteira

A esteira de qualquer sistema — backend ou frontend — roda, nesta ordem, e falha no primeiro passo
que falhar:

1. **Build reprodutível** a partir do lockfile e da versão de runtime fixada, com a versão
   principal coerente entre arquivo de versão, manifesto do pacote e imagem. Scripts de build e
   de execução são portáveis entre sistemas operacionais (SHOULD): sem sintaxe de shell POSIX.
2. **Análise estática** (lint e checagem de tipos) e **formatação** sem diferença.
3. **Testes** de unidade e de componente/integração, com **relatório de cobertura** gerado.
4. **SCA** sobre dependências diretas e transitivas (ver
   [`vulnerable-and-proprietary-libs.md`](vulnerable-and-proprietary-libs.md)); waiver lido do
   registro legível por máquina, vencido volta a bloquear.
5. **Varredura de segredos** sobre a árvore **e o histórico** (§5).
6. **Licença** das dependências contra a lista aprovada e **SBOM** do artefato.
7. **SonarQube** com o perfil `Banestes_way`; o gate de código novo é o do servidor.
8. **Checagem do artefato** construído: o que não pode estar nele não está (frontend: sem source
   map público, sem segredo em variável embutida no build, sem biblioteca de mock ou de
   desenvolvimento; backend: sem H2, sem perfil de desenvolvimento ativo).
9. **Teste do artefato no ambiente-alvo** (§2): sonda respondendo `200`, um login completo
   concluído e a página carregando CSS e JS.

A ferramenta de cada passo e o formato do arquivo de esteira são os da esteira corporativa
(`backend/java/stack.md` lista o Pipeline OCP4 do backend). Quando a esteira do
frontend for outra, o sistema registra qual é, e os passos acima valem do mesmo jeito.

**Implantação com banco.** Na esteira corporativa (Jenkins) a implantação segue a ordem
`ConfigMap`s → **migração do banco** (passo "Migrar BD", ligado por `AUTOMATIZA_BD=Y`, com o usuário
da esteira) → deploy. Migração que falha para a esteira antes do deploy. A aplicação não migra o
banco ao subir nos ambientes implantados. Regras do passo, do usuário e do que só o DBA cria:
`backend/java/database.md` §1.

### 2.2 Configuração versionada (convenção institucional)

- **Pasta e nome.** Os objetos que o repositório mantém ficam em `configuration/<tipo>/<app>.yml` na
  raiz, onde `<app>` é o nome da aplicação: `configuration/configmap/<app>.yml` e
  `configuration/secret/<app>.yml`; outro objeto que o pipeline não gera segue o mesmo padrão (ex.:
  `configuration/cronjob/<app>.yml` para o job agendado). Mais de um objeto do mesmo tipo (ex.: dois
  CronJobs) fica no **mesmo** arquivo do tipo, separado por `---`, cada um com `metadata.name`
  `<app>-<função>`. O nome do arquivo, o `metadata.name`, o rótulo `app`, o cliente no RH-SSO e o
  host da rota levam o mesmo nome (§3).
- **Sem segregação por ambiente.** Só os arquivos do ambiente de **desenvolvimento** ficam no
  repositório, junto do código; homologação e produção são configurados **fora do repositório**, no
  ambiente, com as mesmas chaves. Não há pasta por ambiente (`deploy/openshift/<ambiente>/`),
  overlay, `kustomization` nem `oc apply -k`.
- **Gerados pelo pipeline.** `Deployment`, `Service` e `Route` não têm manifesto no repositório. Os
  requisitos deles (porta e sondas, recursos, réplicas e estratégia de implantação, host fixo,
  `spec.path` restrito e timeout da `Route`, alertas, *NetworkPolicy*, CA confiável) são
  documentados como **pedido à plataforma** (§4), no registro versionado do sistema.
- **Chaves como variáveis.** O pipeline liga o `ConfigMap` e o `Secret` ao `Deployment` por
  `envFrom`: toda chave é nome válido de variável de ambiente (§1; sem ponto). Arquivo de
  configuração não vai como chave-arquivo nem como volume, e não há segundo `ConfigMap` montado. O
  arquivo público que o servidor entrega (o `config.json` da SPA) vem de uma variável (ex.:
  `SPA_CONFIG_JSON`), lida e servida pelo servidor ou BFF, com `{}` como padrão
  (`frontend/_shared/spa-bff.md` §4, da coleção de frontend).

## 3. Nomes acoplados

Nomes que precisam coincidir entre o objeto de implantação e um cadastro externo (client id, redirect
URI, host da rota, nome do secret, nome do `configmap`) ficam em **um único registro versionado do
sistema**, com o ambiente de cada um. Renomear um sem o outro quebra em produção sem erro de build.

- O `ConfigMap` e o `Secret` da aplicação têm o **nome da aplicação**, o mesmo do arquivo em
  `configuration/` (§2.2): é por ele que o template da esteira os liga ao `Deployment` e lê as
  variáveis do passo de migração (`DATABASE_URL`, `DATABASE_SCHEMAS`). Em homologação e produção, os
  objetos configurados no ambiente levam o mesmo nome.
- O host da `Route` é **fixado** com o valor da origem pública (sem `https://`), pedido à plataforma
  (a `Route` é gerada pelo pipeline, §2.2) e conferido depois do deploy
  (`oc get route <app> -o jsonpath='{.spec.host}'`); o padrão de host do cluster de
  desenvolvimento é `<app>-<namespace>.apps.ioc.nonprod.bcloud.sfb`. Host divergente quebra o login
  ([`identity-rhsso.md`](identity-rhsso.md) §4).
- Operação que pode passar do timeout padrão do roteador (30 s), como gerar relatório, leva a
  anotação `haproxy.router.openshift.io/timeout` na `Route` (ex.: `120s`), pedida junto do host;
  sem ela o roteador corta a resposta enquanto a aplicação ainda trabalha.
- Valor que falta conhecer (namespace ainda não informado) fica como marcador `TROCAR-*`, e a
  checagem dos manifestos o acusa (§5).

## 4. Pedidos de infraestrutura

Dependência que outra equipe atende (rota, secret, cadastro do client no RH-SSO, banco, permissão de
rede, acesso a repositório de pacotes, usuário de serviço) é levantada **na primeira especificação**
e aberta **no primeiro dia**, não quando a tarefa a exige. No banco, o que a migração da esteira não
cria (banco, schema, usuário da aplicação, trigger) e o backup antes de migration nova são pedidos
aos DBAs (`backend/java/database.md` §1); o cadastro das permissões é a IEP
([`identity-rhsso.md`](identity-rhsso.md) §1). Os requisitos de `Deployment`, `Service` e `Route`,
que o pipeline gera (§2.2), também são pedido à plataforma, com o valor esperado de cada um.

- O registro é versionado no repositório do sistema e cada pedido traz: o que se pede, quem atende,
  a resposta esperada (**sim**, **não** ou **um valor**), o que ele bloqueia, a data do pedido e o
  prazo de escalonamento.
- Pedido em aberto que bloqueia o plano é **pendência**, e a feature não passa do plano com ele.
- Contorno provisório (cadastro local no lugar do diretório corporativo, réplica única) é exceção
  registrada com **prazo** e condição de saída, aprovada por quem tem alçada.

## 5. Segredos e configuração local

- **Estrutura × valor.** O repositório é dono da **estrutura** do `Secret` (nome e chaves) e o
  ambiente é dono do **valor**. Só o `Secret` de desenvolvimento tem arquivo
  (`configuration/secret/<app>.yml`, §2.2); o de homologação e o de produção são criados e mantidos
  **no ambiente**, fora do repositório, com o mesmo nome e as mesmas chaves. Nenhum arquivo do
  repositório leva valor de homologação ou produção, nem como placeholder.
- **Uma fonte do valor por ambiente:** em desenvolvimento, o arquivo versionado, aplicado pelo
  pipeline (a troca de valor é commit nele); em homologação e produção, o secret criado diretamente
  no cluster **ou** injetado pela esteira a partir do cofre de credenciais dela, nunca os dois, e
  nunca reaplicado a partir de arquivo (a troca usa `oc set data` ou a rotação documentada). O
  sistema registra a fonte de cada ambiente.
- **Conexão com banco.** A URL de conexão, sem credencial, e os schemas ficam no `ConfigMap`
  (`DATABASE_URL`, `DATABASE_SCHEMAS`; em desenvolvimento, `configuration/configmap/<app>.yml`);
  usuário e senha ficam no `Secret`, nunca no `ConfigMap` nem na URL.
- **Verificação dos manifestos.** Um passo automático da esteira reprova, em `configuration/`:
  `stringData`; `kind: Secret` fora de `configuration/secret/`; arquivo cujo nome ou
  `metadata.name` não seja o nome da aplicação; chave que não seja nome válido de variável de
  ambiente; pasta por ambiente ou `kustomization`. Ele também acusa o marcador `TROCAR-*` que resta,
  **decodificando o base64**: a readiness só vê variável preenchida, não marcador, e sem essa
  checagem o erro só aparece como falha de autenticação na primeira requisição real.
- **Desenvolvimento.** Com o repositório **privado**, o `configuration/secret/<app>.yml` leva os
  **valores reais de dev**, em `data:` base64 (base64 não é cifra) e sem `stringData`, desde que
  cada credencial seja **exclusiva e descartável** de dev (nunca a mesma de homologação ou produção)
  e sem dado real; valor que ainda não existe fica com o marcador `TROCAR-*`. A varredura de segredos
  tem **uma única exceção versionada** no repositório: o caminho exato
  `configuration/secret/<app>.yml` (nem a pasta inteira, nem padrão mais amplo). O `AGENTS.md` e a
  constituição do sistema registram essa exceção **explicitamente**, senão a regra geral "nunca
  grave segredo em commit" a contradiz. Se o repositório deixar de ser privado ou a credencial vazar
  fora do dev, ela é rotacionada como qualquer segredo exposto (24 h).
- Arquivo local (`.env*`, `application-local.*`) fica fora do git, e o padrão de ignore é conferido
  **por comando** contra o nome literal do arquivo (`git check-ignore -v <arquivo>`); padrão que "deveria
  cobrir" já deixou `.env` versionado.
- O pipeline roda **varredura de segredos** sobre a árvore e sobre o histórico do repositório.
- Segredo exposto — mesmo só no histórico — é **rotacionado em até 24 horas** da descoberta, com
  registro de quando e por quem. Reescrever o histórico não substitui a rotação.
- Credencial que passou por chat, e-mail ou ticket (ex.: a senha entregue pelo DBA) conta como
  exposta, inclusive a de dev: o dono dela a rotaciona depois do uso inicial e a nova vai direto
  para o `Secret` (em dev, o arquivo versionado), com registro.
- Teste automatizado nunca lê configuração local de desenvolvimento por padrão.

## 6. Efeito assíncrono e transição observáveis

- Transição de estado do negócio, negação de autorização e falha de integração ou de notificação
  geram **evento observável** (log estruturado com `correlationId` e métrica).
- Efeito do qual o fluxo depende (notificação ao gestor, mensagem, chamada a outro sistema) que falha
  fica **registrado e recuperável** (reprocessável ou com alerta); falha silenciosa é defeito.
- Um teste fixa o comportamento: falha do efeito não some, e o fluxo principal responde como a
  especificação diz.

---

## Checklist

- [ ] Liveness e readiness públicas, sem autenticação e sem redirecionamento, testadas com autenticação ligada
- [ ] Readiness responde `503` listando o que falta ou está inválido pelo nome, sem valor; não é servida de cache (resultado guardado em memória por ≤ 5 s é aceito); configuração inválida nunca deixa a aplicação "pronta"
- [ ] BFF Node: `/healthz` e `/readyz`; readiness responde `503` durante o encerramento (`SIGTERM`)
- [ ] Porta e endereço de escuta explícitos, num único lugar documentado, iguais em qualquer forma de build
- [ ] Config de build e implantação só no repositório; valor por ambiente fora do build
- [ ] `ConfigMap`, `Secret` e demais objetos que o pipeline não gera em `configuration/<tipo>/<app>.yml`, só de desenvolvimento, sem pasta por ambiente, overlay nem `kustomization`; `Deployment`, `Service` e `Route` sem manifesto, com os requisitos pedidos à plataforma
- [ ] Chaves do `ConfigMap` e do `Secret` como variáveis de ambiente (`envFrom`, sem ponto); `config.json` servido de variável (padrão `{}`), sem chave-arquivo nem volume
- [ ] Uma fonte do valor do secret por ambiente, registrada; `Secret` de hml e prod só no ambiente, nunca reaplicado de arquivo
- [ ] Verificação dos manifestos reprova `stringData`, `kind: Secret` fora de `configuration/secret/`, nome diferente do da aplicação, chave inválida e pasta por ambiente; acusa `TROCAR-*` (inclusive em base64)
- [ ] Valor de segredo no git só em `configuration/secret/<app>.yml` (dev, `data:` base64), em repositório privado, com credencial exclusiva e descartável de dev; exceção da varredura só para esse caminho, registrada no `AGENTS.md` e na constituição
- [ ] Artefato da esteira validado no ambiente-alvo; primeira requisição real registrada na promoção
- [ ] Esteira com os passos mínimos da §2.1, na ordem, falhando no primeiro que falhar; com banco, `ConfigMap`s → "Migrar BD" → deploy, sem migração na subida da aplicação
- [ ] Nomes acoplados (implantação × cadastro externo) num registro único; arquivo, `ConfigMap`, `Secret` e rótulo `app` com o nome da aplicação; host da `Route` pedido igual à origem pública e conferido; timeout da `Route` pedido para operação longa
- [ ] URL do banco e schemas no `ConfigMap`, usuário e senha no `Secret`; credencial que passou por chat ou ticket rotacionada
- [ ] Pedidos de infraestrutura abertos no primeiro dia, com resposta esperada, bloqueio e prazo de escalonamento
- [ ] `git check-ignore` do arquivo local; varredura de segredos no CI (árvore e histórico)
- [ ] Segredo exposto rotacionado em até 24 h, com registro
- [ ] Falha de efeito assíncrono gera evento e é recuperável; teste cobre

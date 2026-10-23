# Autenticação e Autorização — Backend Python

> Condicional da coleção. Materializa [`../../_shared/api-security.md`](../../_shared/api-security.md)
> neste backend. Decisão: [ADR-008](../../../../docs/decisions/ADR-008-keycloak-identidade-e-papeis.md).
> Uso em gate: [`flow-contracts.md`](flow-contracts.md) §6.

## 1. A API não é provedor de identidade

A API é **resource server** OIDC. Ela valida token; não emite, não guarda senha, não implementa
recuperação de conta, não tem tabela de credencial.

- Validação por **JWKS** buscado do Keycloak, com cache e rotação automática de chave. Chave
  pública fixada em configuração quebra na primeira rotação.
- Verificação obrigatória de assinatura, `iss`, `aud`, `exp` e `nbf`. Aceitar token sem checar
  `aud` transforma qualquer token do realm em token da nossa API.
- Relógio: tolerância de *skew* pequena e explícita, não um valor generoso "para não dar problema".

## 2. Papel é decisão de negócio, não de rota

Papéis vêm de *realm roles* no token e são traduzidos para um tipo do domínio na borda.

- A autorização de uma ação acontece no **serviço**, onde a regra vive — "quem pode aprovar este
  gate" depende do gate, não do caminho da URL. Decorator em rota só resolve o caso trivial.
- `dependencies.py` extrai e valida a identidade; ele **não** decide permissão de negócio.
- Papel ausente ou desconhecido é negação, nunca default permissivo.
- Toda negação é testada. Rota nova sem teste de negação não passa na DoD
  ([`definition-of-done.md`](definition-of-done.md)).

## 3. Gate humano

- O `flow.yaml` declara o papel aprovador da etapa. A aprovação é aceita apenas de quem tem aquele
  papel efetivo no momento da decisão — tech lead não aprova no lugar de gestor de negócio.
- A decisão registra `sub`, papel efetivo, horário, commit avaliado e justificativa, de forma
  **imutável**. Registro de gate não é atualizável nem apagável pela aplicação.
- Auto-aprovação da própria execução é negada quando o fluxo declarar segregação de função.

## 4. Fronteira com o plano de execução

- Token de usuário **nunca** entra no bundle, no `mcp.json`, em variável de ambiente de etapa ou em
  prompt. Container de etapa não alcança o Keycloak.
- Etapa não tem identidade de usuário. Ela tem credencial de serviço, escopada e de vida curta
  ([`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §5).
- Token nunca é registrado em log, span ou mensagem de erro, nem parcialmente.

## 5. Front-end e sessão

- Authorization Code + PKCE. Sem *implicit flow*.
- Token de acesso fora de `localStorage`; refresh em cookie `HttpOnly`, `Secure`, `SameSite`.
- Expiração curta no token de acesso. Sessão longa é responsabilidade do refresh, não de um `exp`
  generoso.

## 6. Configuração do realm

- Clients, roles e mappers são **exportados e versionados em Git**. Realm configurado à mão é
  estado não reproduzível, e a diferença aparece só em produção.
- Cliente da API é confidencial, sem *direct access grants*.
- Nenhum segredo de client no repositório — injetado em tempo de execução.

---

## Checklist

- [ ] API valida por JWKS com rotação; `iss`, `aud`, `exp` verificados
- [ ] Autorização de negócio no serviço, não na rota; negação testada
- [ ] Papel ausente é negação, nunca default permissivo
- [ ] Gate aceita só o papel declarado; decisão imutável com `sub`, horário e commit
- [ ] Token de usuário fora de bundle, ambiente de etapa, prompt e log
- [ ] PKCE no front; sem token de acesso em `localStorage`
- [ ] Realm exportado e versionado; segredo de client fora do repositório

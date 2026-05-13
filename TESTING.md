# 🧪 Guia de Testes

Este arquivo contém cenários de teste e validações para o add-in.

## Teste 1: Validar Carregamento do Add-in

**Cenário**: Abrir Outlook e verificar se o add-in está visível

```
Pré-requisitos:
- Add-in sideloaded em Outlook
- Servidor rodando em HTTPS

Passos:
1. Abrir Outlook Web ou Desktop
2. Abrir uma mensagem de reunião
3. Procurar a faixa de opções "Monitoramento"
4. Verificar botão "Marcar Reunião Pública"

Resultado Esperado:
✓ Botão visível com ícone de bandeira vermelha
✓ Ao passar o mouse, tooltip aparece
✓ Ícone tem tamanho adequado (não pixelado)
```

## Teste 2: Carregar Dados da Reunião

**Cenário**: Verificar se informações da reunião carregam corretamente

```
Pré-requisitos:
- Reunião com todos os campos preenchidos

Passos:
1. Abrir uma reunião com:
   - Assunto: "Reunião de Planejamento Q2"
   - Data: 13/05/2026 10:00
   - Organizador: responsavel@company.com
   
2. Clicar no botão "Marcar Reunião Pública"
3. Verificar se painel de tarefas abre
4. Observar os dados carregados

Resultado Esperado:
✓ Assunto exibido corretamente
✓ Data e hora formatadas em pt-BR
✓ Email do organizador visível
✓ ID da reunião não vazio
✓ Sem mensagens de erro no console
```

## Teste 3: Enviar Dados para Power Automate

**Cenário**: Validar se JSON é enviado corretamente

```
Pré-requisitos:
- Power Automate fluxo ativo
- URL do webhook válida

Passos:
1. Abrir painel de tarefas
2. Clicar em "Marcar como Pública"
3. Aguardar resposta (indicador de carregamento)
4. Verificar console F12 > Network

Resultado Esperado:
✓ Requisição POST para Power Automate
✓ Status 200 OK retornado
✓ JSON enviado contém:
  - meetingId (não vazio)
  - subject (não vazio)
  - userId (email)
  - dateTime (ISO 8601)
  - action = "mark_as_public"
```

## Teste 4: Alteração de Ícone

**Cenário**: Verificar mudança visual após sucesso

```
Pré-requisitos:
- Fluxo Power Automate respondendo com sucesso

Passos:
1. Clicar em "Marcar como Pública"
2. Aguardar resposta positiva
3. Observar visual do botão

Resultado Esperado:
✓ Ícone muda para bandeira verde
✓ Texto muda para "✅ Reunião Marcada como Pública"
✓ Botão fica desabilitado (cinza)
✓ Mensagem de sucesso exibida
```

## Teste 5: Mensagem de Confirmação

**Cenário**: Validar feedback do usuário

```
Pré-requisitos:
- Fluxo configurado para enviar email

Passos:
1. Executar a ação de marcar como pública
2. Aguardar confirmação no painel
3. Verificar caixa de entrada do email

Resultado Esperado:
✓ Mensagem em azul aparece no painel
✓ Texto: "Sucesso! A reunião foi marcada..."
✓ Email de confirmação recebido (5 min)
✓ Email contém informações da reunião
```

## Teste 6: Tratamento de Erros

**Cenário**: Validar comportamento em caso de erro

```
Pré-requisitos:
- URL do Power Automate inválida

Passos:
1. Modificar URL para algo inválido
2. Clicar em "Marcar como Pública"
3. Aguardar resposta

Resultado Esperado:
✓ Mensagem de erro em vermelho aparece
✓ Botão permanece habilitado
✓ Usuário pode tentar novamente
✓ Console mostra erro detalhado
```

## Teste 7: Reunião sem Informações

**Cenário**: Testar com mensagens que não são reuniões

```
Pré-requisitos:
- Nenhum (testar com email comum)

Passos:
1. Abrir um email comum (não reunião)
2. Procurar pelo add-in

Resultado Esperado:
✓ Add-in não aparece na faixa de opções
OU
✓ Se aparecer, exibe erro ao carregar dados
✓ Mensagem clara: "Nenhuma reunião selecionada"
```

## Teste 8: Persistência de Estado

**Cenário**: Verificar se estado é mantido na sessão

```
Pré-requisitos:
- Reunião já marcada como pública

Passos:
1. Fechar e reabrir o painel de tarefas
2. Verificar estado do botão

Resultado Esperado:
✓ Botão permanece verde
✓ Mensagem de sucesso é mantida
✓ Botão continua desabilitado
```

## Teste 9: Múltiplas Reuniões

**Cenário**: Testar com diferentes reuniões

```
Pré-requisitos:
- Múltiplas mensagens de reunião

Passos:
1. Abrir reunião A, marcar como pública
2. Abrir reunião B, marcar como pública
3. Voltar para reunião A, verificar estado
4. Abrir reunião B novamente

Resultado Esperado:
✓ Cada reunião mantém seu próprio estado
✓ Não há confusão entre IDs
✓ Histórico separado para cada reunião
```

## Teste 10: Performance

**Cenário**: Validar tempo de resposta

```
Pré-requisitos:
- Servidor respondendo

Passos:
1. Clicar no botão
2. Medir tempo até resposta (F12 > Network)

Resultado Esperado:
✓ Tempo de resposta < 3 segundos
✓ Usuário não vê freezing
✓ Indicador de carregamento visível
```

## Teste 11: Compatibilidade com Navegadores

**Cenário**: Testar em diferentes navegadores

```
Testado em:
- [ ] Chrome/Edge (Windows)
- [ ] Safari (Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Outlook Desktop (Windows)
- [ ] Outlook Desktop (Mac)

Resultado Esperado:
✓ Funcionalidade consistente
✓ Estilos bem renderizados
✓ Sem erros no console
```

## Teste 12: Segurança

**Cenário**: Validar transmissão segura de dados

```
Pré-requisitos:
- HTTPS ativado

Passos:
1. F12 > Network > Marcar como pública
2. Clicar em requisição POST
3. Verificar protocolo e criptografia

Resultado Esperado:
✓ Protocolo: HTTPS (verde)
✓ Status 200 OK
✓ Dados enviados criptografados
✓ Sem dados sensíveis em logs
```

## JSON de Teste para Postman

```json
{
  "meetingId": "AAMkADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM=",
  "subject": "Reunião Crítica de Segurança",
  "userId": "joao.silva@company.com",
  "userEmail": "joao.silva@company.com",
  "dateTime": "2026-05-13T10:00:00Z",
  "organizer": "maria.santos@company.com",
  "timestamp": "2026-05-13T10:30:00Z",
  "action": "mark_as_public"
}
```

## Checklist de Testes Finais

Antes de colocar em produção:

- [ ] Teste 1 - Carregamento OK
- [ ] Teste 2 - Dados carregam OK
- [ ] Teste 3 - JSON enviado OK
- [ ] Teste 4 - Ícone muda OK
- [ ] Teste 5 - Confirmação recebida OK
- [ ] Teste 6 - Erros tratados OK
- [ ] Teste 7 - Email comum tratado OK
- [ ] Teste 8 - Estado persistente OK
- [ ] Teste 9 - Múltiplas reuniões OK
- [ ] Teste 10 - Performance OK
- [ ] Teste 11 - Compatibilidade OK
- [ ] Teste 12 - Segurança OK

## Reportar Bugs

Se encontrar algum problema:

1. Abra o Developer Console (F12)
2. Reproduza o erro
3. Copie as mensagens de log
4. Verifique o histórico do Power Automate
5. Documente o cenário
6. Crie um relatório de bug com:
   - Passos para reproduzir
   - Resultado esperado
   - Resultado observado
   - Screenshots/logs
   - Ambiente (navegador, versão)

---

**Sucesso nos testes! 🎉**

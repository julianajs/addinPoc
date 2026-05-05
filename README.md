# Outlook Add-in - Classificação de Reunião Crítica

Pacote enterprise sem integração SharePoint.

## Arquivos

- `manifest.xml`
- `taskpane.html`
- `commands.html`
- `commands.js`
- `index.html`
- `assets/icon-16.png`
- `assets/icon-32.png`
- `assets/icon-64.png`
- `assets/icon-80.png`
- `assets/icon-128.png`

## URL configurada

https://kind-dune-04677490f.7.azurestaticapps.net

## Como publicar

1. Suba todos os arquivos para a raiz do repositório GitHub.
2. Aguarde o GitHub Actions do Azure Static Web Apps concluir com sucesso.
3. Teste:
   - https://kind-dune-04677490f.7.azurestaticapps.net/taskpane.html
   - https://kind-dune-04677490f.7.azurestaticapps.net/commands.html
4. Instale ou reinstale o `manifest.xml` no Outlook.

## Comportamento

- O botão aparece ao criar/editar reuniões.
- O painel permite classificar a reunião como crítica.
- Se crítica = Sim, exige:
  - Nível da criticidade
  - Nome da criticidade
  - Entidade crítica
- No envio da reunião, o evento `OnAppointmentSend` bloqueia caso os campos obrigatórios não estejam preenchidos.

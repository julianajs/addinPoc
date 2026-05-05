# Outlook Add-in - Reunião Crítica

Pacote final com chamada para Power Automate Flow.

## Publicação
1. Extraia este ZIP.
2. Suba todos os arquivos para a raiz do repositório GitHub.
3. Aguarde o deploy do Azure Static Web Apps.
4. Teste https://kind-dune-04677490f.7.azurestaticapps.net/taskpane.html
5. Reinstale o manifest.xml no Outlook/Admin Center.

## Inclui
- chamada POST para Power Automate
- mode: "cors"
- staticwebapp.config.json com connect-src para Power Platform
- validação obrigatória no envio

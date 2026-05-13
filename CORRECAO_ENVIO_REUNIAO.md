# Correção: add-in não deve executar ao enviar reunião

## Problema observado
Ao clicar em **Enviar** na reunião, o Outlook exibia uma mensagem informando que o suplemento estava processando a mensagem. Esse comportamento é típico de add-ins configurados com evento de envio, como `ItemSend`, `LaunchEvent`, `OnMessageSend` ou `OnAppointmentSend`.

## Correção aplicada
- O `manifest.xml` foi revisado e mantido apenas com comandos manuais de abertura do taskpane.
- Não há nenhum gatilho de envio no manifesto corrigido.
- O Power Automate só é disparado por clique manual no botão **Monitorar reunião** dentro do taskpane.
- A versão do add-in foi incrementada para `1.0.1.0` para facilitar a atualização/publicação.

## Atenção ao testar
Se a mensagem continuar aparecendo, provavelmente o Outlook ainda está usando uma versão antiga do add-in em cache ou instalada pelo Centro de Administração. Remova a versão anterior, feche o Outlook, aguarde alguns minutos e instale/publique novamente este manifesto corrigido.

function validarEnvioReuniao(event) {
  const item = Office.context.mailbox.item;

  item.loadCustomPropertiesAsync((result) => {
    if (result.status !== Office.AsyncResultStatus.Succeeded) {
      event.completed({
        allowEvent: false,
        errorMessage: "Não foi possível validar a criticidade da reunião. Abra o botão Reunião Crítica, salve a classificação e tente novamente."
      });
      return;
    }

    const props = result.value;

    const emailCritico = props.get("emailCritico");
    const nivelCriticidade = props.get("nivelCriticidade");
    const nomeCriticidade = props.get("nomeCriticidade");
    const entidadeCritica = props.get("entidadeCritica");

    if (emailCritico === true || emailCritico === "true") {
      if (!nivelCriticidade || !nomeCriticidade || !entidadeCritica) {
        event.completed({
          allowEvent: false,
          errorMessage:
            "Esta reunião foi marcada como crítica. Preencha Nível da Criticidade, Nome da Criticidade e Entidade Crítica antes de enviar."
        });
        return;
      }
    }

    event.completed({ allowEvent: true });
  });
}

Office.actions.associate("validarEnvioReuniao", validarEnvioReuniao);

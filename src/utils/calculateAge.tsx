export const calculateAge = (dataNascimento: Date): string => {
  const hoje = new Date();

  // 1. Calcula a diferença total em dias (usando milissegundos)
  const diferencaTempo = hoje.getTime() - dataNascimento.getTime();
  const totalDias = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

  // 2. Se tiver menos de 30 dias (menos de 1 mês), exibe em dias
  if (totalDias < 30) {
    const dias = Math.max(0, totalDias); // Evita dias negativos se a data for futura
    if (dias === 0) return "Nasceu hoje";
    return dias === 1 ? "1 dia" : `${dias} dias`;
  }

  // 3. Calcula a diferença em meses e anos
  const anosDiferenca = hoje.getFullYear() - dataNascimento.getFullYear();
  const mesesDiferenca = hoje.getMonth() - dataNascimento.getMonth();
  const diasDiferenca = hoje.getDate() - dataNascimento.getDate();

  let totalMeses = anosDiferenca * 12 + mesesDiferenca;
  if (diasDiferenca < 0) {
    totalMeses--;
  }

  // 4. Se tiver menos de 12 meses, exibe em meses
  if (totalMeses < 12) {
    return totalMeses === 1 ? "1 mês" : `${totalMeses} meses`;
  }

  // 5. Caso contrário, exibe em anos
  let idadeAnos = anosDiferenca;
  if (mesesDiferenca < 0 || (mesesDiferenca === 0 && diasDiferenca < 0)) {
    idadeAnos--;
  }

  return idadeAnos === 1 ? "1 ano" : `${idadeAnos} anos`;
};
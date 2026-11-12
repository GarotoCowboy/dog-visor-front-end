export const parseBirthDate = (
  dateInput?: string | Date | null,
): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  const clean = String(dateInput).trim().split("T")[0];
  if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts.length === 3) {
      const d = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0]),
      );
      return isNaN(d.getTime()) ? null : d;
    }
  }
  if (clean.includes("-")) {
    const parts = clean.split("-");
    if (parts.length === 3) {
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]),
      );
      return isNaN(d.getTime()) ? null : d;
    }
  }
  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Limite de idade em meses para um cão ser considerado filhote.
 * Definido em 18 meses (abrangendo a fase de desenvolvimento entre 15 e 18 meses para cães-guia / porte médio e grande).
 */
export const PUPPY_MAX_MONTHS = 18;

/**
 * Calcula no front-end se o cão é Filhote (< 18 meses) ou Adulto (>= 18 meses).
 */
export const isPuppyDog = (
  dateInput?: string | Date | null,
  maxMonths: number = PUPPY_MAX_MONTHS,
): boolean => {
  const birthDate = parseBirthDate(dateInput);
  if (!birthDate) return false;

  const hoje = new Date();
  const diferencaTempo = hoje.getTime() - birthDate.getTime();
  const totalDias = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));
  if (totalDias < 0) return true;

  const anosDiferenca = hoje.getFullYear() - birthDate.getFullYear();
  const mesesDiferenca = hoje.getMonth() - birthDate.getMonth();
  const diasDiferenca = hoje.getDate() - birthDate.getDate();

  let totalMeses = anosDiferenca * 12 + mesesDiferenca;
  if (diasDiferenca < 0) {
    totalMeses--;
  }

  return totalMeses < maxMonths;
};

export const getDogLifeStageLabel = (
  dateInput?: string | Date | null,
  maxMonths: number = PUPPY_MAX_MONTHS,
): "Filhote" | "Adulto" => {
  return isPuppyDog(dateInput, maxMonths) ? "Filhote" : "Adulto";
};

/**
 * Formata a idade do filhote em semanas (ex: "8 semanas", "6 semanas") conforme o protótipo.
 */
export const formatPuppyWeeksAge = (
  dateInput?: string | Date | null,
): string => {
  const birthDate = parseBirthDate(dateInput);
  if (!birthDate) return "Filhote";

  const hoje = new Date();
  const diferencaTempo = hoje.getTime() - birthDate.getTime();
  const totalDias = Math.max(
    0,
    Math.floor(diferencaTempo / (1000 * 60 * 60 * 24)),
  );

  if (totalDias === 0) return "Nasceu hoje";
  if (totalDias < 7) {
    return totalDias === 1 ? "1 dia" : `${totalDias} dias`;
  }

  const semanas = Math.max(1, Math.floor(totalDias / 7));
  return semanas === 1 ? "1 semana" : `${semanas} semanas`;
};

export const calculateAge = (dataNascimento: Date | string): string => {
  const birthDate = parseBirthDate(dataNascimento);
  if (!birthDate) return "Não informada";
  const hoje = new Date();

  // 1. Calcula a diferença total em dias (usando milissegundos)
  const diferencaTempo = hoje.getTime() - birthDate.getTime();
  const totalDias = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

  // 2. Se tiver menos de 30 dias (menos de 1 mês), exibe em dias
  if (totalDias < 30) {
    const dias = Math.max(0, totalDias); // Evita dias negativos se a data for futura
    if (dias === 0) return "Nasceu hoje";
    return dias === 1 ? "1 dia" : `${dias} dias`;
  }

  // 3. Calcula a diferença em meses e anos
  const anosDiferenca = hoje.getFullYear() - birthDate.getFullYear();
  const mesesDiferenca = hoje.getMonth() - birthDate.getMonth();
  const diasDiferenca = hoje.getDate() - birthDate.getDate();

  let totalMeses = anosDiferenca * 12 + mesesDiferenca;
  if (diasDiferenca < 0) {
    totalMeses--;
  }

  // 4. Se tiver menos de 18 meses (fase de filhote), exibe em meses (ex: "15 meses")
  if (totalMeses < PUPPY_MAX_MONTHS) {
    return totalMeses === 1 ? "1 mês" : `${totalMeses} meses`;
  }

  // 5. Caso contrário, exibe em anos
  let idadeAnos = anosDiferenca;
  if (mesesDiferenca < 0 || (mesesDiferenca === 0 && diasDiferenca < 0)) {
    idadeAnos--;
  }

  return idadeAnos === 1 ? "1 ano" : `${idadeAnos} anos`;
};

import { femaleDogIcons, maleDogIcons } from "../consts/dogIcons";
import { IDogResponse } from "../types/Dog";

export const avatarMap: Record<string, any> = [
  ...femaleDogIcons,
  ...maleDogIcons,
].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

/**
 * Retorna a imagem do cão baseada no avatarKey ou no sexo (fallback).
 * Aceita um objeto IDogResponse ou uma string avatarKey direta.
 */
export const getDogImageSource = (
  dogOrKey?: IDogResponse | string | null,
  fallbackSex?: string,
) => {
  if (!dogOrKey) {
    return fallbackSex === "F" ? femaleDogIcons[0]?.image : maleDogIcons[0]?.image;
  }

  if (typeof dogOrKey === "string") {
    if (avatarMap[dogOrKey]) {
      return avatarMap[dogOrKey];
    }
    return fallbackSex === "F" ? femaleDogIcons[0]?.image : maleDogIcons[0]?.image;
  }

  const dog = dogOrKey;
  if (dog.avatarKey && avatarMap[dog.avatarKey]) {
    return avatarMap[dog.avatarKey];
  }
  if (dog.sex === "F") {
    return femaleDogIcons[0]?.image;
  }
  return maleDogIcons[0]?.image;
};


import { femaleDogIcons, maleDogIcons } from "../consts/dogIcons"

export const getRandomMaleDogIcon = () => {
    const randomIndex = Math.floor(Math.random() * maleDogIcons.length)
    return maleDogIcons[randomIndex];
}

export const getRandomFemaleDogIcon = () => {
    const randomIndex = Math.floor(Math.random() * femaleDogIcons.length)
    return femaleDogIcons[randomIndex];
}
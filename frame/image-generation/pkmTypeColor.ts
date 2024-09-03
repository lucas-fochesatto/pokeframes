export const getPokemonTypeColor = (type: string): string => {
    // Define a mapping of Pokémon types to their respective colors
    const typeColors: { [key: string]: string } = {
        fire: "#F08030", // Orange-Red
        water: "#6890F0", // Blue
        grass: "#78C850", // Green
        electric: "#F8D030", // Yellow
        ice: "#98D8D8", // Light Blue
        fighting: "#C03028", // Brown-Red
        poison: "#A040A0", // Purple
        ground: "#E0C068", // Light Brown
        flying: "#A890F0", // Light Purple
        psychic: "#F85888", // Pink
        bug: "#A8B820", // Olive Green
        rock: "#B8A038", // Brown
        ghost: "#705898", // Dark Purple
        dragon: "#7038F8", // Indigo
        dark: "#705848", // Dark Brown
        steel: "#B8B8D0", // Gray
        fairy: "#EE99AC", // Light Pink
        normal: "#A8A878", // Beige
    };

    // Convert the input type to lowercase to ensure case-insensitive matching
    const normalizedType = type.toLowerCase();

    // Return the color corresponding to the input type, or a default color if the type is not recognized
    return typeColors[normalizedType] || "#000000"; // Default to black if type is not found
};

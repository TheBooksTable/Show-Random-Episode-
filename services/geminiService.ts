import { Episode } from '../types';

const API_BASE_URL = 'https://api.tvmaze.com';

// A simple in-memory cache to avoid re-fetching the same episode list.
const episodeCache = new Map<string, any[]>();

// Helper function to strip HTML tags from summaries
const stripHtml = (html: string | null | undefined): string => {
    if (!html) return "No summary available.";
    return html.replace(/<[^>]*>?/gm, '');
};

/**
 * Fetches all episodes for a given series from the TVMaze API.
 * Results are cached in memory to avoid redundant network requests.
 * @param seriesName The name of the TV series.
 * @returns A promise that resolves to an array of episode objects.
 */
export async function fetchEpisodesForSeries(seriesName: string): Promise<any[]> {
    if (episodeCache.has(seriesName)) {
        return episodeCache.get(seriesName)!;
    }

    try {
        const searchResponse = await fetch(`${API_BASE_URL}/singlesearch/shows?q=${encodeURIComponent(seriesName)}`);
        if (!searchResponse.ok) {
            throw new Error(`Could not find a show matching "${seriesName}".`);
        }
        const show = await searchResponse.json();
        const showId = show.id;

        if (!showId) {
            throw new Error(`Could not determine the ID for "${seriesName}".`);
        }

        const episodesResponse = await fetch(`${API_BASE_URL}/shows/${showId}/episodes`);
        if (!episodesResponse.ok) {
            throw new Error(`Failed to fetch episodes for "${seriesName}".`);
        }
        const episodes = await episodesResponse.json();
        
        episodeCache.set(seriesName, episodes);
        return episodes;

    } catch (error) {
        console.error("Error fetching from TVMaze API:", error);
        throw error;
    }
}


/**
 * Selects a random episode from a list based on a season range.
 * @param allEpisodes - The full list of episodes for a series.
 * @param seriesName - The name of the series.
 * @param minSeason - The minimum season number (inclusive).
 * @param maxSeason - The maximum season number (inclusive).
 * @returns A formatted Episode object.
 */
export function selectRandomEpisode(
    allEpisodes: any[],
    seriesName: string,
    minSeason: number,
    maxSeason: number
): Episode {
    const filteredEpisodes = allEpisodes.filter(ep => 
        ep.season >= minSeason && ep.season <= maxSeason
    );

    if (filteredEpisodes.length === 0) {
        throw new Error(`No episodes found for "${seriesName}" between seasons ${minSeason} and ${maxSeason}.`);
    }

    const randomIndex = Math.floor(Math.random() * filteredEpisodes.length);
    const randomRawEpisode = filteredEpisodes[randomIndex];

    return {
        seriesTitle: seriesName,
        seasonNumber: randomRawEpisode.season,
        episodeNumber: randomRawEpisode.number,
        episodeTitle: randomRawEpisode.name || 'Untitled',
        summary: stripHtml(randomRawEpisode.summary),
        rating: randomRawEpisode.rating?.average,
    };
}
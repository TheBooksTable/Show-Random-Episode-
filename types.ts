export interface Series {
    name: string;
    seasons: number;
}

export interface Episode {
    seriesTitle: string;
    seasonNumber: number;
    episodeNumber: number;
    episodeTitle: string;
    summary: string;
    rating?: number;
}
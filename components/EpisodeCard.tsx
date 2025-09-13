import React from 'react';
import { StarIcon } from './icons/StarIcon.tsx';

const EpisodeCard = ({ episode }) => {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg text-white overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">{episode.seriesTitle}</h3>
                        <p className="text-2xl font-bold mt-1">
                            S{String(episode.seasonNumber).padStart(2, '0')} E{String(episode.episodeNumber).padStart(2, '0')}: "{episode.episodeTitle}"
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="text-yellow-400">
                        <StarIcon />
                    </div>
                    {episode.rating ? (
                         <>
                            <span className="text-lg font-bold text-white">{episode.rating.toFixed(1)}</span>
                            <span className="text-sm text-gray-400">/ 10 (TVMaze)</span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-400">Rating not available</span>
                    )}
                </div>

                <p className="text-gray-400 leading-relaxed break-words">
                    {episode.summary}
                </p>
            </div>
        </div>
    );
};

export default EpisodeCard;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchEpisodesForSeries, selectRandomEpisode } from './services/geminiService.ts';
import { seriesList } from './constants.ts';

import WaveBackground from './components/WaveBackground.tsx';
import EpisodeCard from './components/EpisodeCard.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import FavoritesSidebar from './components/FavoritesSidebar.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import Toast from './components/Toast.tsx';
import { ShuffleIcon } from './components/icons/ShuffleIcon.tsx';
import { ReRollIcon } from './components/icons/ReRollIcon.tsx';
import { FavoriteStarIcon } from './components/icons/FavoriteStarIcon.tsx';
import { DiceIcon } from './components/icons/DiceIcon.tsx';

const App = () => {
    const [seriesSearchTerm, setSeriesSearchTerm] = useState('');
    const [filteredSeries, setFilteredSeries] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [seasonRange, setSeasonRange] = useState([1, 1]);
    const [recommendedEpisode, setRecommendedEpisode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [showSeasonControls, setShowSeasonControls] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
    const [showToRemove, setShowToRemove] = useState(null);
    const [toast, setToast] = useState({ message: '', show: false });

    // Handle splash screen removal
    useEffect(() => {
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.remove();
            }, 500);
        }
    }, []);

    // Load favorites from localStorage on initial render
    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem('randomEpisode-favorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Failed to parse favorites from localStorage", error);
        }
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('randomEpisode-favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    }, [favorites]);


    useEffect(() => {
        if (seriesSearchTerm.length > 1 && !selectedSeries) {
            const filtered = seriesList.filter(s =>
                s.name.toLowerCase().includes(seriesSearchTerm.toLowerCase())
            );
            setFilteredSeries(filtered);
            setIsDropdownOpen(filtered.length > 0);
        } else {
            setFilteredSeries([]);
            setIsDropdownOpen(false);
        }
    }, [seriesSearchTerm, selectedSeries]);

    useEffect(() => {
        if (selectedSeries) {
            setSeasonRange([1, selectedSeries.seasons]);
            setRecommendedEpisode(null);
            setShowResult(false);
            setError(null);
            setTimeout(() => setShowSeasonControls(true), 100);
        } else {
            setShowSeasonControls(false);
        }
    }, [selectedSeries]);

    const handleSearchChange = (e) => {
        setSeriesSearchTerm(e.target.value);
        if (selectedSeries) {
            setSelectedSeries(null); // Deselect if user starts typing again
        }
    };

    const handleSelectSeries = (series) => {
        setSeriesSearchTerm(series.name);
        setSelectedSeries(series);
        setIsDropdownOpen(false);
    };
    
    const handleSelectSeriesForMobile = (series) => {
        handleSelectSeries(series);
        setIsFavoritesOpen(false);
    };

    const handleRangeChange = (type, value) => {
        const [min, max] = seasonRange;
        if (type === 'min') {
            setSeasonRange([value, Math.max(value, max)]);
        } else {
            setSeasonRange([Math.min(value, min), value]);
        }
    };

    const handleAddFavorite = (series) => {
        if (!favorites.some(fav => fav.name === series.name)) {
            setFavorites([...favorites, series]);
        }
    };
    
    const handleRequestRemove = (series) => {
        setShowToRemove(series);
    };

    const handleCancelRemove = () => {
        setShowToRemove(null);
    };

    const handleConfirmRemove = () => {
        if (!showToRemove) return;

        setFavorites(favorites.filter(fav => fav.name !== showToRemove.name));
        
        setToast({ message: 'Show removed from favorites.', show: true });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        setTimeout(() => setToast({ message: '', show: false }), 3500);

        setShowToRemove(null);
    };

    const isFavorited = useMemo(() => {
        if (!selectedSeries) return false;
        return favorites.some(fav => fav.name === selectedSeries.name);
    }, [favorites, selectedSeries]);


    const generateEpisode = useCallback(async (series, range) => {
        setIsLoading(true);
        setError(null);
        setRecommendedEpisode(null);
        setShowResult(false);

        try {
            const allEpisodes = await fetchEpisodesForSeries(series.name);
            const episode = selectRandomEpisode(allEpisodes, series.name, range[0], range[1]);
            setRecommendedEpisode(episode);
            setTimeout(() => setShowResult(true), 100);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to get episode. ${errorMessage}`);
            setShowResult(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSurpriseMeClick = async () => {
        const randomIndex = Math.floor(Math.random() * seriesList.length);
        const randomSeries = seriesList[randomIndex];

        // Update UI to reflect the choice
        setSelectedSeries(randomSeries);
        setSeriesSearchTerm(randomSeries.name);
        
        // Immediately fetch the episode for the entire series range
        await generateEpisode(randomSeries, [1, randomSeries.seasons]);
    };

    const seasonOptions = useMemo(() => {
        if (!selectedSeries) return [];
        return Array.from({ length: selectedSeries.seasons }, (_, i) => i + 1);
    }, [selectedSeries]);

    return (
        <div className="relative min-h-screen w-full bg-[#000010] text-white font-sans overflow-x-hidden">
            <WaveBackground />
            <div className="relative z-10 flex flex-col md:flex-row items-start justify-center min-h-screen p-4 sm:p-6 md:p-8 md:gap-8">
                 <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0" aria-hidden="true"></div>
                 <main className="w-full max-w-2xl flex-shrink-0">
                    <header className="text-center mb-8 relative">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                            Random Episode
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 mt-2">
                            Can't decide what to watch? Let fate pick an episode for you.
                        </p>
                        <button
                            onClick={() => setIsFavoritesOpen(true)}
                            className="md:hidden absolute top-0 right-0 bg-white/10 p-3 rounded-full text-yellow-400 hover:bg-white/20 transition-colors"
                            aria-label="Open favorites"
                        >
                            <FavoriteStarIcon isFavorite={true} />
                        </button>
                    </header>

                    <div className="p-6 sm:p-8 bg-black/10 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl shadow-blue-500/10 space-y-6 transition-all duration-500">
                        {/* Series Selector */}
                        <div>
                            <label htmlFor="series-search" className="block text-sm font-medium text-gray-300 mb-2">1. Find a Show</label>
                            <div className="relative">
                                <input
                                    id="series-search"
                                    type="text"
                                    placeholder="e.g., Breaking Bad, The Office..."
                                    value={seriesSearchTerm}
                                    onChange={handleSearchChange}
                                    autoComplete="off"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
                                    aria-label="Search for a TV series"
                                />
                                <ul className={`custom-scrollbar absolute z-20 w-full bg-gray-900/80 backdrop-blur-md border border-white/20 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-2xl transform transition-all duration-300 ease-in-out origin-top ${isDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}`}>
                                    {filteredSeries.map(series => (
                                        <li
                                            key={series.name}
                                            onClick={() => handleSelectSeries(series)}
                                            onMouseDown={(e) => e.preventDefault()} // Prevents input blur on click
                                            className="px-4 py-3 hover:bg-white/20 cursor-pointer transition-colors duration-150"
                                        >
                                            {series.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Season Range Selector */}
                        {selectedSeries && (
                            <div className={`transition-all duration-500 ease-out ${showSeasonControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                                <div className="flex justify-between items-center mb-2">
                                     <h2 className="text-lg font-semibold text-green-300">Selected: {selectedSeries.name}</h2>
                                     <button 
                                        onClick={() => isFavorited ? handleRequestRemove(selectedSeries) : handleAddFavorite(selectedSeries)}
                                        title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                                        className="text-white/70 hover:text-white transition-colors"
                                     >
                                         <FavoriteStarIcon isFavorite={isFavorited} />
                                     </button>
                                </div>
                               
                                <label className="block text-sm font-medium text-gray-300 mb-2">2. Choose Season Range</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="min-season" className="block text-xs text-gray-400 mb-1">From</label>
                                        <select
                                            id="min-season"
                                            value={seasonRange[0]}
                                            onChange={(e) => handleRangeChange('min', parseInt(e.target.value))}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
                                        >
                                            {seasonOptions.map(num => (
                                                <option key={`min-${num}`} value={num} className="bg-gray-800 text-white">{`Season ${num}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                     <div>
                                        <label htmlFor="max-season" className="block text-xs text-gray-400 mb-1">To</label>
                                        <select
                                            id="max-season"
                                            value={seasonRange[1]}
                                            onChange={(e) => handleRangeChange('max', parseInt(e.target.value))}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200"
                                        >
                                            {seasonOptions.map(num => (
                                                <option key={`max-${num}`} value={num} className="bg-gray-800 text-white">{`Season ${num}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="pt-2 space-y-4">
                            <button
                                onClick={() => selectedSeries && generateEpisode(selectedSeries, seasonRange)}
                                disabled={!selectedSeries || isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner />
                                        <span>Finding Episode...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShuffleIcon />
                                        <span>Find Random Episode</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleSurpriseMeClick}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                <DiceIcon />
                                <span>Surprise Me</span>
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="mt-8 min-h-[300px]">
                        {error && <p className="text-center text-red-400 bg-red-500/10 p-4 rounded-lg">{error}</p>}
                        
                        {recommendedEpisode && (
                            <div className={`transition-all duration-700 ease-in-out ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                                <EpisodeCard episode={recommendedEpisode} />
                                <div className="mt-4 flex justify-center">
                                     <button
                                        onClick={() => selectedSeries && generateEpisode(selectedSeries, seasonRange)}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    >
                                        <ReRollIcon />
                                        <span>I don't want this one (Re-roll)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                 </main>
                 <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 mt-8 md:mt-0 hidden md:block">
                     <FavoritesSidebar
                        favorites={favorites}
                        onSelect={handleSelectSeries}
                        onRequestRemove={handleRequestRemove}
                        onClose={undefined}
                     />
                 </aside>
            </div>
            
            {/* Mobile Favorites Overlay */}
            <div 
                className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isFavoritesOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsFavoritesOpen(false)}
                aria-hidden="true"
            />
            <div 
                className={`fixed top-0 right-0 bottom-0 w-full max-w-xs z-40 md:hidden transition-transform duration-300 ease-in-out ${isFavoritesOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="favorites-heading"
            >
                <FavoritesSidebar
                    favorites={favorites}
                    onSelect={handleSelectSeriesForMobile}
                    onRequestRemove={handleRequestRemove}
                    onClose={() => setIsFavoritesOpen(false)}
                />
            </div>

            <ConfirmationModal
                isOpen={!!showToRemove}
                onConfirm={handleConfirmRemove}
                onCancel={handleCancelRemove}
                title="Confirm Removal"
            >
                Are you sure you want to remove <strong className="text-white">{showToRemove?.name}</strong> from your favorites?
            </ConfirmationModal>

            <Toast message={toast.message} show={toast.show} />
        </div>
    );
};

export default App;
import React from 'react';
import { Series } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';

interface FavoritesSidebarProps {
    favorites: Series[];
    onSelect: (series: Series) => void;
    onRequestRemove: (series: Series) => void;
    onClose?: () => void;
}

const FavoritesSidebar: React.FC<FavoritesSidebarProps> = ({ favorites, onSelect, onRequestRemove, onClose }) => {
    return (
        <div 
            className="p-5 bg-black/20 backdrop-blur-xl border border-white/10 rounded-l-2xl md:rounded-2xl shadow-2xl shadow-purple-500/10 h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 id="favorites-heading" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Favorites
                </h2>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close favorites">
                        <CloseIcon />
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                {favorites.length === 0 ? (
                    <p className="text-sm text-gray-400">Your favorite shows will appear here. Click the star icon next to a selected show to add it.</p>
                ) : (
                    <ul className="space-y-2">
                        {favorites.map(series => (
                            <li 
                                key={series.name}
                                className="group flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-all duration-200"
                            >
                                <button
                                    onClick={() => onSelect(series)}
                                    className="text-left flex-grow truncate mr-2"
                                    title={`Select ${series.name}`}
                                >
                                    <span className="font-medium">{series.name}</span>
                                </button>
                                <button
                                    onClick={() => onRequestRemove(series)}
                                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
                                    title={`Remove ${series.name} from favorites`}
                                >
                                    <TrashIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FavoritesSidebar;
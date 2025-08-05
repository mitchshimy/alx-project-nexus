import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { SkeletonPoster, SkeletonTitle, SkeletonText } from '@/components/Skeleton';
import { TMDBMovie, TMDBCast } from '@/types/tmdb';
import { movieAPI } from '@/utils/api';
import { buildYouTubeEmbedUrl, getOptimalQuality, getQualityDisplayName } from '@/utils/videoPlayer';
import { FaStar, FaRegStar, FaImdb, FaPlay } from 'react-icons/fa';
import { MdDateRange, MdAccessTime, MdLanguage, MdMoney } from 'react-icons/md';

const Container = styled.div<{ isSidebarOpen?: boolean }>`
  max-width: ${props => props.isSidebarOpen ? '100%' : '1200px'};
  margin: ${props => props.isSidebarOpen ? '20px' : '40px auto'};
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 32px;
  position: relative;
  color: #FFFFFF;
  transition: all 0.3s ease;

  @media (max-width: 600px) {
    padding: 24px;
    margin: 20px;
  }
`;

const MovieHeader = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
  }
`;

const PosterContainer = styled.div`
  flex: 0 0 300px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    flex: 0 0 auto;
    max-width: 300px;
    margin: 0 auto;
  }
`;

const Poster = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const MovieInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: #FFFFFF;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Tagline = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Metadata = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;

  & > svg {
    color: #00D4FF;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 4px 10px;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const RatingText = styled.div`
  font-size: 1.1rem;
  color: #FFD700;
  font-weight: 600;
`;

const VoteCount = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const IMDBLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #F5C518;
  text-decoration: none;
  font-weight: 600;
  margin-left: 16px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const GenresList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const Genre = styled.span`
  background: rgba(0, 212, 255, 0.2);
  color: #00D4FF;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
`;

const Overview = styled.p`
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const FavoriteButton = styled.button<{ $isFavorite: boolean }>`
  background: ${props => props.$isFavorite ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'};
  border: 1px solid ${props => props.$isFavorite ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
  color: ${props => props.$isFavorite ? '#f87171' : '#4ade80'};
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.$isFavorite ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
    border-color: ${props => props.$isFavorite ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'};
  }
`;

const WatchTrailerButton = styled.button`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.4);
  }
`;

const WatchlistButton = styled.button<{ $isWatchlisted: boolean }>`
  background: ${props => props.$isWatchlisted ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)'};
  border: 1px solid ${props => props.$isWatchlisted ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)'};
  color: ${props => props.$isWatchlisted ? '#60a5fa' : '#a855f7'};
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.$isWatchlisted ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)'};
    border-color: ${props => props.$isWatchlisted ? 'rgba(59, 130, 246, 0.4)' : 'rgba(168, 85, 247, 0.4)'};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding-top: 20px;
`;

const ModalContent = styled.div`
  position: relative;
  width: 90%;
  max-width: 1200px;
  background: #111;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: -5px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const VideoQualityInfo = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #FFFFFF;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
  z-index: 10;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2rem 0 1.5rem;
  color: #FFFFFF;
  font-weight: 600;
  position: relative;
  padding-bottom: 8px;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #00D4FF, transparent);
    border-radius: 3px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoCardTitle = styled.h3`
  font-size: 1rem;
  color: #00D4FF;
  margin-bottom: 12px;
  font-weight: 600;
`;

const InfoCardContent = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
`;



const CastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }
`;

const CastCard = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const CastImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const CastName = styled.div`
  font-size: 0.95rem;
  color: #FFFFFF;
  font-weight: 600;
  margin-bottom: 4px;
`;

const CastCharacter = styled.div`
  font-size: 0.85rem;
  color: #A1A1AA;
  line-height: 1.4;
`;

const TabContainer = styled.div`
  margin-top: 2rem;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(0, 212, 255, 0.2)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#00D4FF' : '#A1A1AA'};
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.$active ? '#00D4FF' : '#FFFFFF'};
  }
`;

const TabContent = styled.div`
  min-height: 200px;
`;

const FullCastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const FullCastCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const FullCastImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const FullCastInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FullCastName = styled.div`
  font-size: 0.95rem;
  color: #FFFFFF;
  font-weight: 600;
  margin-bottom: 4px;
`;

const FullCastCharacter = styled.div`
  font-size: 0.85rem;
  color: #A1A1AA;
  line-height: 1.4;
`;

const ReviewsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const ReviewCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 10px;
  }
`;

const ReviewAuthorImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
  }
`;

const ReviewAuthorInfo = styled.div`
  flex: 1;
`;

const ReviewAuthorName = styled.div`
  font-weight: 600;
  color: #FFFFFF;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ReviewDate = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #FFD700;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ReviewContent = styled.div`
  font-size: 0.95rem;
  color: #E5E7EB;
  line-height: 1.7;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.6;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

const ReadMoreButton = styled.button`
  background: none;
  border: none;
  color: #e50914;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-top: 8px;
  text-decoration: underline;
  
  &:hover {
    color: #b2070e;
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 5px;
  }
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    margin-top: 15px;
  }
  
  @media (max-width: 480px) {
    margin-top: 10px;
  }
`;

const LoadMoreButton = styled.button`
  background: rgba(229, 9, 20, 0.1);
  border: 2px solid #e50914;
  color: #e50914;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e50914;
    color: white;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 10px 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 8px 16px;
  }
`;

const ReviewText = styled.div<{ isExpanded: boolean }>`
  ${props => !props.isExpanded && `
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  `}
`;

const SimilarMoviesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
`;

const SimilarMovie = styled.div`
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const SimilarPoster = styled.img`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  margin-bottom: 8px;
  aspect-ratio: 2/3;
  object-fit: cover;
`;

const SimilarTitle = styled.div`
  font-size: 0.95rem;
  color: #FFFFFF;
  font-weight: 500;
  line-height: 1.4;
`;

const SimilarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #FFD700;
  margin-top: 4px;
`;

const NoContentMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin: 10px 0;
`;

export default function MovieDetailPage({ isSidebarOpen = false }: { isSidebarOpen?: boolean }) {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [isFavoriteMovie, setIsFavoriteMovie] = useState(false);
  const [isWatchlistedMovie, setIsWatchlistedMovie] = useState(false);
  const [cast, setCast] = useState<TMDBCast[]>([]);
  const [fullCast, setFullCast] = useState<TMDBCast[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [visibleReviews, setVisibleReviews] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'details' | 'cast' | 'reviews'>('details');
  const [videos, setVideos] = useState<any[]>([]);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<any>(null);
  const [navigatingToSimilar, setNavigatingToSimilar] = useState(false);
  const [currentVideoQuality, setCurrentVideoQuality] = useState<string>('720p');
  const navigatingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id) return;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Reset state when ID changes
    setMovie(null);
    setSimilarMovies([]);
    setCast([]);
    setError(null);
    setLoading(true);
    setNavigatingToSimilar(false);
    setExpandedReviews(new Set());
    setVisibleReviews(10);
    
    // Clear any existing timeout
    if (navigatingTimeoutRef.current) {
      clearTimeout(navigatingTimeoutRef.current);
      navigatingTimeoutRef.current = null;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching movie details for ID: ${id}`);
        
        // Fetch movie details from our backend API with timeout
        const movieData = await Promise.race([
          movieAPI.getMovieDetails(Number(id)),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
        ]);
        
        console.log('Movie data received:', movieData);
        console.log('Movie poster_path:', movieData?.poster_path);
        console.log('Movie tmdb_id:', movieData?.tmdb_id);
        
        // Check if API returned an error object
        if (movieData && movieData.error) {
          setError(movieData.error);
          setLoading(false);
          return;
        }
        
        // If we get here, navigation was successful, so reset the navigating state
        setNavigatingToSimilar(false);
        
        setMovie(movieData);
        
        // Check if movie is in favorites
        if (movieData.is_favorite) {
          setIsFavoriteMovie(true);
        }

        // Check if movie is in watchlist
        if (movieData.is_watchlisted) {
          setIsWatchlistedMovie(true);
        }

        // Set cast if available
        if (movieData.credits?.cast) {
          const allCast = movieData.credits.cast;
          setCast(allCast.slice(0, 10)); // Top 10 cast for main section
          setFullCast(allCast); // Full cast for detailed view
        }

        // Set videos if available
        if (movieData.videos?.results) {
          setVideos(movieData.videos.results.filter((video: any) => video.type === 'Trailer'));
        }

        // Set reviews if available
        if (movieData.reviews?.results && movieData.reviews.results.length > 0) {
          setReviews(movieData.reviews.results);
        } else {
          // No reviews available
          setReviews([]);
        }

        // Fetch similar movies if available
        if (movieData.similar?.results) {
          // Filter out movies without valid TMDB IDs
          const validSimilarMovies = movieData.similar.results.filter((movie: any) => movie.tmdb_id || movie.id);
          setSimilarMovies(validSimilarMovies.slice(0, 10));
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching movie details:', error);
        
        // Only set error if the request wasn't aborted
        if (error.name !== 'AbortError') {
          setError('Failed to load movie details. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  useEffect(() => {
    // Get optimal video quality based on user settings and device capabilities
    const optimalQuality = getOptimalQuality();
    setCurrentVideoQuality(optimalQuality);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigatingTimeoutRef.current) {
        clearTimeout(navigatingTimeoutRef.current);
      }
    };
  }, []);

  const handleLoadMoreReviews = () => {
    setVisibleReviews(prev => Math.min(prev + 5, reviews.length));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return 'Unknown';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatReviewDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} style={{ opacity: 0.7 }} />);
      } else {
        stars.push(<FaRegStar key={i} style={{ opacity: 0.5 }} />);
      }
    }
    
    return stars;
  };

  const handleFavorite = async () => {
    if (!movie) return;
    
    if (isFavoriteMovie) {
      // Remove from favorites
      let result;
      if (movie.favorite_id) {
        result = await movieAPI.removeFromFavorites(movie.favorite_id);
      } else {
        result = await movieAPI.removeFromFavoritesByMovie(movie.tmdb_id || movie.id);
      }
      
      // Check if API returned an error object
      if (result && result.error) {
        const { showError } = await import('@/utils/api');
        showError('Error', result.error);
        return;
      }
      
      setIsFavoriteMovie(false);
    } else {
      // Add to favorites
      const result = await movieAPI.addToFavorites(movie.tmdb_id || movie.id);
      
      // Check if API returned an error object
      if (result && result.error) {
        const { showError } = await import('@/utils/api');
        showError('Error', result.error);
        return;
      }
      
      setIsFavoriteMovie(true);
    }
  };

  const handleWatchlist = async () => {
    if (!movie) return;
    
    if (isWatchlistedMovie) {
      // Remove from watchlist
      let result;
      if (movie.watchlist_id) {
        result = await movieAPI.removeFromWatchlist(movie.watchlist_id);
      } else {
        result = await movieAPI.removeFromWatchlistByMovie(movie.tmdb_id || movie.id);
      }
      
      // Check if API returned an error object
      if (result && result.error) {
        const { showError } = await import('@/utils/api');
        showError('Error', result.error);
        return;
      }
      
      setIsWatchlistedMovie(false);
    } else {
      // Add to watchlist
      const result = await movieAPI.addToWatchlist(movie.tmdb_id || movie.id);
      
      // Check if API returned an error object
      if (result && result.error) {
        const { showError } = await import('@/utils/api');
        showError('Error', result.error);
        return;
      }
      
      setIsWatchlistedMovie(true);
    }
  };

  const handleWatchTrailer = () => {
    if (videos.length > 0) {
      setSelectedTrailer(videos[0]); // Get the first trailer
      setShowTrailerModal(true);
    } else {
      // Use global error handler instead of alert
      const showError = async () => {
        const { showError: showErrorFn } = await import('@/utils/api');
        showErrorFn('No Trailer Available', 'No trailer available for this movie');
      };
      showError();
    }
  };

  const closeTrailerModal = () => {
    setShowTrailerModal(false);
    setSelectedTrailer(null);
  };

  const handleSimilarMovieClick = (similar: TMDBMovie) => {
    const movieId = similar.tmdb_id || similar.id;
    if (movieId) {
      setNavigatingToSimilar(true);
      router.push(`/movies/${movieId}`);
      
      // Reset navigating state after 5 seconds in case navigation fails
      if (navigatingTimeoutRef.current) {
        clearTimeout(navigatingTimeoutRef.current);
      }
      navigatingTimeoutRef.current = setTimeout(() => {
        setNavigatingToSimilar(false);
      }, 5000);
    } else {
      // Use global error handler for missing TMDB ID
      const showError = async () => {
        const { showError: showErrorFn } = await import('@/utils/api');
        showErrorFn('Error', 'Unable to navigate to this movie. Please try another one.');
      };
      showError();
    }
  };

  if (loading) {
    return (
      <Container isSidebarOpen={isSidebarOpen}>
        <MovieHeader>
          <PosterContainer><SkeletonPoster /></PosterContainer>
          <MovieInfo>
            <SkeletonTitle />
            <SkeletonText />
            <SkeletonText />
            <SkeletonText />
          </MovieInfo>
        </MovieHeader>
      </Container>
    );
  }

  if (error || !movie) {
    return (
      <Container isSidebarOpen={isSidebarOpen}>
        <Title>Movie Not Found</Title>
        <p>{error || 'We couldn\'t find that movie.'}</p>
        <BackButton onClick={() => router.back()}>Go Back</BackButton>
      </Container>
    );
  }

  return (
    <Container isSidebarOpen={isSidebarOpen}>
      <MovieHeader>
        <PosterContainer>
          <Poster
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.png'}
            alt={movie.title}
            onError={(e) => {
              console.error('Poster image failed to load:', movie.poster_path);
              e.currentTarget.src = '/no-poster.png';
            }}
          />
        </PosterContainer>
        <MovieInfo>
          <Title>{movie.title}</Title>
          {movie.tagline && <Tagline>&ldquo;{movie.tagline}&rdquo;</Tagline>}
          
          <RatingContainer>
            <RatingStars>
              {renderStars(movie.vote_average)}
            </RatingStars>
            <RatingText>{movie.vote_average.toFixed(1)}</RatingText>
            <VoteCount>({movie.vote_count} votes)</VoteCount>
            {movie.imdb_id && (
              <IMDBLink 
                href={`https://www.imdb.com/title/${movie.imdb_id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FaImdb size={20} /> IMDb
              </IMDBLink>
            )}
          </RatingContainer>
          
          <Metadata>
            <MetadataItem>
              <MdDateRange /> {formatDate(movie.release_date)}
            </MetadataItem>
            {movie.runtime && (
              <MetadataItem>
                <MdAccessTime /> {formatRuntime(movie.runtime)}
              </MetadataItem>
            )}
            {movie.original_language && (
              <MetadataItem>
                <MdLanguage /> {movie.original_language.toUpperCase()}
              </MetadataItem>
            )}
            {movie.budget && movie.budget > 0 && (
              <MetadataItem>
                <MdMoney /> Budget: {formatCurrency(movie.budget)}
              </MetadataItem>
            )}
            {movie.revenue && movie.revenue > 0 && (
              <MetadataItem>
                <MdMoney /> Revenue: {formatCurrency(movie.revenue)}
              </MetadataItem>
            )}
          </Metadata>
          
          {movie.genres && movie.genres.length > 0 && (
            <GenresList>
              {movie.genres.map(genre => (
                <Genre key={genre.id}>{genre.name}</Genre>
              ))}
            </GenresList>
          )}
          
          <Overview>{movie.overview || 'No overview available.'}</Overview>
          
          <ActionButtons>
            <BackButton onClick={() => router.back()}>
              ← Back
            </BackButton>
            <FavoriteButton 
              $isFavorite={isFavoriteMovie} 
              onClick={handleFavorite}
            >
              {isFavoriteMovie ? '❤️ Remove Favorite' : '🤍 Add to Favorites'}
            </FavoriteButton>
            <WatchlistButton 
              $isWatchlisted={isWatchlistedMovie} 
              onClick={handleWatchlist}
            >
              {isWatchlistedMovie ? '📺 Remove from Watchlist' : '📺 Add to Watchlist'}
            </WatchlistButton>
            {videos.length > 0 && (
              <WatchTrailerButton onClick={handleWatchTrailer}>
                <FaPlay /> Watch Trailer
              </WatchTrailerButton>
            )}
          </ActionButtons>
        </MovieInfo>
      </MovieHeader>

      <TabContainer>
        <TabButtons>
          <TabButton 
            $active={activeTab === 'details'} 
            onClick={() => setActiveTab('details')}
          >
            Details
          </TabButton>
          <TabButton 
            $active={activeTab === 'cast'} 
            onClick={() => setActiveTab('cast')}
          >
            Cast ({fullCast.length})
          </TabButton>
          <TabButton 
            $active={activeTab === 'reviews'} 
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length > 0 ? `${Math.min(visibleReviews, reviews.length)}/${reviews.length}` : '0'})
          </TabButton>
        </TabButtons>
        
        <TabContent>
          {activeTab === 'details' && (
            <>
              <InfoGrid>
                <InfoCard>
                  <InfoCardTitle>Production Companies</InfoCardTitle>
                  <InfoCardContent>
                    {movie.production_companies && movie.production_companies.length > 0 ? (
                      movie.production_companies.map(company => (
                        <div key={company.id} style={{ marginBottom: '8px' }}>
                          {company.name}
                          {company.logo_path && (
                            <Image 
                              src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                              alt={company.name}
                              width={92}
                              height={20}
                              style={{ 
                                height: '20px', 
                                marginLeft: '8px',
                                verticalAlign: 'middle'
                              }}
                            />
                          )}
                        </div>
                      ))
                    ) : 'No production companies available'}
                  </InfoCardContent>
                </InfoCard>
                
                <InfoCard>
                  <InfoCardTitle>Production Countries</InfoCardTitle>
                  <InfoCardContent>
                    {movie.production_countries && movie.production_countries.length > 0 ? (
                      movie.production_countries.map(country => (
                        <div key={country.iso_3166_1} style={{ marginBottom: '4px' }}>
                          {country.name}
                        </div>
                      ))
                    ) : 'No production countries available'}
                  </InfoCardContent>
                </InfoCard>
                
                <InfoCard>
                  <InfoCardTitle>Spoken Languages</InfoCardTitle>
                  <InfoCardContent>
                    {movie.spoken_languages && movie.spoken_languages.length > 0 ? (
                      movie.spoken_languages.map(language => (
                        <div key={language.iso_639_1} style={{ marginBottom: '4px' }}>
                          {language.english_name || language.name}
                          {language.iso_639_1 && (
                            <span style={{ color: 'rgba(255, 255, 255, 0.6)', marginLeft: '8px' }}>
                              ({language.iso_639_1.toUpperCase()})
                            </span>
                          )}
                        </div>
                      ))
                    ) : 'No language information available'}
                  </InfoCardContent>
                </InfoCard>
                
                <InfoCard>
                  <InfoCardTitle>Status</InfoCardTitle>
                  <InfoCardContent>
                    <div style={{ 
                      fontWeight: '600', 
                      color: movie.status === 'Released' ? '#4ade80' : 
                             movie.status === 'Post Production' ? '#fbbf24' : 
                             movie.status === 'In Production' ? '#60a5fa' : '#ffffff'
                    }}>
                      {movie.status || 'Unknown'}
                    </div>
                    {movie.release_date && new Date(movie.release_date) > new Date() && (
                      <div style={{ 
                        marginTop: '8px', 
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        Coming soon: {formatDate(movie.release_date)}
                      </div>
                    )}
                  </InfoCardContent>
                </InfoCard>
                
                {movie.budget && movie.budget > 0 && (
                  <InfoCard>
                    <InfoCardTitle>Budget</InfoCardTitle>
                    <InfoCardContent>
                      <div style={{ fontWeight: '600', color: '#4ade80' }}>
                        {formatCurrency(movie.budget)}
                      </div>
                    </InfoCardContent>
                  </InfoCard>
                )}
                
                {movie.revenue && movie.revenue > 0 && (
                  <InfoCard>
                    <InfoCardTitle>Revenue</InfoCardTitle>
                    <InfoCardContent>
                      <div style={{ fontWeight: '600', color: '#60a5fa' }}>
                        {formatCurrency(movie.revenue)}
                      </div>
                      {movie.budget && movie.budget > 0 && (
                        <div style={{ 
                          marginTop: '4px', 
                          fontSize: '0.85rem',
                          color: 'rgba(255, 255, 255, 0.7)'
                        }}>
                          Profit: {formatCurrency(movie.revenue - movie.budget)}
                        </div>
                      )}
                    </InfoCardContent>
                  </InfoCard>
                )}
              </InfoGrid>
              
              {cast.length > 0 && (
                <>
                  <SectionTitle>Top Cast</SectionTitle>
                  <CastGrid>
                    {cast.map((actor) => (
                      <CastCard key={actor.id}>
                        <CastImage
                          src={actor.profile_path
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : '/no-poster.png'}
                          alt={actor.name}
                        />
                        <CastName>{actor.name}</CastName>
                        <CastCharacter>{actor.character}</CastCharacter>
                      </CastCard>
                    ))}
                  </CastGrid>
                </>
              )}
              
              {similarMovies.length > 0 && (
                <>
                  <SectionTitle>Similar Movies</SectionTitle>
                  {navigatingToSimilar && (
                    <LoadingMessage>
                      Loading movie details...
                    </LoadingMessage>
                  )}
                  <SimilarMoviesGrid>
                    {similarMovies.map((similar) => (
                      <SimilarMovie
                        key={similar.id}
                        onClick={() => handleSimilarMovieClick(similar)}
                        style={{ 
                          opacity: navigatingToSimilar ? 0.6 : 1,
                          pointerEvents: navigatingToSimilar ? 'none' : 'auto'
                        }}
                      >
                        <SimilarPoster
                          src={
                            similar.poster_path
                              ? `https://image.tmdb.org/t/p/w300${similar.poster_path}`
                              : '/no-poster.png'
                          }
                          alt={similar.title}
                        />
                        <SimilarTitle>{similar.title}</SimilarTitle>
                        <SimilarRating>
                          <FaStar /> {similar.vote_average.toFixed(1)}
                        </SimilarRating>
                      </SimilarMovie>
                    ))}
                  </SimilarMoviesGrid>
                </>
              )}
            </>
          )}
          
          {activeTab === 'cast' && (
            <>
              <SectionTitle>Full Cast</SectionTitle>
              {fullCast.length > 0 ? (
                <FullCastGrid>
                  {fullCast.map((actor) => (
                    <FullCastCard key={actor.id}>
                      <FullCastImage
                        src={actor.profile_path
                          ? `https://image.tmdb.org/t/p/w92${actor.profile_path}`
                          : '/no-poster.png'}
                        alt={actor.name}
                      />
                      <FullCastInfo>
                        <FullCastName>{actor.name}</FullCastName>
                        <FullCastCharacter>{actor.character}</FullCastCharacter>
                      </FullCastInfo>
                    </FullCastCard>
                  ))}
                </FullCastGrid>
              ) : (
                <NoContentMessage>No cast information available</NoContentMessage>
              )}
            </>
          )}
          
          {activeTab === 'reviews' && (
            <>
              <SectionTitle>User Reviews</SectionTitle>
              {reviews.length > 0 ? (
                <ReviewsGrid>
                  {reviews.slice(0, visibleReviews).map((review) => (
                    <ReviewCard key={review.id}>
                      <ReviewHeader>
                        <ReviewAuthorImage
                          src={review.author_details?.avatar_path
                            ? `https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`
                            : '/no-poster.png'}
                          alt={review.author}
                        />
                        <ReviewAuthorInfo>
                          <ReviewAuthorName>{review.author}</ReviewAuthorName>
                          <ReviewDate>{formatReviewDate(review.created_at)}</ReviewDate>
                        </ReviewAuthorInfo>
                        {review.author_details?.rating && (
                          <ReviewRating>
                            ⭐ {review.author_details.rating.toFixed(1)}
                          </ReviewRating>
                        )}
                      </ReviewHeader>
                      <ReviewContent>
                        <ReviewText isExpanded={expandedReviews.has(review.id)}>
                          {review.content}
                        </ReviewText>
                        {review.content.length > 300 && (
                          <ReadMoreButton onClick={() => {
                            const newExpandedReviews = new Set(expandedReviews);
                            if (expandedReviews.has(review.id)) {
                              newExpandedReviews.delete(review.id);
                            } else {
                              newExpandedReviews.add(review.id);
                            }
                            setExpandedReviews(newExpandedReviews);
                          }}>
                            {expandedReviews.has(review.id) ? 'Read Less' : 'Read More'}
                          </ReadMoreButton>
                        )}
                      </ReviewContent>
                    </ReviewCard>
                  ))}
                  {visibleReviews < reviews.length && (
                    <LoadMoreContainer>
                      <LoadMoreButton onClick={handleLoadMoreReviews}>
                        Load More Reviews
                      </LoadMoreButton>
                    </LoadMoreContainer>
                  )}
                </ReviewsGrid>
              ) : (
                <NoContentMessage>No reviews available for this movie</NoContentMessage>
              )}
            </>
          )}
        </TabContent>
      </TabContainer>
      {showTrailerModal && selectedTrailer && (
        <ModalOverlay onClick={closeTrailerModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={closeTrailerModal}>
              &times;
            </CloseButton>
            <VideoContainer>
              <iframe
                src={buildYouTubeEmbedUrl(selectedTrailer.key, { 
                  autoPlay: true,
                  muted: false // Allow sound for manual trailer viewing
                })}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedTrailer.name}
              />
            </VideoContainer>
            <VideoQualityInfo>
              Playing in {getQualityDisplayName(currentVideoQuality)}
            </VideoQualityInfo>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
import React from 'react';
import Hero from '../components/movies/Hero';
import MovieRow from '../components/movies/MovieRow';
import MovieCarousel from '../components/movies/MovieCarousel';

const Home = () => {
    return (
        <div className="bg-background min-h-screen pb-20">
            <Hero />

            <div className="relative z-20 -mt-10 lg:mt-11">
                <MovieRow title="Trending Now" endpoint="/media/trending/movie" />
                <MovieRow title="Action Packed" endpoint="/media/search?q=action" />

                <MovieCarousel title="High Rated Anime" endpoint="/media/search?q=anime" minRating={7.5} />

                <MovieRow title="TV Shows" endpoint="/media/trending/tv" />
            </div>
        </div>
    );
};

export default Home;
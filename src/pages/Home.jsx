import React from 'react';
import Hero from '../components/movies/Hero';
import MovieRow from '../components/movies/MovieRow';
import MovieCarousel from '../components/movies/MovieCarousel';

const Home = () => {
    return (
        <div className="bg-surfaceDark min-h-screen pb-20">
            <Hero />

            <div className="relative z-20 -mt-6 sm:-mt-8 lg:-mt-10">
                <MovieRow
                    title="Trending Now"
                    endpoint="/media/trending/movie"
                    categorySlug="trending-movies"
                />
                <MovieRow
                    title="Action Packed"
                    endpoint="/media/search?q=action"
                    categorySlug="action"
                />

                <MovieCarousel
                    title="Latest Anime"
                    endpoint="/media/search?q=anime"
                    minRating={7.5}
                    categorySlug="anime"
                />

                <MovieRow
                    title="TV Shows"
                    endpoint="/media/trending/tv"
                    categorySlug="tv-shows"
                />
            </div>
        </div>
    );
};

export default Home;
import MovieCard from './MovieCard';

const MovieGrid = ({ movies = [] }) => {
    if (movies.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
                <MovieCard key={movie.id || movie._id} movie={movie} />
            ))}
        </div>
    );
};

export default MovieGrid;

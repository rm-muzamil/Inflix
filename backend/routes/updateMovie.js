const express = require("express");
const router = express.Router();
const Movie = require('../models/movie')


router.get('/edit-movie-list', async (req, res) =>{
    try {
        const movies = await Movie.find();
        res.render('editMovieList', { movies })
                
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error')        
    }
})


router.get('/movies/:id', async (req, res) =>{
    try {
        const movie = await Movie.findById(req.params.id);
        res.render('updateMovieDetails', { movie })
                
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error')        
    }
})



router.post('/update-movie/:id', async (req, res) =>{
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            {
            movieID: req.body.movieID,
            backdropPath: req.body.backdropPath,
            budget: Number(req.body.budget),
            genres: req.body.genres.split(','),
            genreIds: req.body.genreIds.split(',').map(id => Number(id)),
            originalTitle: req.body.originalTitle,
            overview: req.body.overview,
            popularity: Number(req.body.popularity),
            posterPath: req.body.posterPath,
            productionCompanies: req.body.productionCompanies,
            releaseDate: req.body.releaseDate,
            revenue: Number(req.body.revenue),
            runtime: Number(req.body.runtime),
            status: req.body.status,
            title: req.body.title,
            watchProviders: [req.body.watchProviders],
            logos: "https://image.tmdb.org/t/p/original" + req.body.logos,
            downloadLink: req.body.downloadLink,
            ratings: Number(req.body.ratings)

        },
        {new: true}
    )
    res.render('updateMovieDetails',{
        movie: updatedMovie,
        successMessage: "Movie updated successfully"
    })
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error')        
    }
})



module.exports = router;
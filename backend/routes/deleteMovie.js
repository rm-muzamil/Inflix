const express = require('express')
const router = express.Router();
const Movie = require('../models/movie');
const User = require('../models/User');

router.get('/delete-movie', async (req, res ) =>{
    try {
        const movies = await Movie.find()
        res.render('deleteMovie', {movies})        
    } catch (error) {
        console.error(error);
        res.status(500).send('internal server errorrrr')
    }
})

router.post('/delete-movie/:id', async (req, res) =>{
    try {
        const deleteMovie = await Movie.findOneAndDelete({ _id: req.params.id })      
        await User.updateMany({}, {$pull: {myList: req.params.id}})
        await User.updateMany({}, {$pull: {"watchedMovies": {movie: req.params.id}}})  
        const movies = await Movie.find()
        res.render('deleteMovie', {movies, successMessage: "Movie Deleted"})        
        
    } catch (error) {
        console.error(error);
        res.status(500).send('internal server errorrrr')
    }
})
module.exports = router;
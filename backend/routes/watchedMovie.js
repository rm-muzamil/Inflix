const express = require('express')
const router = express.Router();
const isLoggedIn = require('./isLoggedIn')
const Movie = require('../models/movie')

router.post('/update-watched-time/:movieId', isLoggedIn, async (req, res)=>{
    try {
        const user = req.user;
        const movieId = req.params.movieId;
        const watchedTime = req.body.watchedTime;
        const movieToUpdate = user.watchedMovies.find(item => item.movie.equals(movieId))
        console.log("movie to update", movieToUpdate);
        if (movieToUpdate) {
            movieToUpdate.watchedTime = watchedTime;
            
            const movieDetails = await Movie.findById(movieId)
            if (movieDetails) {
                movieToUpdate.uploadTime = Date.now()                
            }
        } else {
            const movieDetails = await Movie.findById(movieId)
            if (movieDetails) {
                user.watchedMovies.push({movie: movieId, watchedTime, uploadTime: Date.now() })                          
            }
            
        }


        await user.save()
        res.json({success: true, user})
    } catch (error) {
        res.status(500).json({ success: false, error:error.message})
    }
})

router.post('/remove-watched-time/:movieId', isLoggedIn, async (req, res)=>{
    try {
        const user = req.user;
        const movieToRemovie = req.params.movieId;
        const movieIndexToRemovie = user.watchedMovies.findIndex(item => item.movie.equals(movieToRemovie));

        if (movieIndexToRemovie !== -1) {
            user.watchedMovies.splice(movieIndexToRemovie, 1)    
            await user.save()        
            res.json({success:true, message:"movie removed successfully from watched list"})
        }else{
            res.status(404).json({success: false,message:"movie not found in watched list"})
        }


    } catch (error) {
        res.status(500).json({ success: false, error:error.message});
    }
})



router.post('/remove-all-watched-time', isLoggedIn, async (req, res)=>{
    try {
        const user = req.user;
        
            user.watchedMovies = []
            await user.save()        
            res.json({success:true, message:"All movies removed successfully from watched list"})



    } catch (error) {
        res.status(500).json({ success: false, error:error.message});
    }
})

router.get('/watched-time/:movieId', isLoggedIn, async (req, res)=>{
    try {
        const user = req.user;
        const movieId = req.params.movieId;
        const movieWatchedTime = user.watchedMovies.find(item => item.movie.equals(movieId))
        if (movieWatchedTime) {
            res.json({success:true, watchedTime: movieWatchedTime.watchedTime,})
        }else{
            res.json({success:true, watchedTime: 0,})        }


    } catch (error) {
        res.status(500).json({ success: false, error:error.message});
    }
})


router.get('/watched-movies', isLoggedIn, async (req, res)=>{
    try {
        const user = req.user;
        const watchedMovies = await Promise.all(user.watchedMovies.map(async ({movie, watchedTime, uploadTime}) =>{
            const movieDetails = await Movie.findById(movie);
            return {
                movie: movieDetails,
                watchedTime,
                uploadTime
            }
        }))
        watchedMovies.sort((a, b) => b.uploadTime - a.uploadTime)
        res.json({success: true, watchedMovies});
        


    } catch (error) {
        res.status(500).json({ success: false, error:error.message});
    }
})


module.exports = router;
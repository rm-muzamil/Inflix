require("dotenv").config();
const express = require("express");
const router = express.Router();
const Movie = require('../models/movie')
const fetch = require('node-fetch');

router.post("/fetch-movie", async (req, res) => {
  let search_term = req.body.search_term;
  // process.env.TMDB_AUTH_KEY

  try {
    const url =
      `https://api.themoviedb.org/3/search/movie?query=${search_term}&include_adult=false&language=en-US&page=1`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: process.env.TMDB_AUTH_KEY,
      },
    };

    const responseData = await fetch(url, options)
    const result = await responseData.json()
    if(result.results.length === 0){
        return res.status(404).json({error: "No movie found"})
    }
    res.render('addMovieList', {movieList: result.results})
    // res.json(result)
    // console.log(search_term);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "failled" });
  }
});

router.get('/addMovie/:movieId', async (req, res) =>{
  const movieId = req.params.movieId;

  try {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
const options = {
  method: 'GET',
  headers: {
        accept: "application/json",
        Authorization: process.env.TMDB_AUTH_KEY,
      },
    };

    const responseData = await fetch(url, options)
    const moviedetails  = await responseData.json()

    const watchProvidersUrl = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`;
    const watchProvidersResponse = await fetch(watchProvidersUrl, options)
    const watchProvidersResult = await watchProvidersResponse.json()

    const watchProviders = Object.keys(watchProvidersResult.results).filter((country) => country === "IN").map((country) =>{
      const countryData = watchProvidersResult.results[country];
      return {
        country,
        providerName: countryData.flatrate ? countryData.flatrate[0]?.provider_name : countryData.buy[0]?.provider_name
      }
        })  
        moviedetails.watchProviders = watchProviders
        const genreIds = moviedetails.genres.map(genre => genre.id);
        const genreNames = moviedetails.genres.map(genre => genre.name)
        moviedetails.genreIds = genreIds
        moviedetails.genres = genreNames
        moviedetails.production_companies = moviedetails.production_companies.map(country => country.name)
        moviedetails.watchProviders = moviedetails.watchProviders.map(provider => provider.providerName)

        res.render('addMovie', {moviedetails})
        
  



  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "failled" });
  }

})

router.post('/add-movie-details', async (req, res) => {
 try {
  const moviedetails = req.body
  const genreIds = moviedetails.genreIds.split(',').map(id =>Number(id));

  const existingMovie = await Movie.findOne({ movieID: moviedetails.id})
  if (existingMovie) {
    console.log(`Movie with movieID ${moviedetails.id}  already exist skipping`);
    return res.status(400).json({error: `movie with movieId ${moviedetails.id} already exist` })
        
  }
  
  const newMovie = new Movie({
    movieID: Number(moviedetails.id),
    backdropPath: 'https://image.tmdb.org/t/p/original' + moviedetails.backdrop_path,
    budget: Number(moviedetails.budget),
    genreIds: genreIds,
    genres: moviedetails.genres.split(','),
    originalTitle: moviedetails.original_title,
    overview: moviedetails.overview,
    popularity: Number(moviedetails.popularity),
    posterPath: 'https://image.tmdb.org/t/p/original' + moviedetails.poster_path,
    productionCompanies: moviedetails.production_companies,
    releaseDate: moviedetails.release_date,
    revenue: Number(moviedetails.revenue),
    runtime: Number(moviedetails.runtime),
    status: moviedetails.status,
    title: moviedetails.title,
    watchProviders: moviedetails.watchProviders,
    logos: 'https://image.tmdb.org/t/p/original' + moviedetails.logos,
    downloadLink: moviedetails.downloadLink,
    ratings: Number(moviedetails.ratings)
  })
  const saveMovie = await newMovie.save();
  res.render('addMovie', {successMessage: "movie detail successfully added"})
 } catch (error) {
  console.log(error);
  res.status(500).json({error: "failed to add a movie"})  
 }

})


module.exports = router;

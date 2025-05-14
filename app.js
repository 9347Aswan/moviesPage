const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Movies List API
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`
  const moviesArray = await db.all(getMoviesQuery)
  const formattedMovie = moviesArray.map(eachMoive => ({
    movieName: eachMoive.movie_name,
  }))
  response.send(formattedMovie)
})

//Create Book API

app.post('/movies/', async (request, response) => {
  const moiveDetails = request.body
  const {directorId, movieName, leadActor} = moiveDetails

  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      (
          ${directorId},
         '${movieName}',
         '${leadActor}'
      );`
  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//Get Movie API
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT
        movie_id,
        director_id,
        movie_name,
        lead_actor
    FROM
        movie
    WHERE
        movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  if (movie === undefined) {
    response.status(404).send('Movie Not Found')
  } else {
    const formattedOneMovie = {
      movieId: movie.movie_id,
      directorId: movie.director_id,
      movieName: movie.movie_name,
      leadActor: movie.lead_actor,
    }
    response.send(formattedOneMovie)
  }
})

//update book APi

app.put('/movies/:moviesId', async (request, response) => {
  const {moviesId} = request.params
  const moviesDetails = request.body
  const {directorId, movieName, leadActor} = moviesDetails

  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor='${leadActor}'
    WHERE
      movie_id = ${moviesId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//delete Movie API

app.delete('/movies/:moviesId', async (request, response) => {
  const {moviesId} = request.params
  const deleteMoiveArray = `
  DELETE FROM 
    movie 
  WHERE 
  movie_id = ${moviesId}`
  await db.run(deleteMoiveArray)
  response.send('Movie Removed')
})

//Get Directors API

app.get('/directors/', async (request, response) => {
  const getDirectorArray = `
  SELECT
   *
  FROM 
  director 
  ORDER BY
  director_id`
  const directorArray = await db.all(getDirectorArray)
  const formatedDirectors = directorArray.map(eachDirector => ({
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  }))
  response.send(formatedDirectors)
})

//Get Specific Movie API

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
  SELECT 
  movie_name
  FROM 
  movie
  WHERE 
  director_id = ${directorId}`
  const movieArray = await db.all(getDirectorMovieQuery)
  const formatedSpecifiCMovie = movieArray.map(eachMovie => ({
    movieName: eachMovie.movie_name,
  }))
  response.send(formatedSpecifiCMovie)
})

module.exports = app

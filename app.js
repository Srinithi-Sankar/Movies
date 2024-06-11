const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()

app.use(express.json())
const databasePath = path.join(__dirname, 'moviesData.db')

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

function converting(eachObj) {
  return {movieName: eachObj.movie_name}
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
    movie_name
    FROM
    movie;`
  const moviesArray = await database.all(getMoviesQuery)
  response.send(moviesArray.map(eachObj => converting(eachObj)))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES 
    (${directorId}, '${movieName}', '${leadActor}');`
  await database.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT 
    movie_id as movieId,
    director_id as directorId,
    movie_name as movieName,
    lead_actor as leadActor
    FROM
    movie
    WHERE
    movie_id = ${movieId};`
  const result = await database.get(getMovieQuery)
  response.send(result)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id =${directorId},
    movie_name = '${movieName}' ,
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};
    `

  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
        DELETE FROM
        movie
        WHERE
        movie_id = '${movieId}';
        `
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

function convertingCase(eachObj) {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}





app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
        SELECT 
        *
        FROM
        director;`
  const directorsArray = await database.all(getDirectorsQuery)
  response.send(directorsArray.map(eachDirector => convertingCase(eachDirector)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorsMovieQuery = `
        SELECT 
        movie.movie_name as movieName
        FROM 
        director NATURAL JOIN movie
        WHERE 
        director.director_id ='${directorId}';
        `
  const result = await database.all(getDirectorsMovieQuery)
  console.log(directorId)
  response.send(result)
})

module.exports = app

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET Movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  const updatedMoviesArray = moviesArray.map((movieObject) => {
    const updatedMovieObject = {
      movieName: movieObject.movie_name,
    };
    return updatedMovieObject;
  });
  response.send(updatedMoviesArray);
});

//ADD movie API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `INSERT INTO movie ( director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET Movie API
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const selectMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(selectMovieQuery);
  const updatedMovie = {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
  response.send(updatedMovie);
});

//UPDATE Movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie 
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE Movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  const updatedDirectorsArray = directorsArray.map((directorObject) => {
    const updatedDirectorObject = {
      directorId: directorObject.director_id,
      directorName: directorObject.director_name,
    };
    return updatedDirectorObject;
  });
  response.send(updatedDirectorsArray);
});

//GET Director Movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT * FROM movie WHERE director_id = ${directorId};`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  const movieNamesArray = moviesArray.map((movieObject) => {
    return {
      movieName: movieObject.movie_name,
    };
  });
  response.send(movieNamesArray);
});

module.exports = app;

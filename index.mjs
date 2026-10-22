import express from 'express';
import fetch from 'node-fetch';
const solarSystem = (await import('npm-solarsystem')).default;

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// The nine planet pages use the same EJS template.
const planets = {
    Mercury: solarSystem.getMercury(),
    Venus: solarSystem.getVenus(),
    Earth: solarSystem.getEarth(),
    Mars: solarSystem.getMars(),
    Jupiter: solarSystem.getJupiter(),
    Saturn: solarSystem.getSaturn(),
    Uranus: solarSystem.getUranus(),
    Neptune: solarSystem.getNeptune(),
    Pluto: solarSystem.getPluto()
};

const navigationPlanets = Object.keys(planets);
const asteroids = solarSystem.getAsteroids();
const comets = solarSystem.getComets();

app.get('/', async (req, res) => {
    let images = [];
    let imageError = false;

    try {
        // This is the Pixabay API URL provided for Teams 11 to 20.
        const pixabayUrl = 'https://pixabay.com/api/?key=20426927-497d14db9c234faf7d0df8317&per_page=50&orientation=horizontal&q=solar%20system';
        const response = await fetch(pixabayUrl);

        if (!response.ok) {
            throw new Error('Pixabay request failed');
        }

        const data = await response.json();
        const pictures = data.hits;

        // Pick four different random images from Pixabay.
        for (let i = 0; i < 4 && pictures.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * pictures.length);
            images.push(pictures[randomIndex].webformatURL);
            pictures.splice(randomIndex, 1);
        }
    } catch (error) {
        imageError = true;
    }

    res.render('home.ejs', {
        planets: navigationPlanets,
        images,
        imageError
    });
});

app.get('/planetInfo', (req, res) => {
    const planetName = req.query.planet;
    const planet = planets[planetName];

    if (!planet) {
        return res.status(404).send('Planet not found. Please choose a planet from the navigation menu.');
    }

    res.render('planet.ejs', {
        planets: navigationPlanets,
        name: planetName,
        planet
    });
});

app.get('/asteroids', (req, res) => {
    res.render('solar-info.ejs', {
        planets: navigationPlanets,
        title: 'Asteroids',
        information: asteroids
    });
});

app.get('/comets', (req, res) => {
    res.render('solar-info.ejs', {
        planets: navigationPlanets,
        title: 'Comets',
        information: comets
    });
});

app.get('/nasa-pod', async (req, res) => {
    let picture = null;
    let podError = false;

    try {
        // No date is supplied, so NASA returns the current day's picture.
        const nasaUrl = 'https://api.nasa.gov/planetary/apod?api_key=9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD';
        const response = await fetch(nasaUrl);

        if (!response.ok) {
            throw new Error('NASA request failed');
        }

        picture = await response.json();
    } catch (error) {
        podError = true;
    }

    res.render('nasa-pod.ejs', {
        planets: navigationPlanets,
        picture,
        podError
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});

// YouTube API video uploader using JavaScript/Node.js
// You can find the full visual guide at: https://www.youtube.com/watch?v=gncPwSEzq1s
// You can find the brief written guide at: https://quanticdev.com/articles/automating-my-youtube-uploads-using-nodejs
//
// Upload code is adapted from: https://developers.google.com/youtube/v3/quickstart/nodejs

const fs = require('fs');
const readline = require('readline');
const assert = require('assert')
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// video category IDs for YouTube:
exports.categoryIds = {
    AutosVehicles: 2,
    FilmAnimation: 1,
    Music: 10,
    PetsAnimals: 15,
    Sports: 17,
    ShortMovies: 18,
    TravelEvents: 19,
    Gaming: 20,
    Videoblogging: 21,
    PeopleBlogs: 22,
    Comedy: 23,
    Entertainment: 24,
    NewsPolitics: 25,
    HowtoStyle: 26,
    Education: 27,
    ScienceTechnology: 28,
    NonprofitsActivism: 29,
    Movies: 30,
    AnimeAnimation: 31,
    ActionAdventure: 32,
    Classics: 33,
    Comedy: 34,
    Documentary: 35,
    Drama: 36,
    Family: 37,
    Foreign: 38,
    Horror: 39,
    SciFiFantasy: 40,
    Thriller: 41,
    Shorts: 42,
    Shows: 43,
    Trailers: 44
};

exports.privacyStatus = {
    Public: 'public',
    Private: 'private',
    Unlisted: 'unlisted'
}


// If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = './' + 'client_oauth_token.json';

exports.uploadVideo = (videoFilePath, thumbFilePath, title, description, tags) => {
    assert(fs.existsSync(videoFilePath))
    assert(fs.existsSync(thumbFilePath))

    // Load client secrets from a local file.
    fs.readFile('./client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        authorize(JSON.parse(content), (auth) => uploadVideo(auth, videoFilePath, thumbFilePath, date, title, description, tags));
    });
}

/**
 * Upload the video file.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function uploadVideo(auth, videoFilePath, thumbFilePath, date, title, description, tags) {
    const service = google.youtube('v3')

    service.videos.insert({
        auth: auth,
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title,
                description,
                tags,
                categoryId: categoryIds.ScienceTechnology,
                defaultLanguage: 'en',
                defaultAudioLanguage: 'en'
            },
            status: {
                privacyStatus: "private",
                publishAt: date
            },
        },
        media: {
            body: fs.createReadStream(videoFilePath),
        },
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response.data)

        console.log('Video uploaded. Uploading the thumbnail now.')
        service.thumbnails.set({
            auth: auth,
            videoId: response.data.id,
            media: {
                body: fs.createReadStream(thumbFilePath)
            },
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            console.log(response.data)
        })
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.web.client_secret;
    const clientId = credentials.web.client_id;
    const redirectUrl = 'http://www.example.com/oauth2callback';
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}


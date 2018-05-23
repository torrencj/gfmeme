/*
Guy Fieri Meme Checker v2 Backend
John Torrence 2018 (MIT License)

Accept file uploads with Multer.
*/
const fs             = require('fs-extra');
const express        = require('express');
const multer         = require('multer');
const path           = require('path');
const url            = require('url');
const app            = express();

const vision = require('@google-cloud/vision');

//Setup client for gcloud vision
const client = new vision.ImageAnnotatorClient();

/*
Use CORS and Multer for files
*/
app.use(multer({dest:'/tmp/uploads/'}).single('file'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/*
Politely ask Google for who and what is in the photo. If any text includes 'flavortown' or Big G
thinks this image has Guy Fieri in it, return true.
*/
//GCF doesn't support async/await at the moment. :(
// async function webDetection(fileName) {
//   console.log("starting web detection");
//   var detectionResult = false;
//
//   const entityResults = await client.webDetection(fileName)
//   const textResults = await client.textDetection(fileName)
//
//   const fullText = textResults[0].fullTextAnnotation;
//   const entities = entityResults[0].webDetection.bestGuessLabels[0]
//
//   if ( ( fullText && fullText.text.toLowerCase().includes('flavortown') ) ||
//        ( entities && entities.label.includes('fieri') ) ) {
//          console.log(true);
//     return true;
//   } else {
//     return false;
//   }
// }

function webDetection(fileName) {
  console.log(`starting detection on ${fileName}`);
  return client.webDetection(fileName) /* TODO rename this, it's confusing*/
  .then(entityResults => {
    return client.textDetection(fileName)
    .then(textResults => {
      if (entityResults[0].error) {
        throw new Error(entityResults[0].error.message);
      } else {
        const fullText = textResults[0].fullTextAnnotation;
        const entities = entityResults[0].webDetection.bestGuessLabels[0]

        if ( ( fullText && fullText.text.toLowerCase().includes('flavortown') ) ||
             ( entities && entities.label.includes('fieri') ) ) {
               console.log(true);
          return true;
        } else {
          return false;
        }
      }
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  })
  .catch(err => {
      console.error('ERROR:', err);
    });
}



/*
URL route -- GET
*/
app.get('/', (req, res) => {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  console.log(`Fetching ${query.url}`);

  webDetection(query.url).then(isGFmeme => {
    console.log('is it a meme?',isGFmeme);

    console.log('detection done');
    if ((isGFmeme != undefined)) {
      if (isGFmeme) {
        res.status('200').send('Spicy')
      } else {
        res.status('200').send('Lame')
      }
    } else {
      res.status('400').send('Something went wrong.')
    }

  })
  .catch(err => {
    console.log(err);
    res.status('500').send('Cannot complete request')
  })
});

/*
Upload Route -- POST
TODO -- DRY this up.
*/
app.route('/upload')
.post( function(req, res){
  var file = req.file.path;

  webDetection(file).then(isGFmeme => {
    if (isGFmeme) {
      res.status('200').send('Spicy')
    } else {
      res.status('200').send('Lame')
    }
  })
  .catch(err => {
    console.log(err);
    res.status('500').send('Cannot complete request')
  })
});


exports.GFM = (req, res) => {
  app(req, res);
};

// exports.GFM = functions.https.onRequest(app);

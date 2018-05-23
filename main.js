/*
Guy Fieri Meme Checker v2 Backend (GCF version)
John Torrence 2018 (MIT License)

Accept file uploads with Multer.
*/
const fs             = require('fs-extra');
const express        = require('express');
const multer         = require('multer');
const path           = require('path');
const cors           = require('cors');
const url            = require('url');
const vision         = require('@google-cloud/vision');
const fileparser     = require('express-multipart-file-parser');
const app            = express();


//Setup client for gcloud vision
const client = new vision.ImageAnnotatorClient();

//Setup app options
app.use(cors())
app.use(fileparser)
app.options('*', cors()) // include before other routes


/*
Politely ask Google for who and what is in the photo. If any text includes 'flavortown' or Big G
thinks this image has Guy Fieri in it, return true.

TODO use image annotate request instead of two separate calls.
*/
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

/*Async/Await version not supported by GCF*/
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


/*
URL route -- GET
TODO This is currently broken, G complains that they cannot access the image.
*/
app.get('/', (req, res) => {
  console.log(req.url);
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  console.log(`Fetching ${query.url}`);

  webDetection(query.url).then(isGFmeme => {
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
TODO -- is cors necessary if I'm using app.use?
*/
app.post('/upload', cors(), function(req, res){
  console.log(req.files);
  // console.log(req.files[0]);

  const file = req.files[0].buffer
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

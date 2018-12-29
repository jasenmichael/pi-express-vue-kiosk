const host = process.env.HOST || '0.0.0.0'
const port = process.argv[2] || 80

const fs = require('fs')
const path = require('path')

const express = require('express')
const cors = require('cors')
const consola = require('consola')
const _ = require('lodash')

const app = express()

app.set('port', port)
app.use(cors())


app.listen(port, host)
consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
})

// routes
// serve public folder, this is where we will serve the static html from our frontend/dist
app.use('/', express.static('frontend/dist'));
app.use('/images', express.static('public/images'));

// images api, will list all image files in the public/images directory
app.get('/api/images', cors(), (req,res) => {
    console.log('api/images hit')
    let images = loadImages()
    images.then(function(images){
      console.log("file count ", images.length)
      return images
    }).then(images => {
      let shuffled = _.shuffle(images)
      // console.log("chunk length", _.chunk(shuffled, [size=50])[0].length)
      let imageBatch = _.chunk(shuffled, [size=50])[0]
      res.json({images: imageBatch});
    }).catch(err => {console.log(err)})
  })




// load images
async function loadImages() {
    let dir = 'public/images'
    let files = []
    await walkSync(dir, function (filePath, stat) {
        // do something with "filePath"...
        console.log('file path', filePath)
        files.push(filePath.slice(7))
    });
    // console.log(images)
    let images = await files.filter(function (e) {
        // if (e.slice(3) === ("png" || "jpg") ) {
        //   return path.extname(e).toLowerCase()
        // }
        return path.extname(e).toLowerCase() === ".png" || ".jpg"
    })
    return images
}

async function walkSync(currentDirPath, callback) {

    await fs.readdirSync(currentDirPath).forEach(async function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            await walkSync(filePath, callback);
        }
    })
}
const { GoogleGenerativeAI } = require('@google/generative-ai')

const dotenv = require('dotenv')
const express = require('express')
const fs = require('fs') // input data
const multer = require('multer') // input data
const path = require('path') // input data
const port = 3000 // setting utk express

dotenv.config()
const app = express() // prepare for app routes
app.use(express.json()) // utk baca json di express

const genAI = new GoogleGenerativeAI(process.env.api_key)
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" })

// setting multer
const upload = multer({ dest: 'uploads/' })

// console.log(process.env.api_key)
// run()

// endpoint for generated text with gemini api
app.post("/generate-text", async (req, res) => {
    const { prompt } = req.body
    try {
      let result = await model.generateContent(prompt)
      let response = result.response
      // console.log(response.text())
      res.status(200).json({ output: response.text() })
    } catch (error) {
      // console.log(error)
      res.status(500).json({ error: error.message })
    }
  })


// endpoint for read image to text with gemini api
// setting for generated information from multer
const imageGeneratePart = (filePath) => ({
    inlineData: {
      data: fs.readFileSync(filePath).toString('base64'),
      mimeType: 'image/png'
    }
  })
  
  app.post("/generate-from-image", upload.single('image'), async (req, res) => {
    const prompt = req.body.prompt || 'describe the picture'
    const image = imageGeneratePart(req.file.path)
  
    try {
      let result = await model.generateContent([prompt, image])
      let response = result.response
      // console.log(response.text())
      res.status(200).json({ output: response.text() })
    } catch (error) {
      // console.log(error)
      res.status(500).json({ error: error.message })
    }
  })

  app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);
    const base64Data = buffer.toString('base64');
    const mimeType = req.file.mimetype;
  
    try {
      const documentPart = {
        inlineData: { data: base64Data, mimeType }
      };
  
      const result = await model.generateContent(['Analyze this document:', documentPart]);
      const response = await result.response;
      res.json({ output: response.text() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      fs.unlinkSync(filePath);
    }
  });

  app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const audioBuffer = fs.readFileSync(req.file.path);
    const base64Audio = audioBuffer.toString('base64');
    const audioPart = {
      inlineData: {
        data: base64Audio,
        mimeType: req.file.mimetype
      }
    };
  
    try {
      const result = await model.generateContent([
        'Transcribe or analyze the following audio:', audioPart
      ]);
      const response = await result.response;
      res.json({ output: response.text() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    } finally {
      fs.unlinkSync(req.file.path);
    }
  });
  

app.listen(port, () => {
  console.log(`this gemini api running on localhost ${port}`)
})
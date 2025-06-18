const { GoogleGenerativeAI } = require('@google/generative-ai')

const dotenv = require('dotenv')
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.api_key)
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" })

// console.log(process.env.api_key)
async function run() {
  try {
    let prompt = 'write story about ai and magic'
    let result = await model.generateContent(prompt)
    let response = await result.response
    console.log(response.text())
  } catch (error) {
    console.log(error)
  }
}

run()
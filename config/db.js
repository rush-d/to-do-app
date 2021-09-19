const mongoose = require('mongoose')

var connectionString = 'mongodb+srv://cloudsoftdev:cluster0@to-do-app.cthna.mongodb.net/To-Do-App?retryWrites=true&w=majority'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = connectDB

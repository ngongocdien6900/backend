const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/chat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}, (err) => {
    if (err) {
      console.log("Error : " + err);
    }
    else {
      console.log("Connected successfully");
    }
  }
);

module.exports = mongoose;
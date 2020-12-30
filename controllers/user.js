const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");

//for email
const { OAuth2Client } = require("google-auth-library");
//clientID
const client = new OAuth2Client(process.env.CLIENT_ID);

//facebook
const fetch = require("node-fetch");

module.exports = {
  postLoginGoogle: (req, res, next) => {
    const { tokenId } = req.body;

    client
      .verifyIdToken({
        idToken: tokenId,
        audience: process.env.CLIENT_ID,
      })
      .then((data) => {
        const { email, name, imageUrl, sub } = data.payload;

        if (data) {
          UserModel.findOne({
            "google.email": email,
          })
            .exec()
            .then((user) => {
              //nếu đã đăng nhập bằng google rồi thì trả về token cho nó.
              if (user) {
                const token = jwt.sign(
                  {
                    _id: user._id,
                  },
                  "secret",
                  {
                    expiresIn: "7d",
                  }
                );
                return res.status(200).json({
                  token,
                  user: user,
                });
              } //nếu chưa đăng ký thì tạo mới
              else {
                const user = new UserModel({
                  fullname: name,
                  "google.email": email,
                  "google.uid": sub,
                  avatar: imageUrl,
                });
                user
                .save()
                .then((result) => {
                  const token = jwt.sign(
                    {
                      _id: result._id,
                    },
                    process.env.JWT,
                    {
                      expiresIn: "7d",
                    }
                  );
                  return res.status(200).json({
                    token,
                    user: result,
                  });
                })
                .catch((err) => {
                  res.status(500).json({
                    error: err,
                  });
                });
              }
            }); 
        }
      });
  },

  postLoginFacebook: (req, res, next) => {
    const { accessToken, userID } = req.body;

    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    fetch(urlGraphFacebook, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((response) => {
        const { email, name, id } = response;

        if (response) {
          UserModel.findOne({
            "facebook.email": email,
          })
            .exec()
            .then((user) => {
              //nếu đã đăng nhập bằng facebook rồi thì trả về token cho nó.
              if (user) {
                const token = jwt.sign(
                  {
                    _id: user._id,
                  },
                  "secret",
                  {
                    expiresIn: "7d",
                  }
                );
                return res.status(200).json({
                  token,
                  user: user,
                });
              } //nếu chưa đăng ký thì tạo mới
              else {
                const user = new UserModel({
                  fullname: name,
                  "facebook.email": email,
                  "facebook.uid": id,
                });
                user
                  .save()
                  .then((result) => {
                    const token = jwt.sign(
                      {
                        _id: result._id,
                      },
                      process.env.JWT,
                      {
                        expiresIn: "7d",
                      }
                    );
                    return res.status(200).json({
                      token,
                      user: result,
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      error: err,
                    });
                  });
                }
            });
        }
      });
  },

};

const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");

//sendmail
const mailgun = require('mailgun-js');
const DOMAIN = 'sandboxd6a5d0b442d44047ac64e3a6d3f96be8.mailgun.org';
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

//for email
const { OAuth2Client } = require("google-auth-library");
//clientID
const client = new OAuth2Client(
  "558364175234-514g61eos4bo97uj5mp2vsum8j22dupr.apps.googleusercontent.com"
);

//facebook
const fetch = require("node-fetch");

module.exports = {
  postLoginGoogle: (req, res, next) => {
    const { tokenId } = req.body;

    client
      .verifyIdToken({
        idToken: tokenId,
        audience:
          "558364175234-514g61eos4bo97uj5mp2vsum8j22dupr.apps.googleusercontent.com",
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

                //nếu chưa đăng ký thì tạo mới
              } else {
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
                      "secret",
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

                //nếu chưa đăng ký thì tạo mới
              } else {
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
                      "secret",
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

  postForgotPassword: (req, res, next) => {
    const { email } = req.body;

    UserModel.findOne({ "google.email":email })
      .exec()
      .then((user) => {
        if (!user)
          return res.status(400).json({ error: "Địa chỉ email không tồn tại" });

        const token = jwt.sign(
          { _id: user._id },
          process.env.RESET_PASSWORD_KEY,
          { expiresIn: "1h" }
        );
        const data = {
          from: 'ngocdien6900@hihi.com',
          to: email,
          subject: 'Đặt lại mật khẩu',
          html: `
              <h2>NHấn vào link để đật lại mật khẩu</h2>
              <p>http://localhost:3000/resetpassword/${token}</p>
          `
        }
        return UserModel.updateOne({resetLink: token}, (err, success) => {
          if(err) {
            return res.status(400).json({ error: "Link đặt lại mật khẩu lỗi" });
          }
          else {
            mg.messages().send(data, (error, body) => {
              if(error) 
                return res.json({
                  error: "Thất bại"
                })
              return res.json({message: 'Đã gửi link về mail của bạn'})
            });
          }
        })
      }
      );
  },

  postResetPassword: (req, res, next) => {
    const {resetLink, newPassword} = req.body;
    if(resetLink) {
      jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, (err, decodeData) => {
        if(err) 
          return res.status(401).json({
            err: "Sai token hoặc hết hạn"
          })
        UserModel.findOne({resetLink})
        .then(user => {
          if(!user) {
            return res.status(400).json({ error: "Token không tồn tại" });
          }
          UserModel.updateOne({
            password: newPassword,
            resetLink: ''
          }, (error, result) => {
            if(error) return res.status(400).json({ error: "Đặt lại mật khẩu lỗi" }); 
            else return res.status(200).json({ error: "Đổi password thành công" }); 
          })
        })
      })
    } else {
      return res.status(400).json({ error: "Reset link không tồn tại" });
    }
  }
};

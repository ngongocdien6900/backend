const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//sendmail
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox490f2be9152e452ebbe8c3e32c9daff6.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

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




  //admin here
  postLogin: (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({
      "admin.email": email,
    })
      .exec()
      .then((admin) => {
        if (!admin) {
          return res.status(401).json({
            message: "Đăng nhập thất bại",
          });
        }
        bcrypt.compare(password, admin.admin.password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Sai username hoặc không tồn tài",
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                _id: admin._id,
              },
              "secret",
              {
                expiresIn: "7d",
              }
            );
            return res.status(200).json({
              token,
              admin: admin,
            });
          }
          res.status(401).json({
            message: "Đăng nhập thất bại",
          });
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  },

  postRegister: (req, res) => {
    const { email, fullname, password, gender } = req.body;

    UserModel.findOne({
      "admin.email": email,
    })
      .exec()
      .then((admin) => {
        if (admin) {
          return res.status(409).json({
            message: "Email đã tồn tại",
          });
        } else {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const admin = new UserModel({
                "admin.email": email,
                fullname,
                gender,
                "admin.password": hash,
              });
              admin
                .save()
                .then((result) => {
                  res.status(201).json({
                    message: "Tạo thành công",
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

  postForgotPassword: (req, res) => {
    const { email } = req.body;

    UserModel.findOne({
      "admin.email": email,
    })
      .exec()
      .then((admin) => {
        if (!admin)
          return res.status(400).json({
            message: "Không tìm thấy địa chỉ email",
          });

        const token = jwt.sign(
          { _id: admin._id },
          process.env.RESET_PASSWORD_KEY,
          { expiresIn: "20m" }
        );

        const data = {
          from: "diendinhcao@vippro.com",
          to: email,
          subject: "Đặt lại mật khẩu",
          html: `
              <h2>Nhấn vào link để đật lại mật khẩu của bạn</h2>
              <p>http://localhost:3000/admin/auth/resetpassword/${token}</p>`,
        };
        return UserModel.updateOne({
          "admin.resetLink": token,
        }).then((success) => {
          if (!success)
            return res
              .status(400)
              .json({ message: "Link đặt lại mật khẩu lỗi" });

          mg.messages().send(data, (error, body) => {
            if (error)
              return res.status(400).json({
                message: "Gửi mail thất bại",
              });
            return res.status(200).json({ message: "Đã gửi về email của bạn" });
          });
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: error,
        });
      });
  },

  postResetPassword: (req, res, next) => {
    const { resetLink, newPassword } = req.body;

    if (resetLink) {
      jwt.verify(
        resetLink,
        process.env.RESET_PASSWORD_KEY,
        (err, decodeData) => {
          if (err)
            //nếu quá thời gian 20p sẽ xuất hiện lỗi này
            return res.status(401).json({
              message: "Link đã hết hiệu lực hoặc không tồn tại",
            });
          //nếu reset link ở client trùng với reset link ở db thì cho phép cho update password
          UserModel.findOne({ "admin.resetLink": resetLink })
            .exec()
            .then((result) => {
              if (!result) {
                return res.status(400).json({ message: "Token không tồn tại" });
              }

              bcrypt.hash(newPassword, 10, (err, hash) => {
                if (err) {
                  return res.status(500).json({
                    message: err,
                  });
                } else {
                  UserModel.updateOne(
                    {
                      "admin.password": hash,
                      "admin.resetLink": "",
                    },
                    (error, data) => {
                      if (error)
                        return res.status(400).json({
                          message: "Đổi password thất bại",
                        });
                      else
                        return res.status(200).json({
                          message: "Bạn đã thay đổi password thành công",
                        });
                    }
                  );
                }
              });
            });
        }
      );
    } else {
      return res.status(400).json({
        message: "Reset link không tồn tại",
      });
    }
  },
};

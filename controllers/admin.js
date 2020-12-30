const UserModel = require("../models/user");
const ConversationModel = require("../models/conversation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//sendmail
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox490f2be9152e452ebbe8c3e32c9daff6.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

module.exports = {
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
        if (admin) 
          return res.status(409).json({
            message: "Email đã tồn tại",
          });
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) 
              return res.status(500).json({
                error: err,
              });
            else {
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
                if (err) 
                  return res.status(500).json({
                    message: err,
                  }); 
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
                    return res.status(200).json({
                      message: "Bạn đã thay đổi password thành công",
                    });
                  }
                );
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

  getAllConversation: (req, res) => {
    ConversationModel.find({}).sort({createAt: -1})
    .then(data => {
        res.status(200).json({
            conversations: data,
        })
    });
  },
  
};



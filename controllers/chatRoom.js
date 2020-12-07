const ChatRoomModel = require("../models/chatRoom");

module.exports = {
  createChatRoom: (req, res) => {
    const { name } = req.body;

    ChatRoomModel.findOne({
      name,
    })
      .exec()
      .then((room) => {
        if (room)
          return res.status(409).json({
            message: "Tên phòng đã tồn tại, vui lòng đặt tên khác",
          });
        const chatRoom = new ChatRoomModel({
          name,
        });
        chatRoom.save();
        res.status(200).json({
          message: "Tạo phòng thành công!",
        });
      });
  },

  //lấy danh sách phòng để ở bên kia
  getAllChatRooms: async (req, res) => {
    const chatRooms = await ChatRoomModel.find({});

    res.json(chatRooms);
  }
};

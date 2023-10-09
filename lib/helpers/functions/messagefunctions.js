const User = require("../../../model/User");
const Message = require("../../../model/messages");
const { NotFoundError, Unauthorized } = require("../../error");

async function addMessageToConversation(
  haveConversation,
  textMessage,
  receiver,
  sender,
  data
) {
  haveConversation.messages.push({ sender: data.userId, message: textMessage });

  await haveConversation.save();
  //send notification to inbox
  receiver.profile.inbox.push({
    user: data.userId,
    userName: sender.profile.userName,
  });

  await receiver.save();

  //find and populate conversation
  const conversation = await Message.findOne({
    conversers: [data.userId, data.receiverId],
  }).populate("messages.sender", "profile.userName");

  const newConversation = conversation.messages.map((message) => ({
    sender: message.sender.profile.userName,
    message: message.message,
  }));
  let newConversationLength = newConversation.length;

  //make username for user = you
  for (i = 0; i < newConversationLength; i++) {
    if (newConversation[i].sender === sender.profile.userName) {
      newConversation[i].sender = "You";
    }
  }
  return { message: "message sent", newConversation };
}

async function userGroupAction(userId, groupId, userName) {
  const userToManage = await User.findOne({
    "profile.userName": userName,
  }).select("_id");
  if (!userToManage) {
    throw new NotFoundError("Users not found");
  }
  const group = await Message.findById(groupId);

  if (!group) {
    throw new NotFoundError("Group not found");
  }
  //check if user is and admin
  const isAdmin = group.admins.find(
    (admin) => admin.toString() === userId.toString()
  );

  if (!isAdmin) {
    throw new Unauthorized("You are not an admin");
  }
  return { group, userToManage };
}

module.exports.addMessageToConversation = addMessageToConversation;
module.exports.userGroupAction = userGroupAction;

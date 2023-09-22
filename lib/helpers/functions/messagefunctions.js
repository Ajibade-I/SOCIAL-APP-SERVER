const Message = require("../../../model/messages");

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

module.exports.addMessageToConversation = addMessageToConversation;

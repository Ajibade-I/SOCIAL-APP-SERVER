const {
  BadRequestError,
  NotFoundError,
  Unauthorized,
} = require("../lib/error");
const {
  addMessageToConversation,
} = require("../lib/helpers/functions/messagefunctions");
const {
  validateMessage,
  validateGroup,
} = require("../lib/validation/messagevalidation");
const User = require("../model/User");
const Message = require("../model/messages");

//@Method: POST /message/:userId
//@Desc:to send a message to another profile
//@Access:private

const message = async (req, res, next) => {
  const userId = req.user._id;
  const query = req.params.userId;

  //prevent user from messaging themselves
  if (userId.toString() === query) {
    throw new BadRequestError("You cannot send yourself a message");
  }

  //get sender and receiver
  const sender = await User.findById(userId);

  const receiver = await User.findById(query);
  if (!receiver) {
    throw new BadRequestError("User not found");
  }

  const error = await validateMessage(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const { textMessage } = req.body;

  //get sender inbox
  const senderInbox = await User.findById(userId)
    .populate({ path: "profile.inbox.user", model: "User" })
    .select("profile.inbox");

  //check if receiver is in sender inbox
  const hasSeenMessage = senderInbox.profile.inbox.find(
    (inboxItem) => String(inboxItem.user._id) === String(receiver._id)
  );

  //remove receiver from sender inbox
  if (hasSeenMessage) {
    await User.findOneAndUpdate(
      { _id: sender._id },
      { $pull: { "profile.inbox": { user: receiver._id } } }
    );
  }

  //check for ongoing conversation
  const haveConversation = await Message.findOne({
    conversers: [userId, receiver._id],
  }).populate("messages.sender", "profile.userName");

  const receiverId = receiver._id;
  //add message to ongoing conversation
  if (haveConversation) {
    const response = await addMessageToConversation(
      haveConversation,
      textMessage,
      receiver,
      sender,
      { userId, receiverId }
    );

    res.status(200).json(response);
    return;
  }

  //initialize new conversation
  const message = new Message({
    conversers: [userId, receiver._id],
    messages: [{ sender: userId, message: textMessage }],
  });

  await message.save();

  //send notification to inbox
  receiver.profile.inbox.push({
    user: userId,
    userName: sender.profile.userName,
  });

  await receiver.save();

  res.status(200).json({ message: "Message sent", textMessage });
};

//@Method: POST /message/:messageId/view
//@Desc:to view messages
//@Access:private

const getMessages = async (req, res, next) => {
  //retreive user and receiver id
  const userId = req.user._id;
  const messageId = req.params.messageId;

  const user = await User.findById(userId);

  //find conversation and populate sender field with profile.userName
  const conversation = await Message.findOne({
    _id: messageId,
  }).populate("messages.sender", "profile.userName");

  if (!conversation) {
    throw new NotFoundError(`message not found`);
  }
  if (!conversation.conversers.includes(userId)) {
    throw new Unauthorized("You are not permitted to view these messages");
  }
  //map through conversation to select necessary properties
  const modifiedConversation = conversation.messages.map((message) => ({
    sender: message.sender.profile.userName,
    message: message.message,
  }));
  let modifiedConversationLength = modifiedConversation.length;

  //make username for user = you
  for (i = 0; i < modifiedConversationLength; i++) {
    if (modifiedConversation[i].sender === user.profile.userName) {
      modifiedConversation[i].sender = "You";
    }
  }

  res.status(200).json({ modifiedConversation });
};

//@Method:POST /message/create/group
//@Desc:to create a group
//@Access:private

const createGroup = async (req, res, next) => {
  const userId = req.user._id;

  const error = await validateGroup(req.body);
  if (error) {
    throw new BadRequestError(error);
  }
  const { userNames } = req.body;

  //find the provided usernames
  const users = await User.find({ "profile.userName": { $in: userNames } });

  //Get the usernames of the profiles found
  const foundUsernames = users.map((user) => user.profile.userName);

  //check if there are users that were not found
  const foundUsers = userNames.filter((item) => !foundUsernames.includes(item));
  if (foundUsers.length !== 0) {
    res.status(404).json({ message: `Users ${foundUsers} not found` });
    return;
  }

  //get all the user ids of the group menbers
  const userIds = users.map((user) => user._id);
  userIds.push(userId);

  //fix the need to add message
  const message = new Message({
    conversers: userIds,
    messages: [{ sender: userId }],
  });

  await message.save();
  res.status(200).json({ message: "Group created succesfully" });
};

//@Method:POST /message/:groupId/message
//@Desc:to message a group
//@Access:private
const messageGroup = async (req, res, next) => {
  const userId = req.user._id;
  const query = req.params.groupId;
  const group = await Message.findById(query).populate(
    "messages.sender",
    "profile.userName"
  );
  if (!group) {
    throw new BadRequestError("Group does not exist");
  }

  //check if user is a member of the group
  const aMember = group.conversers.includes(userId);
  if (!aMember) {
    throw new Unauthorized("You are not a member of this group");
  }

  const { textMessage } = req.body;
  //create message object
  const message = {
    sender: userId,
    message: textMessage,
  };

  //push message object
  group.messages.push(message);
  await group.save();

  const populateGroup = await Message.findById(query).populate(
    "messages.sender",
    "profile.userName"
  );
  const convoUsernames = populateGroup.messages.map((message) => ({
    sender: message.sender.profile.userName,
    message: message.message,
  }));
  res.status(200).json({ message: "Message sent", convoUsernames });
};

module.exports.message = message;
module.exports.getMessages = getMessages;
module.exports.createGroup = createGroup;
module.exports.messageGroup = messageGroup;

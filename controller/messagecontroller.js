const mongoose = require("mongoose");
const {
  BadRequestError,
  NotFoundError,
  Unauthorized,
} = require("../lib/error");
const {
  addMessageToConversation,
  userGroupAction,
} = require("../lib/helpers/functions/messagefunctions");
const {
  validateMessage,
  validateGroup,
} = require("../lib/validation/messagevalidation");
const User = require("../model/User");
const Message = require("../model/messages");
const Post = require("../model/post");

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
  const isBlocked = receiver.blockedAccounts.includes(userId);
  if (isBlocked) {
    throw new Unauthorized("You are blocked from messaging this account");
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
    admin: undefined,
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

//@Method: GET /message/:messageId/view
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
  if (userNames.length < 2) {
    throw new BadRequestError("Group cannot have less than 3 members");
  }

  //find the provided usernames
  const users = await User.find({ "profile.userName": { $in: userNames } });

  //check if user is blocked by any accounts
  const isBlocked = users.filter((user) =>
    user.blockedAccounts.includes(userId)
  );
  if (isBlocked.length !== 0) {
    throw new Unauthorized(
      `You have been blocked by ${isBlocked.map(
        (item) => item.profile.userName
      )}`
    );
  }

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
    admins: [userId],
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
    throw new NotFoundError("Group does not exist");
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

  //update group members inboxes
  const otherConversers = group.conversers.filter(
    (converser) => converser.toString() !== userId.toString()
  );

  const groupMembers = await User.find({ _id: { $all: otherConversers } });

  await Promise.all(
    groupMembers.map(async (groupMember) => {
      groupMember.profile.inbox.push(query);
      await groupMember.save();
    })
  );
  // const updateInboxes = groupMembers.map((groupMember) => {
  //   groupMember.profile.inbox.push(query);
  //   return groupMember.save();
  // });

  // await Promise.all(updateInboxes);

  const populateGroup = await Message.findById(query).populate(
    "messages.sender",
    "profile.userName"
  );

  const conversersUsernames = populateGroup.messages.map((message) => ({
    sender: message.sender.profile.userName,
    message: message.message,
  }));
  res.status(200).json({ message: "Message sent", conversersUsernames });
};

//@Method: PUT /message/:groupId/remove
//@Desc:to remove a user from the group
//@Access: Private

const removeFromGroup = async (req, res, next) => {
  const userId = req.user._id;
  const groupId = req.params.groupId;

  const { userName } = req.body;
  if (!userName) {
    throw new BadRequestError("Username is required");
  }

  const { group, userToManage } = await userGroupAction(
    userId,
    groupId,
    userName
  );
  const newConversers = group.conversers.filter(
    (converser) => converser.toString() !== userToManage._id.toString()
  );

  group.conversers = newConversers;
  await group.save();
  res.status(200).json({ message: `${userName}, removed from group` });
};

//@Method:PUt /message/:groupId/add
//@Desc:to add a user to a group
//@Access: Private

const addToGroup = async (req, res, next) => {
  const userId = req.user._id;
  const groupId = req.params.groupId;

  const { userName } = req.body;
  if (!userName) {
    throw new BadRequestError("Username is required");
  }
  const { group, userToManage } = await userGroupAction(
    userId,
    groupId,
    userName
  );

  const newConversers = group.conversers.concat(userToManage._id);

  group.conversers = newConversers;
  await group.save();
  res.status(200).json({ message: `${userName}, added to group` });
};

//@Method:DELETE /message/:groupId/exit
//@Desc:to leave a group
//@Access: Private

const leaveGroup = async (req, res) => {
  const userId = req.user._id;
  const groupId = req.params.groupId;

  const group = await Message.findById(groupId);
  if (!group) {
    throw new BadRequestError("Group not found");
  }
  if (!group.conversers.includes(userId)) {
    throw new Unauthorized("You are not a member of this group");
  }

  const newConversers = group.conversers.filter(
    (converser) => converser.toString() !== userId.toString()
  );
  group.conversers = newConversers;

  await group.save();
  res.status(200).json({ message: "You have exited this group" });
};

//@Method:PUt /message/:groupId/admin
//@Desc:to make a user an admin
//@Access: Private

const makeAnAdmin = async (req, res, next) => {
  const userId = req.user._id;
  const groupId = req.params.groupId;

  const { userName } = req.body;
  if (!userName) {
    throw new BadRequestError("Username is required");
  }
  const { group, userToManage } = await userGroupAction(
    userId,
    groupId,
    userName
  );

  if (group.admins.includes(userToManage._id)) {
    const newAdmins = group.admins.pull(userToManage._id);

    group.admins = newAdmins;
    await group.save();

    res.status(200).json({ message: `${userName}, is no longer an admin` });
    return;
  }

  const newAdmins = group.admins.concat(userToManage._id);

  group.admins = newAdmins;
  await group.save();
  res.status(200).json({ message: `${userName}, is now an admin` });
};

//@Method:PUt /message/:messageId/share
//@Desc:to share a post
//@Access: Private

const sharePost = async (req, res, next) => {
  const userId = req.user._id;
  const messageId = req.params.messageId;
  const { postId } = req.body;
  if (!postId) {
    throw new BadRequestError("Must provide post id");
  }

  const conversation = await Message.findById(messageId);
  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  const post = await Post.findById(postId).select("title content");
  if (!post) {
    throw new BadRequestError("Post not found");
  }
  if (!conversation.conversers.includes(userId)) {
    throw new Unauthorized("You are not able to send this message");
  }

  const message = {
    sender: userId,
    message: post,
  };

  conversation.messages.push(message);

  await conversation.save();

  res.status(200).json({ message: "Post sent succesfully" });
};

//@Method:DELETE /message/:messageId/:conversationId
//@Desc:to delete a message
//@Access: Private

const deleteMesaage = async (req, res) => {
  const userId = req.user._id;
  const messageId = req.params.messageId;
  const conversationId = req.params.conversationId;

  const conversation = await Message.findById(conversationId);
  if (!conversation) {
    throw new BadRequestError("Conversation not found");
  }
  if (!conversation.conversers.includes(userId)) {
    throw new Unauthorized("You are not authorized to see this message");
  }

  const messageExists = conversation.messages.find(
    (message) => message._id.toString() === messageId.toString()
  );
  if (!messageExists) {
    throw new BadRequestError("Message not found");
  }
  await Message.findOneAndUpdate(
    { _id: conversationId },
    { $pull: { messages: { _id: messageId } } }
  );

  res.status(200).json({ message: "Message deleted succesfully" });
};

module.exports.message = message;
module.exports.getMessages = getMessages;
module.exports.createGroup = createGroup;
module.exports.messageGroup = messageGroup;
module.exports.sharePost = sharePost;
module.exports.removeFromGroup = removeFromGroup;
module.exports.addToGroup = addToGroup;
module.exports.deleteMesaage = deleteMesaage;
module.exports.makeAnAdmin = makeAnAdmin;
module.exports.leaveGroup = leaveGroup;

async function updateChangedProperties(firstName, lastName, phoneNumber) {
  if (firstName !== undefined) {
    user.firstName = firstName;
    await user.save();
  }
  if (lastName !== undefined) {
    user.lastName = lastName;
    await user.save();
  }
  if (phoneNumber !== undefined) {
    user.phoneNumber = phoneNumber;
    await user.save();
  }
}

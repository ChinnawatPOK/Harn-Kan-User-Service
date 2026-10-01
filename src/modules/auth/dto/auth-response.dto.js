export const toAuthUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  phone_number: user.phone_number,
});

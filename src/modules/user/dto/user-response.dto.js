export const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  phone_number: user.phone_number,
  location: user.location,
  notification_prefs: user.notification_prefs,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

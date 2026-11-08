export const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  phone_number: user.phone_number,
  location: user.location,
  location_updated_at: user.location_updated_at,
  notification_prefs: user.notification_prefs,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

export const toLocationResponse = (user) => ({
  latitude: user.location.coordinates[1],
  longitude: user.location.coordinates[0],
});

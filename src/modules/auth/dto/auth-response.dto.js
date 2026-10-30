export const toDisplayName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${Array.from(lastName)[0]}.`;
};

export const toAuthUserResponse = (user) => ({
  id: user._id,
  name: user.display_name ?? toDisplayName(user.name),
});

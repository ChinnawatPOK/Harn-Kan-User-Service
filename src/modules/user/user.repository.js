import User from "./user.model.js";

const findActiveById = (id) => {
  return User.findOne({
    _id: id,
    is_active: true,
  });
};

const findByPhoneNumber = (phoneNumber) => {
  return User.findOne({
    phone_number: phoneNumber,
  });
};

const findActiveByPhoneNumberWithPassword = (phoneNumber) => {
  return User.findOne({
    phone_number: phoneNumber,
    is_active: true,
  }).select("+password_hash");
};

const create = (data) => {
  return User.create(data);
};

const updateActiveById = (id, updates) => {
  return User.findOneAndUpdate(
    {
      _id: id,
      is_active: true,
    },
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

const deactivateById = (id) => {
  return User.findOneAndUpdate(
    {
      _id: id,
      is_active: true,
    },
    {
      $set: {
        is_active: false,
      },
    },
    {
      new: true,
    }
  );
};

export const userRepository = {
  findActiveById,
  findByPhoneNumber,
  findActiveByPhoneNumberWithPassword,
  create,
  updateActiveById,
  deactivateById,
};

import User from "./user.model.js";

const EARTH_RADIUS_METERS = 6_371_000;

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

const updateLocationById = (id, { latitude, longitude }) => {
  return User.findOneAndUpdate(
    {
      _id: id,
      is_active: true,
    },
    {
      $set: {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        location_updated_at: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
      timestamps: false,
    }
  );
};

const findActiveIdsWithinRadius = ({
  latitude,
  longitude,
  radiusMeters,
  updatedSince,
  limit,
  cursor,
}) => {
  return User.find(
    {
      is_active: true,
      location_updated_at: {
        $gte: updatedSince,
      },
      location: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusMeters / EARTH_RADIUS_METERS],
        },
      },
      ...(cursor && {
        _id: {
          $gt: cursor,
        },
      }),
    },
    {
      _id: 1,
    }
  )
    .sort({
      _id: 1,
    })
    .limit(limit)
    .lean();
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
  updateLocationById,
  findActiveIdsWithinRadius,
  deactivateById,
};

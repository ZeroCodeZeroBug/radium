import { ObjectId } from 'mongodb'

export const Profile = {
  collectionName: 'profiles',
  schema: {
    _id: ObjectId,
    auth0_id: String,
    email: String,
    username: String,
    display_name: String,
    config: Object,
    is_active: Boolean,
    view_count: Number,
    user_id: Number,
    is_premium: Boolean,
    premium_expires_at: Date,
    paypal_subscription_id: String,
    created_at: Date,
    updated_at: Date,
  },
  indexes: [
    { key: { username: 1 }, unique: true },
    { key: { auth0_id: 1 }, unique: true },
    { key: { is_active: 1 } },
    { key: { user_id: 1 }, unique: true },
    { key: { is_premium: 1 } },
  ],
}

export const Template = {
  collectionName: 'templates',
  schema: {
    _id: ObjectId,
    user_id: ObjectId,
    profile_id: ObjectId,
    name: String,
    description: String,
    config: Object,
    share_id: String,
    is_public: Boolean,
    views: Number,
    likes: Number,
    created_at: Date,
    updated_at: Date,
  },
  indexes: [
    { key: { share_id: 1 }, unique: true },
    { key: { user_id: 1 } },
    { key: { is_public: 1 } },
  ],
}

export const TemplateLike = {
  collectionName: 'template_likes',
  schema: {
    _id: ObjectId,
    template_id: ObjectId,
    user_id: ObjectId,
    created_at: Date,
  },
  indexes: [
    { key: { template_id: 1, user_id: 1 }, unique: true },
  ],
}

export const Admin = {
  collectionName: 'admins',
  schema: {
    _id: ObjectId,
    user_id: ObjectId,
    permissions: Object,
    is_active: Boolean,
    created_by: ObjectId,
    created_at: Date,
    updated_at: Date,
  },
  indexes: [
    { key: { user_id: 1 }, unique: true },
    { key: { is_active: 1 } },
  ],
}

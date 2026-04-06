import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import crypto from 'crypto'

const app = express()
const PORT = 3001

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.MONGO_DB || 'radium'

app.use(cors())
app.use(express.json())

let db

async function connectDB() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  db = client.db(DB_NAME)
  
  await db.collection('profiles').createIndex({ username: 1 }, { unique: true })
  await db.collection('profiles').createIndex({ auth0_id: 1 }, { unique: true })
  await db.collection('templates').createIndex({ share_id: 1 }, { unique: true })
  
  console.log('Connected to MongoDB')
  return db
}

function generateShareId() {
  return crypto.randomBytes(8).toString('hex')
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await db.collection('profiles').find({}).toArray()
    res.json(profiles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/profiles/:username', async (req, res) => {
  try {
    const profile = await db.collection('profiles').findOne({ username: req.params.username })
    if (!profile) return res.status(404).json({ error: 'Not found' })
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/profiles', async (req, res) => {
  try {
    const { auth0_id, email, username, display_name } = req.body
    const profile = {
      auth0_id,
      email,
      username,
      display_name: display_name || email?.split('@')[0] || 'User',
      config: {},
      is_active: true,
      view_count: 0,
      is_premium: false,
      created_at: new Date(),
      updated_at: new Date(),
    }
    const result = await db.collection('profiles').insertOne(profile)
    res.json({ ...profile, _id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.patch('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params
    const update = { ...req.body, updated_at: new Date() }
    delete update._id
    
    const result = await db.collection('profiles').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/profiles/auth0/:auth0Id', async (req, res) => {
  try {
    const profile = await db.collection('profiles').findOne({ auth0_id: req.params.auth0Id })
    if (!profile) return res.status(404).json({ error: 'Not found' })
    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/profiles/increment-view/:id', async (req, res) => {
  try {
    await db.collection('profiles').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { view_count: 1 } }
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/templates', async (req, res) => {
  try {
    const { user_id, profile_id, is_public } = req.query
    const filter = {}
    if (user_id) filter.user_id = new ObjectId(user_id)
    if (profile_id) filter.profile_id = new ObjectId(profile_id)
    if (is_public !== undefined) filter.is_public = is_public === 'true'
    
    const templates = await db.collection('templates').find(filter).toArray()
    res.json(templates)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/templates/:shareId', async (req, res) => {
  try {
    const template = await db.collection('templates').findOne({ share_id: req.params.shareId })
    if (!template) return res.status(404).json({ error: 'Not found' })
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/templates', async (req, res) => {
  try {
    const { user_id, profile_id, name, description, config, is_public } = req.body
    const template = {
      user_id: new ObjectId(user_id),
      profile_id: new ObjectId(profile_id),
      name,
      description,
      config,
      share_id: generateShareId(),
      is_public: is_public || false,
      views: 0,
      likes: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }
    const result = await db.collection('templates').insertOne(template)
    res.json({ ...template, _id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.patch('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const update = { ...req.body, updated_at: new Date() }
    delete update._id
    delete update.user_id
    delete update.profile_id
    
    const result = await db.collection('templates').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    )
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/templates/:id', async (req, res) => {
  try {
    await db.collection('templates').deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/templates/increment-views/:id', async (req, res) => {
  try {
    await db.collection('templates').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { views: 1 } }
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/templates/like', async (req, res) => {
  try {
    const { template_id, user_id } = req.body
    
    const existing = await db.collection('template_likes').findOne({
      template_id: new ObjectId(template_id),
      user_id: new ObjectId(user_id),
    })
    
    if (existing) {
      await db.collection('template_likes').deleteOne({ _id: existing._id })
      await db.collection('templates').updateOne(
        { _id: new ObjectId(template_id) },
        { $inc: { likes: -1 } }
      )
      res.json({ liked: false })
    } else {
      await db.collection('template_likes').insertOne({
        template_id: new ObjectId(template_id),
        user_id: new ObjectId(user_id),
        created_at: new Date(),
      })
      await db.collection('templates').updateOne(
        { _id: new ObjectId(template_id) },
        { $inc: { likes: 1 } }
      )
      res.json({ liked: true })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/admins', async (req, res) => {
  try {
    const admins = await db.collection('admins').find({}).toArray()
    res.json(admins)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admins', async (req, res) => {
  try {
    const { user_id, permissions, created_by } = req.body
    const admin = {
      user_id: new ObjectId(user_id),
      permissions: permissions || {},
      is_active: true,
      created_by: created_by ? new ObjectId(created_by) : null,
      created_at: new Date(),
      updated_at: new Date(),
    }
    const result = await db.collection('admins').insertOne(admin)
    res.json({ ...admin, _id: result.insertedId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/admins/:id', async (req, res) => {
  try {
    await db.collection('admins').deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

async function startServer() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`)
  })
}

startServer()

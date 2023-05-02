import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, currentPassword, newPassword, newConfirmPassword } = req.body

    // Check if the email, current password, new password, and new confirm password fields are present
    if (!email) {
      res.status(400).json({ message: 'Email field is required' })
      return
    }

    if (!currentPassword) {
      res.status(400).json({ message: 'Current password field is required' })
      return
    }

    if (!newPassword) {
      res.status(400).json({ message: 'New password field is required' })
      return
    }

    if (!newConfirmPassword) {
      res.status(400).json({ message: 'New confirm password field is required' })
      return
    }

    // Check if the new password and new confirm password fields match
    if (newPassword !== newConfirmPassword) {
      res.status(400).json({ message: 'New passwords do not match' })
      return
    }

    // Connect to the MongoDB database
    const client = await MongoClient.connect(process.env.MONGODB_URI)
    const db = client.db(process.env.MONGODB_DB)

    // Check if the email and current password match a user in the database
    const user = await db.collection('Users').findOne({ email })
    if (!user) {
      res.status(400).json({ message: 'Invalid Current Password' })
      return
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid Current Password' })
      return
    }

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password in the database
    await db.collection('Users').updateOne({ email }, { $set: { password: hashedPassword } })

    res.status(200).json({ message: 'Password changed successfully' })
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

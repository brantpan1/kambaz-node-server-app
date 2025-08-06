import db from '../Database/index.js'
import { v4 as uuidv4 } from 'uuid'

let { people } = db
export const createUser = (user) => {
  const newUser = { ...user, _id: uuidv4() }
  people = [...people, newUser]
  return newUser
}
export const findAllUsers = () => people
export const findUserById = (userId) =>
  people.find((people) => people._id === userId)
export const findUserByUsername = (username) =>
  people.find((people) => people.username === username)
export const findUserByCredentials = (username, password) =>
  people.find(
    (people) => people.username === username && people.password === password,
  )
export const updateUser = (userId, peopleUpdate) =>
  (people = people.map((p) => (p._id === userId ? peopleUpdate : p)))
export const deleteUser = (userId) =>
  (people = people.filter((p) => p._id !== userId))

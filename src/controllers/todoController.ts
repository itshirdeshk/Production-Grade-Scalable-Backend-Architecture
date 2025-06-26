import asyncHandler from "express-async-handler"
import Todo from "../models/todoModel"
import { ProtectedRequest } from "../../types/app-request"
import { Request, Response } from "express"
import todoCache from "../cache/todoCache"

const createTodo = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { title, description } = req.body
  console.log(req.user)

  if (!title || !description) {
    res.status(400)
    throw new Error("Title and Description are required")
  }

  await Todo.create({ user: req.user, title, description })

  await todoCache.invalidateUserTodos(req.user._id.toString());

  res.status(201).json({ title, description })
})

const getTodos = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  // Try fetching the todos from cache first
  let todos = await todoCache.fetchUserTodos(req.user._id.toString());

  if (!todos) {
    todos = await Todo.find({ user: req.user._id });
    if (!todos || todos.length === 0) {
      res.status(404);
      throw new Error("No todos found");
    }

    // Save to cache
    await todoCache.saveUserTodo(req.user._id.toString(), todos);
  }
  res.status(200).json(todos)
})

const editTodo = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { title, description, status } = req.body

  const user = req.user

  if (!title || !description || !status) {
    res.status(400)
    throw new Error("Title, Description, and Status are required")
  }

  const todo = await Todo.findById(req.params.id)

  if (todo?.user.toString() !== user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized to update this todo")
  }

  if (!todo) {
    res.status(404)
    throw new Error("Todo not found")
  }

  todo.title = title
  todo.description = description
  todo.status = status

  const updatedTodo = await todo.save()
  await todoCache.invalidateUserTodos(req.user._id.toString());

  res.json(updatedTodo)
})

const deleteTodo = asyncHandler(async (req: ProtectedRequest, res) => {
  const todo = await Todo.findById(req.params.id)

  if (todo) {
    await todo.deleteOne()
    await todoCache.invalidateUserTodos(req.user._id.toString());
    res.json({ message: "Todo removed" })
  } else {
    res.status(404)
    throw new Error("Todo not found")
  }
})

export { createTodo, getTodos, editTodo, deleteTodo }

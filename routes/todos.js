const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Todo = require('../models/Todo')

// @desc    Show add page
// @route   GET /todos/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('todos/add')
})

// @desc    Process add form
// @route   POST /todos
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Todo.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all todos
// @route   GET /todos
router.get('/', ensureAuth, async (req, res) => {
  try {
    const todos = await Todo.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('todos/index', {
      todos,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single todo
// @route   GET /todos/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id).populate('user').lean()

    if (!todo) {
      return res.render('error/404')
    }

    if (todo.user._id != req.user.id && todo.status == 'private') {
      res.render('error/404')
    } else {
      res.render('todos/show', {
        todo,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /todos/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
    }).lean()

    if (!todo) {
      return res.render('error/404')
    }

    if (todo.user != req.user.id) {
      res.redirect('/todos')
    } else {
      res.render('todos/edit', {
        todo,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update todo
// @route   PUT /todos/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id).lean()

    if (!todo) {
      return res.render('error/404')
    }

    if (todo.user != req.user.id) {
      res.redirect('/todos')
    } else {
      todo = await Todo.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete todo
// @route   DELETE /todos/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id).lean()

    if (!todo) {
      return res.render('error/404')
    }

    if (todo.user != req.user.id) {
      res.redirect('/todos')
    } else {
      await Todo.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User todos
// @route   GET /todos/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const todos = await Todo.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('todos/index', {
      todos,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router

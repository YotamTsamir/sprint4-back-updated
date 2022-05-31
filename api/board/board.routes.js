const express = require('express')
// const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
// const { log } = require('../../middlewares/logger.middleware')
// const { getToys, getToyById,updateToy,removeToy } = require('./toy.controller')
const {getBoards, getBoardById, removeBoard,updateBoard,updateTask,updateBox,deleteTask, addBoard} = require('./board.controller')
const router = express.Router()

router.get('/',getBoards)
router.get('/:id',getBoardById)
router.put('/:id', updateBoard)
router.put('/updateTask/:id/:boxId', updateTask)
router.put('/updateBox/:id', updateBox)
router.post('/',addBoard)
router.delete('/:id',removeBoard)
router.delete('/:id/:boxId/:taskId',deleteTask)

module.exports = router
const boardService = require('./board.service.js');
const logger = require('../../services/logger.service')



async function getBoards(req, res) {
    try {
        logger.debug('Getting Boards')
        var queryParams = req.query;
        const boards = await boardService.query(queryParams)
        res.json(boards);
    } catch (err) {
        logger.error('Failed to get boards', err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}

async function getBoardById(req, res) {
    try {
        // console.log(req)
        const boardId = req.params.id;
        const board = await boardService.getById(boardId)
        res.json(board)
    } catch (err) {
        logger.error('Failed to get board', err)
        res.status(500).send({ err: 'Failed to get board' })
    }
}


async function updateBox(req,res) {
    try{
        const newBox = req.body
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        const newBoard = await boardService.updateBox(board,newBox)
        const updatedBoard = await boardService.update(newBoard)
        res.json(updatedBoard) 
    } catch(err){
        logger.error('Failed to add/update box', err)
        res.status(500).send({ err: 'Failed to add/update box' })
    }
}

async function updateTask(req,res) {
    try{
        const newTask = req.body
        const boardId = req.params.id
        const board = await boardService.getById(boardId)
        const currBoxId = req.params.boxId
        const newBoard = await boardService.updateTask(board,currBoxId,newTask)
        const updatedBoard = await boardService.update(newBoard)
        res.json(updatedBoard)
    } catch (err){
        logger.error('Failed to update task', err)
        res.status(500).send({ err: 'Failed to update task' })
    }
}

async function deleteTask(req,res){
    try{
        const boardId = req.params.id
        const boxId = req.params.boxId
        const taskId = req.params.taskId
        const newBoard = await boardService.deleteTask(boardId,boxId,taskId)
        const updatedBoard = await boardService.update(newBoard)
        res.json(updatedBoard)

    } catch (err) {

    }
}

async function updateBoard(req, res) {
    try {
        const board = req.body;
        const updatedBoard = await boardService.update(board)
        res.json(updatedBoard)
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}


async function addBoard(req, res) {
    try {
      const board = req.body;
      const addedBoard = await boardService.add(board)
      res.json(addedBoard)
    } catch (err) {
      logger.error('Failed to add board', err)
      res.status(500).send({ err: 'Failed to add board' })
    }
  }

async function removeBoard(req, res) {
    try {
        const boardId = req.params.id
        const removedId = await boardService.remove(boardId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

module.exports = {
    getBoards,
    getBoardById,
    addBoard,
    updateBoard,
    updateTask,
    updateBox,
    removeBoard,
    deleteTask
}

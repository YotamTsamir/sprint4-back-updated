const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const { updateBoard } = require('./board.controller')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    try {
        // const criteria = _buildCriteria(filterBy)
        const criteria = {}

        const collection = await dbService.getCollection('boards')
        var boards = await collection.find(criteria).toArray()
        // console.log(boards)
        // return collection
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('boards')
        const addedBoard = await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

async function updateBox(board,newBox){
    let updatedBoard = {...board}
    const currBoxId = board.boxes.findIndex(box => {
        return box.id === newBox.id
    })
    if (currBoxId !== -1) {
        updatedBoard.boxes[currBoxId] = newBox
    } else {
        updatedBoard.boxes.push(newBox)
    }
    return updatedBoard
}

async function deleteTask(boardId,boxId,taskToDelId) {
    const board = await getById(boardId)
    let updatedBoard = { ...board }
    const currBoxIdx = board.boxes.findIndex(box => {
        return box.id === boxId
    })
    const currTaskIdx = board.boxes[currBoxIdx].tasks.findIndex(task => {
        return task.id === taskToDelId
    })
    updatedBoard.boxes[currBoxIdx].tasks.splice(currTaskIdx,1)
    return updatedBoard
}

async function updateTask(board, boxId, newTask) {
    let updatedBoard = { ...board }
    const currBoxIdx = board.boxes.findIndex(box => {
        return box.id === boxId
    })
    const currTaskIdx = board.boxes[currBoxIdx].tasks.findIndex(task => {
        return task.id === newTask.id
    })
    if (currTaskIdx !== -1) {
        updatedBoard.boxes[currBoxIdx].tasks[currTaskIdx] = newTask
    } else {
        updatedBoard.boxes[currBoxIdx].tasks.push(newTask)
    }
    return updatedBoard
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('boards')
        const board = collection.findOne({ '_id': ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function update(board) {
    try {
        // console.log('board is', board)
        var id = ObjectId(board._id)
        delete board._id
        const collection = await dbService.getCollection('boards')
        await collection.updateOne({ _id: id }, { $set: { ...board } })
        board._id = id
        return board
    } catch (err) {
        logger.error(`cannot update board `, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('boards')
        await collection.deleteOne({ _id: ObjectId(boardId) })
        return boardId
    } catch (err) {
        logger.error('cant remove board')
        throw err
    }
}


module.exports = {
    remove,
    query,
    updateTask,
    getById,
    updateBox,
    updateBoard,
    add,
    update,
    deleteTask
}
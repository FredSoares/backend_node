const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')
const User = require('../models/user')
const router = express.Router()

function generateToken(param ={}){

    //generate the token
    return jwt.sign(param, authConfig.secret, {
        //expire in 1 day
        expiresIn: 86400
    })
}

router.post('/register', async (req, res) =>{

    const {email} = req.body

    try {
        //check if email exist in db
        if (await User.findOne({ email })) 
            return res.status(400).send({error: 'User already exists'})

        const user = await User.create(req.body)

        //remove password
        user.password = undefined

        return res.send({ 
            user,
            token: generateToken({ id: user.id}) })
    } catch (err) {
        return res.status(400).send({ error: 'Registration failed'})
    }
})

router.post('/authenticate', async (req, res) => {
    const {email, password } = req.body
    const user = await User.findOne({ email }).select('+password')

    if(!user)
        return res.status(400).send({ error: 'User not found'})

    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password'})

        //remove password
        user.password = undefined

        

    res.send({user, 
        token: generateToken({id: user.id})})
})
module.exports = app => app.use('/auth', router)
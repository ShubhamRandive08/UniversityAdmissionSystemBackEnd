const express = require('express')
const pool = require('./db')
const app = express()
const path = require('path')
const bodyparser = require('body-parser')
const port = 3000;
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

app.use(bodyparser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "DELETE,GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type");
    next();
})


app.get('/', async (req, res) => {
    res.send('APIs for the Collage Addmission Process.');
})

app.post('/staff', [
    body('email').notEmpty().withMessage('Username is required'),
    body('pass').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const { email, pass } = req.body
        const rs = await pool.query('select * from staff where email = $1 and password = $2', [email, pass])

        if (rs.rows.length > 0) {
            res.json({ status: '200', message: 'success', data: rs.rows })
        } else {
            res.json({ message: 'Username and Password are invalid' })
        }


    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

app.get('/Sdata', async (req, res) => {
    const rs = await pool.query('select * from staff ')
    res.json({ data: rs.rows })
})

app.post('/staffData', [
    body('email').notEmpty().withMessage('Username is required'),
    body('pass').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const { email, pass } = req.body
        const rs = await pool.query('select * from staff where email = $1 and password = $2', [email, pass])

        if (rs.rows.length > 0) {
            res.json({ status: '200', message: 'success', data: rs.rows })
        } else {
            res.json({ message: 'Username and Password are invalid' })
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// Code for insert the data into the staff table
app.post('/insertStaff', [
    body('tname').notEmpty().withMessage("Name is required."),
    body('email').isEmail().withMessage('Email is required'),
    body('username').notEmpty().withMessage("Username is required"),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const { tname, email, username, password } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const rs = await pool.query('select email from staff where email = $1', [email]);
            if (rs.rows.length > 0) {
                res.json({ message: 'Email is already exist...' })
            } else {
                await pool.query('insert into staff(tname,email,username,password) values ($1,$2,$3,$4)', [tname, email, username, password]);
                res.json({ status: '200', message: 'Admin Registration Successful' })
            }
        }

    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

app.get('/studData', [], async (req, res) => {
    try {
        const rs = await pool.query('select * from newstudent order by fname asc')
        res.json({ status: '200', message: 'success', studData: rs.rows })
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

app.post('/insertStudent', [
    body('fname').notEmpty().withMessage('First name is required.'),
    body('mname').notEmpty().withMessage('Middle name is required.'),
    body('lname').notEmpty().withMessage('Last name is required.'),
    body('gender').notEmpty().withMessage('Gender is required.'),
    body('dob').notEmpty().withMessage('Date of Birth is required.'),
    body('twelvem').notEmpty().withMessage('12th Marks is required.'),
    body('tenm').notEmpty().withMessage('10th Marks  is required.'),
    body('add').notEmpty().withMessage('Add is required.'),
    body('state').notEmpty().withMessage('State is required.'),
    body('mb').notEmpty().withMessage('Mb is required.'),
    body('pcode').notEmpty().withMessage('Postcode is required.'),
    body('city').notEmpty().withMessage('City is required.'),
    body('fee').notEmpty().withMessage('Fees is required.'),
    body('addharno').notEmpty().withMessage('Aadhar no. is required.'),
    body('tid').notEmpty().withMessage('Teacher ID is required.'),
    body('tname').notEmpty().withMessage('Teacher Name is required.'),
    body('date').notEmpty().withMessage('Date is required.')

], async (req, res) => {
    try {
        const { fname, mname, lname, gender, dob, twelvem, tenm, add, state, mb, city, fee, addharno, tid, pcode, tname, date } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const rs = await pool.query('select addharno from newstudent where addharno = $1', [addharno])

            if (rs.rows.length > 0) {
                res.json({ status: '200', message: 'Student already exist' })
            } else {
                await pool.query('insert into newstudent(fname,mname,lname,gender,dob,twelvem,tenm,address,state,mbno,city,fillfees,addharno,tid,pcode,tname,date) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)', [fname, mname, lname, gender, dob, twelvem, tenm, add, state, mb, city, fee, addharno, tid, pcode, tname, date])
                res.json({ status: '200', message: 'Student addmission conforimed' })
            }
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage("Server Error")

    }
})

// Select the total fees
app.get('/totolfees', async (req, res) => {
    try {
        const rs = await pool.query('select count(id) * 16000 as total from newstudent')
        res.json({ status: '200', message: 'Success', ttl: rs.rows })
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// Select the count of the totoal fees
app.get('/totolcollectivefees', async (req, res) => {
    try {
        const rs = await pool.query('select sum(fillfees) as totalcollectivefee from newstudent')
        res.json({ status: '200', message: 'Success', total: rs.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// Select count of the total student

app.get('/studCount', async (req, res) => {
    try {
        const rs = await pool.query('select count(id) as ttlStudent from newstudent')
        res.json({ status: '200', message: 'Success', coutn: rs.rows })
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// Select the total empty count 
app.get('/emptySlot', async (req, res) => {
    try {
        const rs = await pool.query('select 120 - count(id) as emptySlot from newstudent')
        res.json({ status: '200', message: 'Success', emptySlot: rs.rows })
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

app.post('/date', [
    body('date').notEmpty().withMessage("Date is required")
], async (req, res) => {
    try {
        const { date } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            await pool.query('insert into dt(date) values ($1)', [date])
            res.json({ status: '200', message: 'Date Inserted' })
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage('Server Error')
    }
})

// API for fetch the all data based on the id
app.post('/studDataOnId', [
    body('id').notEmpty().withMessage("Student id is required")
], async (req, res) => {
    try {
        const { id } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const rs = await pool.query('select * from newstudent where id = $1', [id])
            res.json({ status: '200', message: 'Success', data: rs.rows })
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage("Srever Error.")
    }
})

app.put('/uptStudData', [
    body('fname').notEmpty().withMessage("First Name is required."),
    body('mname').notEmpty().withMessage("Second Name is required."),
    body('lname').notEmpty().withMessage("Last Name is required."),
    body('gender').notEmpty().withMessage("Gender is required."),
    body('twm').notEmpty().withMessage("12th is required."),
    body('tenm').notEmpty().withMessage("10th is required."),
    body('add').notEmpty().withMessage("Address is required."),
    body('state').notEmpty().withMessage("State is required."),
    body('ffees').notEmpty().withMessage("Fill fees is required."),
    body('aadharno').notEmpty().withMessage("Aadhar no. is required."),
    body('id').notEmpty().withMessage("ID is required.")

], async (req, res) => {
    try {
        const { fname, mname, lname, gender, twm, tenm, add, state, ffees, aadharno, id } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            await pool.query('update newstudent set fname = $1, mname = $2, lname = $3, gender = $4, twelvem = $5, tenm = $6, address = $7, state = $8, fillfees = $9, addharno = $10 where id = $11', [fname, mname, lname, gender, twm, tenm, add, state, ffees, aadharno, id])
            res.json({ status: '200', message: 'Update Success' })
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage("Server Error")
    }
})

app.delete('/delStudent', [
    body('id').notEmpty().withMessage("ID is requeried")
], async (req, res) => {
    try {

        const { id } = req.body
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            await pool.query('delete from newstudent where id = $1', [id])
            res.json({ status: '200', message: 'Delete Success' })
        }
    } catch (err) {
        console.error(err.message)
        res.status.withMessage('Server Error')
    }
})

app.post('/studDataOntid', [
    body('tid').notEmpty().withMessage('Teacher ID is required')
], async (req, res) => {
    try {
        const { tid } = req.body
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('select * from newstudent where tid = $1',[tid])
            res.json({status : '200', message : 'Success', data : r.rows})
        }
    } catch (err) {
        console.error(err.message)
        res.status(500).withMessage("Server Error")
    }
})

app.delete('/delStaff', [
    body('id').notEmpty().withMessage("ID is requeried")
], async (req,res) =>{
    try{
        const { id } = req.body
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('delete from staff where sid = $1',[id])
            res.json({status : '200', message : 'Delete Success'})
        }
    }catch(err){
        console.error(err.message);
        res.status(500).withMessage("Internal server error")
    }
})

app.listen(port, () => {
    console.log(`Server Starts on Port No. http://localhost:${port}`)
})
const express = require('express')
const pool = require('./db')
const app = express()
const path = require('path')
const bodyparser = require('body-parser')
const port = 3000;
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const { error } = require('console')

app.use(bodyparser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "DELETE,GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Authorization");
    next();
})

app.post('/api/auth/getToken', [], (req,res) => {
    const {key} = req.body
    const token = jwt.sign({key},'super-secret', {expiresIn : '24h'})
    res.send({token})
})


async function auth(req,res,next) {
    try{
        const token = req.headers.authorization.replace('Bearer ', '')
        await jwt.verify(token, 'super-secret')
        req.token = token
        next()
    }catch(err){
        res.status(401).send({error : 'Please authenticate'})
    }
}


app.get('/', async (req, res) => {
    res.send('APIs for the Collage Addmission Process.');
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

// Update the single record fromthe database
app.patch('/inrtStudent', [
    body('fname').optional().notEmpty().withMessage("First Name is required."),
    body('mname').optional().notEmpty().withMessage("Second Name is required."),
    body('lname').optional().notEmpty().withMessage("Last Name is required."),
    body('gender').optional().notEmpty().withMessage("Gender is required."),
    body('twm').optional().notEmpty().withMessage("12th is required."),
    body('tenm').optional().notEmpty().withMessage("10th is required."),
    body('add').optional().notEmpty().withMessage("Address is required."),
    body('state').optional().notEmpty().withMessage("State is required."),
    body('ffees').optional().notEmpty().withMessage("Fill fees is required."),
    body('aadharno').optional().notEmpty().withMessage("Aadhar no. is required."),
    body('id').notEmpty().withMessage("ID is required.")
  ], async (req, res) => {
    try {
      // Validate the request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // Extract the data from the body
      const { fname, mname, lname, gender, twm, tenm, add, state, ffees, aadharno, id } = req.body;
  
      // Step 1: Check if the student exists in the database
      const findStudentResult = await pool.query('SELECT * FROM newstudent WHERE id = $1', [id]);
      const student = findStudentResult.rows[0];
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Step 2: Prepare the update query dynamically based on the fields provided
      let updateQuery = 'UPDATE newstudent SET';
      let updateValues = [];
      let queryIndex = 1;
  
      // Add the fields to update only if they are provided in the request
      if (fname) {
        updateQuery += ` fname = $${queryIndex},`;
        updateValues.push(fname);
        queryIndex++;
      }
      if (mname) {
        updateQuery += ` mname = $${queryIndex},`;
        updateValues.push(mname);
        queryIndex++;
      }
      if (lname) {
        updateQuery += ` lname = $${queryIndex},`;
        updateValues.push(lname);
        queryIndex++;
      }
      if (gender) {
        updateQuery += ` gender = $${queryIndex},`;
        updateValues.push(gender);
        queryIndex++;
      }
      if (twm) {
        updateQuery += ` twm = $${queryIndex},`;
        updateValues.push(twm);
        queryIndex++;
      }
      if (tenm) {
        updateQuery += ` tenm = $${queryIndex},`;
        updateValues.push(tenm);
        queryIndex++;
      }
      if (add) {
        updateQuery += ` add = $${queryIndex},`;
        updateValues.push(add);
        queryIndex++;
      }
      if (state) {
        updateQuery += ` state = $${queryIndex},`;
        updateValues.push(state);
        queryIndex++;
      }
      if (ffees) {
        updateQuery += ` ffees = $${queryIndex},`;
        updateValues.push(ffees);
        queryIndex++;
      }
      if (aadharno) {
        updateQuery += ` aadharno = $${queryIndex},`;
        updateValues.push(aadharno);
        queryIndex++;
      }
  
      // Remove trailing comma and append the WHERE clause
      updateQuery = updateQuery.slice(0, -1); // Remove the last comma
      updateQuery += ` WHERE id = $${queryIndex}`;
      updateValues.push(id); // Add ID to the query parameters
  
      // Step 3: Execute the update query
      await pool.query(updateQuery, updateValues);
  
      // Step 4: Retrieve the updated student from the database
      const updatedStudentResult = await pool.query('SELECT * FROM newstudent WHERE id = $1', [id]);
      const updatedStudent = updatedStudentResult.rows[0];
  
      // Return the updated student data in the response
      res.status(200).json({
        status: '200',
        message: 'Student updated successfully',
        updatedStudent
      });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  

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
    const rs = await pool.query('select * from staff order by tname asc')
    res.json({ status : '200' , message : 'Success', data: rs.rows })
})

// Only for testing pu
app.get("/TeacherNameData", [], async (req,res) => {
    const rs = await pool.query('select * from staff where tname = $1', ['testreviewer'])
    res.json({status : '200', message : 'success', data : rs.rows})
})

app.get('/TeacherName/:teachername', [], async(req,res) =>{
    const {teachername} =  req.params
    const rs = await pool.query('select * from staff where tname = $1', [teachername])
    res.json({status : '200', message : 'success', data : rs.rows})
})

app.get('/studDataOnId/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const rs = await pool.query('select * from newstudent where tid = $1', [id]);
        if (rs.rows.length === 0) {
            return res.status(404).json({ status: '404', message: 'Student not found' });
        }
        res.json({ status: '200', message: 'success', studData: rs.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: '500', message: 'Server Error' });
    }
});

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
                res.json({ status : '200',message: 'Email is already exist...', data : rs.rows })
            } else {
                await pool.query('insert into staff(tname,email,username,password) values ($1,$2,$3,$4)', [tname, email, username, password]);
                res.json({ status: '200', message: 'Admin Registration Successful', data : req.body})
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
        res.status(500).withMessage("Server error")
    }
})

app.put('/addLockStutas',[
    body('sid').notEmpty().withMessage("Staff id is requered")
], async (req,res)=>{
    try{
        const {sid} = req.body
        await pool.query("update staff set stutas = 'lock' where sid = $1", [sid])
        res.json({status : '200', message : 'Permission Changed Successfully.'})

    }catch(err){
        console.error(err.message);
        res.status(500).withMessage("Server error")
    }
})

app.put('/addUnlockStutas',[
    body('sid').notEmpty().withMessage("Staff id is requered")
], async (req,res)=>{
    try{
        const {sid} = req.body
        await pool.query("update staff set stutas = 'unlock' where sid = $1", [sid])
        res.json({status : '200', message : 'Permission Changed Successfully.'})

    }catch(err){
        console.error(err.message);
        res.status(500).withMessage("Server error")
    }
})

app.post('/getStatus',[
    body('sid').notEmpty().withMessage('Staff id is requeried')
],async (req,res)=>{
    try{
        const {sid} = req.body
        const rs = await pool.query('select stutas from staff where sid = $1',[sid])
        res.json({status : '200', message : 'Success', StatusData : rs.rows})
    }catch(err){
        console.error(err.message);
        res.status(500).withMessage("Server error")
    }
})

app.get('/GetEvent', [], async (req,res)=>{
    try{
        const rs = await pool.query('select * from events')
        res.json({status : '200', message : 'Success', EventData : rs.rows})
    }catch(err){
        console.error(err.message);
        res.status(500).withMessage("Server error")
    }
})

app.post('/insertEvent', [
    body('event_title').notEmpty().withMessage('Title is requred'),
    body('event_date').notEmpty().withMessage('Date is requered'),
    body('event_time').notEmpty().withMessage('Time is requeried')
], async (req,res)=>{
    try{
        const { event_title, event_date, event_time } = req.body
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        } else {
            const r = await pool.query('insert into events(event_title, event_date, event_time) values ($1,$2,$3)',[event_title, event_date, event_time ])
            res.json({status : '200', message : 'Event Added Successfully'})
        }
    }catch(err){
        console.error(err.message);
        res.status(500).withMessage("Server error")
    }
})
app.listen(port, () => {
    console.log(`Server Starts on Port No. http://localhost:${port}`)
})
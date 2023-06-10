const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('Learning sports is starting')
})

app.listen(port, ()=>{
    console.log(`Learning sports is starting on port : ${port}`);
})
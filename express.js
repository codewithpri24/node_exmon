const express=require('express');
const app =express();
const path=require('path');

const port=3000;
app.get('/', (req, res) => {
    // res.send("Hello world!");
    res.sendFile(path.join(__dirname,'file1.html'));
    console.log(path);
});

app.get('/about', (req, res) => {
    res.send("About Page");
});
app.listen(port);
const path = require("path");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const app = express();

app.set('view engine','ejs');
app.set('views',path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.get("/",(req,res)=>{
    return res.render("homepage");
});

const storage = multer.diskStorage({
    destination: (req,res,cb) =>{
        cb(null,'/uploads');
    },
    filename : (req,res,cb)=>{
        cb(null,`${Date.now()}-${res.originalname}`);
    }
});

const upload = multer({ storage });

app.post("/uploads",upload.single("profileImage"),(req,res)=>{
    console.log(req.body);
    console.log(req.file);
    return res.render("homepage");
});

app.post('/convert',upload.array('profileImage',10),(req,res)=>{
    console.log(req.body);
    if(!req.files || req.files.length === 0){
    return res.status(400).send('No such file directory');
    }

    const pdfDoc = new PDFDocument();
    const outputFilePath = path.join(__dirname,'output',`output-${Date.now()}.pdf`);
    const output = fs.createWriteStream(outputFilePath); 

    pdfDoc.pipe(output);

    req.files.forEach((file,index)=>{
        if(index>0){
            pdfDoc.addPage();
        }
            pdfDoc.image(file.path,{
                fit: [500,700],
                align: 'center',
                valign: 'center'
            });
    });

    pdfDoc.end();

    output.on('finish',()=>{
        res.download(outputFilePath,'Converted.pdf',(err)=>{
            if(err){
                console.log(err);
            }
        });
    });

    output.on('error',(err)=>{
        res.status(500).send('Failed to generate PDF');
    });
});

app.listen(8000,()=>{
    console.log("Server Started in port 8000");
});

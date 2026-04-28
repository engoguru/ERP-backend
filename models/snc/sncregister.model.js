import mongoose from "mongoose";
const sncSchema=new mongoose.Schema({
retreat_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"reTreat",
},
createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Employee_Table"
},
licenseId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"LicenseTable"
},
joinStatus:{
    type:String,
    enum:["Active","Inactive"],
    required:true,
    trim:true
},
sncType:{
    type:String,
    enum:["A","B","C"],
    required:true,
    trim:true
},
totalServiceAmount:{
    type:Number,
    required:true,
    trim:true
},
paidAmount:{
    type:Number,
    required:true,
    trim:true
},
unpaidAmount:{
    type:Number,
    required:true,
    trim:true
},
gstAmount:{
    type:Number,
    required:true,
    trim:true
},
docs:[
    {
     url:{
        type:String,
        trim:true
     },
     public_id:{
        type:String,
        trim:true
     }
    }
]


},{timestamps:true})
const sncModel=mongoose.model("snc",sncSchema)
export default sncModel
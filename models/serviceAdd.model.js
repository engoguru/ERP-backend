import mongoose from "mongoose";


const serviceAddSchema = new mongoose.Schema(
  {
      reTreat_Id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Retreat"
    },
    license_Id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"LicenseTable"
    },
    createdBy_Id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Employee_Table"
    },
     serviceName:{
        type:String
     },
    paidAmount:{
        type:Number
    },
    unpaidAmount:{
        type:Number
    },
    totalAmount:{
        type:Number
    },
    docs:[
        {
            url:{
                type:String
            },
            publicId:{
                type:String
            }
        }
    ]


  },{timestamps:true}
)
const serviceModel=mongoose.model("service",serviceAddSchema)
export default serviceModel;
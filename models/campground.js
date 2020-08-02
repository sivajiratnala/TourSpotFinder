const mongoose=require("mongoose");
var campSchema=new mongoose.Schema({
	name:String,
	image:String,
	address:String,
	cost:String,
	amenities:String,
	description:String,
	date:{type:Date,default:Date.now},
	
	author:{
		    id :{
	        	type:mongoose.Schema.Types.ObjectId,
		    	ref:"User"
             	},  
		    username:String 
	        },
	comments:[
		{ 
			type:mongoose.Schema.Types.ObjectId,
			ref:"Comment"
        }
	]
	
	
});
module.exports =mongoose.model("Camp",campSchema);
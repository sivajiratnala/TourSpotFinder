const mongoose=require("mongoose");
var commentSchema=new mongoose.Schema({
	text:String,
	author:{
		    id :{
	        	type:mongoose.Schema.Types.ObjectId,
		    	ref:"User"
             	},  
		    username:String ,
		likes:Number,
		dislikes:Number
	        },
	rating:Number
});
module.exports=mongoose.model("Comment",commentSchema);
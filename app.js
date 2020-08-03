const express         =  require("express"),
	  app             =  express(),
      bodyparser      =  require("body-parser"),
	  methodOverride  =  require("method-override"),
	  passport        =  require("passport"),
	  localStratagy   =  require("passport-local"),
	  mongoose        =  require("mongoose");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);
app.use(require("express-session")({
	secret:"siva siva",
	resave:false,
	saveUninitialized:false
}));
 const  Comment         =  require("./models/comments"),
	  User            =  require("./models/user"),
      Camp            =  require("./models/campground");

mongoose.connect("mongodb+srv://sivaji:sivaji@cluster0.79aaw.mongodb.net/tourguide?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratagy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/*Camp.find({},function(err,campe){
	if(err) {console.log(err);}
	else {
		console.log(campe);}
});*/
//Camp.find({}).remove().exec();
//================================
// middlewares
//================================
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()) {return next(); }
	res.redirect("/login")
}
function isowner(req,res,next){
	if(req.isAuthenticated()) {
		Camp.findById(req.params.id,function(err,cmp){
			if(err) {res.redirect("back"); }
			else
				{
					if(cmp.author.id.equals(req.user._id))
						{
							next();
						}
					else {res.redirect("back");}
                }
		});
	}
}
function isownercmt(req,res,next){
	if(req.isAuthenticated()) {
		Comment.findById(req.params.id2,function(err,cmp){
			if(err) {res.redirect("back"); }
			else
				{
					if(cmp.author.id.equals(req.user._id))
						{
							next();
						}
					else {res.redirect("back");}
                }
		});
	}
}
//================================
//ROUTE FOR INDEX PAGE
//================================
app.get("/",isLoggedIn,function(req,res){
	
	Camp.find({},function(err,campe){
	if(err){console.log(err);}
	else { res.render("camp.ejs",{camps:campe,currentuser:req.user});}
});
	
});
//================================
//FORM PAGE TO ADD NEW CAMPGROUND
//================================
app.get("/campgrounds/new",isLoggedIn,function(req,res){
	res.render("newcamp.ejs",{currentuser:req.user});
});
//================================
//ROUTE FOR ADDING NEW COMMENT
//================================
app.post("/campground/:id/comment",isLoggedIn, function(req,res)
{
	Camp.findById(req.params.id,function(err,cmp)
	{
		if(err) {console.log(err);}
		else  
		{      
			   Comment.create(
				  { text:req.body.text,
				  author:
				  {
					  id:req.user._id,
					  username:req.user.username
				  },rating:req.body.rating
				  },function(err,comment)
				{
				   if(err){console.log(err);}
				   else 
				   {   cmp.comments.push(comment);
					    cmp.save();
			           res.redirect("/campgrounds/"+cmp._id);
				   }
			   });
			
		}	
	});
				  
});
//===============================================
//ROUTE FOR DISPLAYING CAMPGROUND IN FULL PAGE
//===============================================
app.get("/campgrounds/:id",isLoggedIn,function(req,res){
	Camp.findById(req.params.id).populate("comments").exec(function(err,campe){
		if(err){console.log(err); }
		else {res.render("shows.ejs",{campe:campe,currentuser:req.user}); }
	});
	
});
//===============================================
//ROUTE FOR DELETING CAMPGROUND 
//===============================================
app.delete("/campgrounds/:id",isowner,function(req,res){
	Camp.findByIdAndRemove(req.params.id,function(err){
		if(err) {console.log(err);}
		else {res.redirect("/")}
	});
});
//===============================================
//ROUTE FOR DELETING COMMENT
//===============================================
app.get("/campgrounds/:id1/comment/:id2",isownercmt,function(req,res){
	Comment.findByIdAndRemove(req.params.id2,function(err,cmt){
		if(err){console.log(err); }
		else {
			Camp.findById(req.params.id1).populate("comments").exec(function(err,campe){
				if(err) {console.log(err);}
				else {res.render("shows.ejs",{campe:campe,currentuser:req.user}); }
			});
		}
	});
});
//==================================
//ROUTE FOR ADDING NEW CAMPGROUND
//==================================
app.post("/campgrounds",isLoggedIn,function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var description=req.body.description;
	var ne ={
		name:name,
		image:image,
		description:description,
		author: {
			id:req.user._id,
			username:req.user.username
		},
		cost:req.body.cost,
		address:req.body.address,
		amenities:req.body.amenities
		}
	    Camp.create(ne,function(err,campe){
		    if(err){console.log(err)}
		    else {res.redirect("/");}
	    });
});
//==================================
//ROUTES FOR EDITING CAMPGROUND
//==================================
app.get("/campgrounds/:id/edit",isowner,function(req,res){
	 Camp.findById(req.params.id,function(err,campe){
		 if(err) {console.log(err);}
		 else {
			 res.render("editcamp.ejs",{campe:campe,cu:req.user});
		 }
	 });
	
});

app.put("/campgrounds/:id",function(req,res){
   Camp.findByIdAndUpdate(req.params.id,req.body.camp,function(err,campee){
   if(err){ res.redirect("/"); }
	   else { res.redirect("/campgrounds/"+campee._id); }
   })
});
//========================================
//ROUTES FOR SIGNUP AND LOGIN AND LOGOUT
//=========================================
app.get("/register",function(req,res){
	res.render("register.ejs");
});
app.get("/login",function(req,res){
	res.render("login.ejs");
});
app.post("/register",function(req,res){
	var newUser=new User({ username:req.body.username });
	User.register(newUser,req.body.password,function(err,user){
		if(err) {console.log(err); return res.render("register2.ejs");}
		passport.authenticate("local")(req,res,function(){
		res.redirect("/login");							  
	});
	});	
});
app.post("/login",passport.authenticate("local",{
	successRedirect: "/",
	failureRedirect: "/login"
}),function(err,sdf){
 if(err) {console.log(err);}	
});

app.get("/logout",isLoggedIn,function(req,res){
 req.logout(); res.redirect("/login");
});
//================================================
var port = process.env.PORT || 3000;
app.listen(port, function () {  
  console.log("Server Has Started!");
});
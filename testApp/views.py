# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
from django.shortcuts import render
from .models import Module
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.db.models import Max
from django.contrib.auth.decorators import permission_required,login_required

# Create your views here.
from django.http import HttpResponse
from django.http import HttpResponseRedirect

#from testApp.models import User
from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect
from testApp.forms import SignUpForm
from testApp.forms import SaveModuleForm
from testApp.models import Module
from testApp.models import Model
from testApp.models import Products
from testApp.models import Substrates
from testApp.forms import addReactantForm
from testApp.forms import *

#This is the user id for the user that is associated with all public pathways
#Change this if you create a different user or user ID's change
public_pathway_user_id = 59

@login_required(login_url='/accounts/login/')
def modelChoice(request):
	context = {}
	return render(request, 'modelChoice.html', context=context)

@login_required(login_url='/accounts/login/')
def moduleEdit(request, model, module, xCoor, yCoor, isPositive):
	if(isPositive == 0):
		xCoor = 0 - xCoor
	myMod = Module.objects.all().filter(pk = module, modelID_id = model)
	mySubs = Substrates.objects.all().filter(moduleID_id__exact = module, modelID = model)
	myProds = Products.objects.all().filter(moduleID_id__exact = module, modelID = model)
	myModel = Model.objects.filter(pk = model)

	for value in myModel:
		currentModelName = value.modelName
		result = value.public
		modelID = value.id

	publicModel = Model.objects.filter(modelName = currentModelName, public = True)
	for models in publicModel:
		publicModelID = models.id

	isPublic = result

	if(result):
		allmodules = Module.objects.all().filter(modelID_id__exact = model).values('enzyme', 'enzymeAbbr', 'reversible', 'id', 'xCoor', 'yCoor')
		allsubs = Substrates.objects.prefetch_related('moduleID').filter(modelID = model)
		allprods = Products.objects.prefetch_related('moduleID').filter(modelID = model)

		listOfSubs = []
		listOfProds = []

		for value in allsubs:
			currentSubDict = {"substrate": value.substrate, "enzyme": value.moduleID.enzyme, "abbr": value.abbr}
			listOfSubs.append(currentSubDict)

		for value in allprods:
			currentProdDict = {"product": value.product, "enzyme": value.moduleID.enzyme, "abbr": value.abbr}
			listOfProds.append(currentProdDict)
	else:
		publicModel = Model.objects.all().filter(modelName = currentModelName, public = True)
		for mod in publicModel:
			publicMod = mod

		allmodules = Module.objects.all().filter(modelID_id__exact = publicMod.id).values('enzyme', 'enzymeAbbr', 'reversible', 'id', 'xCoor', 'yCoor')
		allsubs = Substrates.objects.select_related('moduleID').filter(modelID = publicMod.id)
		allprods = Products.objects.select_related('moduleID').filter(modelID = publicMod.id)

		listOfSubs = []
		listOfProds = []

		for value in allsubs:
			currentSubDict = {"substrate": value.substrate, "enzyme": value.moduleID.enzyme, "abbr": value.abbr}
			listOfSubs.append(currentSubDict)

		for value in allprods:
			currentProdDict = {"product": value.product, "enzyme": value.moduleID.enzyme, "abbr": value.abbr}
			listOfProds.append(currentProdDict)

	if request.method == 'POST':

		new_enzyme = request.POST.get("Enzyme")
		# The database cannot have strings with spaces, replace spaces with underscores
		new_enzyme = new_enzyme.replace(" ", "_")
		new_reversible = request.POST.get("reversibleChoice")

		myModel = Model.objects.filter(pk = model)

		for value in myModel:
			currentModelName = value.modelName
			result = value.public

		modelData = Model.objects.filter(modelName = currentModelName, public = True)

		for mod in modelData:
			publicMod = mod

		moduleData = Module.objects.filter(modelID_id__exact = publicMod.id, enzyme=new_enzyme, reversible = new_reversible)

		for mods in moduleData:
			correctModule = mods

		substratesData = Substrates.objects.filter(modelID = publicMod.id, moduleID_id = correctModule.id).values()
		productsData = Products.objects.filter(modelID = publicMod.id, moduleID_id = correctModule.id).values()

		ProdAbbrsList = {}
		SubAbbrsList = {}

		for sub in substratesData:
			subAbbr = sub
			# SubAbbrsList.append({"abbr"+subAbbr.get('substrate') : subAbbr.get('abbr')})
			SubAbbrsList['abbr'+subAbbr.get('substrate')] = subAbbr.get('abbr')
		for prod in productsData:
			prodAbbr = prod
			# ProdAbbrsList.append({"abbr"+prodAbbr.get('product') : prodAbbr.get('abbr')})
			ProdAbbrsList['abbr'+prodAbbr.get('product')] = prodAbbr.get('abbr')

		post = Module(modelID_id=model, enzyme=new_enzyme, reversible=new_reversible, enzymeAbbr=correctModule.enzymeAbbr, xCoor=correctModule.xCoor, yCoor=correctModule.yCoor, enzWeight=correctModule.enzWeight, deltaG=correctModule.deltaG, deltaGNaughtPrime=correctModule.deltaGNaughtPrime)
		post.save()
		nextModule = post.id
		for key, values in request.POST.lists():
			if (key == "Product"):
				for i in range(len(values)):
					values[i] = values[i].replace(" ", "_")
					prods = Products(moduleID_id=nextModule, product=values[i], abbr=ProdAbbrsList.get('abbr'+values[i]), modelID = model)
					prods.save()
			if (key == "Substrate"):
				for i in range(len(values)):
					values[i] = values[i].replace(" ", "_")
					subs = Substrates(moduleID_id=nextModule, substrate=values[i], abbr=SubAbbrsList.get('abbr'+values[i]), modelID = model)
					subs.save()

		return HttpResponseRedirect("/testApp/modelEdit/" + str(model))
	else:
		context = {'form': SaveModuleForm,
				   'modules' : myMod,
				   'substrates' : mySubs,
				   'products' : myProds,
				   'allmodules' : allmodules,
				   'allprods' : listOfProds,
				   'allsubs' : listOfSubs,
				   'isPublic' : isPublic,
				   'modelID' : modelID,
				   'moduleID' : module,
				   'xCoor' : xCoor,
				   'yCoor' : yCoor
				  }
		return render(request, 'moduleEdit.html', context=context)

@login_required(login_url='/accounts/login/')
def modelEdit(request, model):
	if request.method == 'POST':
		isPublic = Model.objects.all().filter(pk = model)
		for pub in isPublic:
			isPub = pub.public
		if(not isPub):
			deletedProducts = Products.objects.all().filter(modelID = model).delete()
			deletedSubstrates = Substrates.objects.all().filter(modelID = model).delete()
			deletedModules = Module.objects.all().filter(modelID_id__exact = model).delete()
	myModel = Model.objects.all().filter(pk = model)
	for models in myModel:
		modelName = models.modelName
	publicModel = Model.objects.all().filter(modelName = modelName, public = True)
	for models in publicModel:
		publicModelId = models.id

	myModules = Module.objects.all().filter(modelID_id = model)
	publicModules = Module.objects.all().filter(modelID_id = publicModelId)

	# Start if else statements to get next x and y coordinate
	if (not myModules):
		xCoor = 0
		yCoor = 1
	else :
		currentMaxY = 0
		# check to see if the max y has 1 or 2 occurrences
		countY = 0
		for module in myModules:
			if (module.yCoor > currentMaxY):
				currentMaxY = module.yCoor
				countY = 1
			elif (module.yCoor == currentMaxY):
				countY = countY + 1

		if (countY < 2):
			countY = 0
			xValues = []
			# the next module could be the second module in a split
			# check if currentMaxY is in the public modules more than once
			for modules in publicModules:
				if modules.yCoor == currentMaxY:
					countY = countY + 1
					xValues.append(modules.xCoor)
			if(countY > 1):
				yCoor = currentMaxY
				currentMaxX = 0
				for xVal in xValues:
					if(xVal > currentMaxX):
						currentMaxX = xVal
				xCoor = currentMaxX
			else:
				# the next module has a y value of currentMaxY + 1
				# the module could still be part of a split, grab x values associated with currentMaxY + 1, take min x
				xValues = []
				# set currentMinX to greatest possible x value + 1
				currentMinX = 2
				for modules in publicModules:
					if(modules.yCoor == currentMaxY + 1):
						xValues.append(modules.xCoor)
				for xVal in xValues:
					if(xVal < currentMinX):
						currentMinX = xVal
				xCoor = currentMinX
				yCoor = currentMaxY + 1
		else:
			# the next module is not part of a split, because a split just occurred
			# grab the x associated with y+1
			xValues = []
			# set currentMinX to greatest possible x value + 1
			currentMinX = 2
			for modules in publicModules:
				if(modules.yCoor == currentMaxY + 1):
					xValues.append(modules.xCoor)
			for xVal in xValues:
				if(xVal < currentMinX):
					currentMinX = xVal
			xCoor = currentMinX
			yCoor = currentMaxY + 1
	# End if else statements to get next x and y coordinate

	pubModel = -1
	for obj in myModel:
		pubModel = obj.public
	mod = myModules
	list_of_mods = []
	for obj in mod:
		mod_dict = {"id": obj.id, "modelID_id": obj.modelID_id, "enzyme": obj.enzyme, \
			"reversible": obj.reversible, "enzymeAbbr": obj.enzymeAbbr, "xCoor": obj.xCoor, \
			"yCoor": obj.yCoor, "enzWeight": obj.enzWeight, "deltaG": obj.deltaG, \
			"deltaGNaughtPrime": obj.deltaGNaughtPrime}
		list_of_mods.append(mod_dict)
	subs = Substrates.objects.all().filter(modelID = model)
	list_of_subs = []
	for obj in subs:
		sub_dict = {"id": obj.id, "substrate": obj.substrate, "moduleID_id": obj.moduleID_id, \
			"abbr": obj.abbr}
		list_of_subs.append(sub_dict)
	prods = Products.objects.all().filter(modelID = model)
	list_of_prods = []
	for obj in prods:
		prod_dict = {"id": obj.id, "product": obj.product, "moduleID_id": obj.moduleID_id, \
			"abbr": obj.abbr}
		list_of_prods.append(prod_dict)
	context = { 'modules': list_of_mods, 'substrates': list_of_subs, 'products': list_of_prods,
		'model_num':model, 'xCoorNext':xCoor, 'yCoorNext':yCoor, 'pubModel':pubModel }
	return render(request, 'modelEdit.html', context=context)

def home(request):
	context = {}
	return render(request, 'home.html', context=context)

def register(request):
	if request.method == 'POST':
		form = SignUpForm(request.POST)
		if form.is_valid():
			# create new rows in model table for each public model
			form.save()
			username = form.cleaned_data.get('username')
			raw_password = form.cleaned_data.get('password1')
			user = authenticate(username=username, password=raw_password)
			auth_login(request, user)

			publicModels = Model.objects.filter(public__exact = True).values()
			for model in publicModels:
				modelName = model.get("modelName")
				post = Model(modelName=modelName, userID_id=user.id, public=False)
				post.save()
			return redirect('modelChoice')
	else:
		form = SignUpForm()
	return render(request, 'registration/signup.html', {'form': form})

def login(request):
	context = {}
	print("Login*******")

	return render(request, 'load.html', context=context)

def signup(request):
	context = {}

	return render(request, 'accounts/signup.html', context=context)

def indexLogged(request):
	context = {}
	print("Login*****")
	return render(request, 'indexLogged.html', context=context)

def logout_view(request):
	context = {}
	logout(request)
	return render(request, 'home.html', context=context)

def passwordResetDone(request):
	return render(request, 'password_reset_complete.html')

@permission_required('catalog.add_model')
def edit_model(request, modelNameToEdit):
	print('modelName is ' + modelNameToEdit)
	# Get list of substrates/enzymes/products from django Model (in models.py)
	allsubs = Substrates.objects.all()
	allprods = Products.objects.all()
	allenzys = Module.objects.all()
	allpaths = Model.objects.all()

	list_of_subs = []
	list_of_prods = []
	list_of_enzys = []
	list_of_paths = []
	#add each substrate to the list
	for sub in allsubs:
		currentSub = {"substrate": sub.substrate, "abbr": sub.abbr}
		list_of_subs.append(currentSub)

	#add each ezymes to the list
	for enzy in allenzys:
		currentEnzy = {"enzyme": enzy.enzyme, "enzymeAbbr": enzy.enzymeAbbr}
		list_of_enzys.append(currentEnzy)

	#add each products to the list
	for prod in allprods:
		currentProd = {"product": prod.product, "abbr": prod.abbr}
		list_of_prods.append(currentProd)

	#for each pathway append it unless it has the same name
	#This is for the error checking function in addModel.js
	for path in allpaths:
		currentPath = {"modelName": path.modelName}
		if(currentPath != modelNameToEdit):
			list_of_paths.append(currentPath)

	#dictionary to store the information needed about reactions in 
	#the pathway
	modelToEdit = {'name': modelNameToEdit}

	#get the number of reactions for the model
	databaseModel = Model.objects.all().filter(modelName = modelNameToEdit, public = True)
	idOfModel = list(databaseModel.values('id')) # get model id
	
	#Model is same as Pathway here. Module is same as Reaction.
	#get all of the modules associated with the specific model.
	modulesOfModel = Module.objects.all().filter(modelID_id__exact = idOfModel[0]["id"])

	reactionsList = list(modulesOfModel.values('id', 'enzyme', 'reversible','enzymeAbbr'))

	listOfReactions = []
	#for each reaction in reactionsList
	for react in reactionsList:
		subs = []
		prods = []
		reactionDict ={}
		
		reactID = react["id"]

		substratesOfModule = Substrates.objects.all().filter(moduleID_id__exact = reactID)
		substrateList = list(substratesOfModule.values('substrate', 'abbr'))
		print(substrateList)

		productsOfModule = Products.objects.all().filter(moduleID_id__exact = reactID)
		productList = list(productsOfModule.values('product', 'abbr'))

		#add the data to the dictionary
		reactionDict["enzyme"] = [react["enzyme"], react["enzymeAbbr"]]
		list_of_sub_arrays = []
		for substrate in substrateList:
			list_of_sub_arrays.append([substrate['substrate'], substrate['abbr']])
		list_of_prod_arrays = []
		for product in productList:
			list_of_prod_arrays.append([product['product'], product['abbr']])
		reactionDict["substrates"] = list_of_sub_arrays
		reactionDict["products"] = list_of_prod_arrays
		reactionDict["reversible"] = react["reversible"]
		listOfReactions.append(reactionDict)

	modelToEdit['Reactions'] = listOfReactions


	#pass the database information to the frontend?
	context = {'modeltoedit': modelToEdit, 'allsubs': list_of_subs, 'allenzys': list_of_enzys, 'allprods': list_of_prods, 'allpaths': list_of_paths}
	if(request.method == 'POST'):
		#print(request.POST['pathwayData'])
		reactions = json.loads(request.POST['pathwayData'])
		name = request.POST['model_name_input']
		number_of_reactions = int(request.POST['number_reactions_input'])

		print(reactions)
		#delete old database entry for this model and create a new one
		deleteEditedModel(modelNameToEdit)
		writeModelToDatabase(name, number_of_reactions, reactions, request)
		return redirect('modelChoice')
	return render(request, 'addModel.html', context = context)

# Pages for adding reactions, models, reactants (For admins only)
@permission_required('catalog.add_model')
def add_model(request, modelName=''):
	# Get list of substrates/enzymes/products from django Model (in models.py)
	allsubs = Substrates.objects.all()
	allprods = Products.objects.all()
	allenzys = Module.objects.all()
	allpaths = Model.objects.all()

	list_of_subs = []
	list_of_prods = []
	list_of_enzys = []
	list_of_paths = []
	#add each substrate to the list
	for sub in allsubs:
		currentSub = {"substrate": sub.substrate, "abbr": sub.abbr}
		list_of_subs.append(currentSub)

	#add each ezymes to the list
	for enzy in allenzys:
		currentEnzy = {"enzyme": enzy.enzyme, "enzymeAbbr": enzy.enzymeAbbr}
		list_of_enzys.append(currentEnzy)

	#add each products to the list
	for prod in allprods:
		currentProd = {"product": prod.product, "abbr": prod.abbr}
		list_of_prods.append(currentProd)

	#add each pathway to the list
	for path in allpaths:
		currentPath = {"modelName": path.modelName}
		list_of_paths.append(currentPath)

	#pass the database information to the frontend?
	context = {'allsubs': list_of_subs, 'allenzys': list_of_enzys, 'allprods': list_of_prods, 'allpaths': list_of_paths}
	if(request.method == 'POST'):
		#print(request.POST['pathwayData'])
		reactions = json.loads(request.POST['pathwayData'])
		name = request.POST['model_name_input']
		number_of_reactions = int(request.POST['number_reactions_input'])

		print(reactions)
		writeModelToDatabase(name, number_of_reactions, reactions, request)
		return redirect('modelChoice')
	return render(request, 'addModel.html', context = context)

'''
This method deletes a model from the database after the instructor edits it
so that there is not a duplicate model after the new one is added in
'''
def deleteEditedModel(modelNameToDelete):
	Model.objects.all().filter(modelName = modelNameToDelete).delete()
	pass

def writeModelToDatabase(name, number_of_reactions, reactions, request):
	#add to testApp_model table in database
	# user.id holds user id, use this to query for all models of user
	user = User.objects.get(id=public_pathway_user_id)
	modelToAdd = Model()
	modelToAdd.userID = user #TODO:CHANGE LATER
	modelToAdd.modelName = name
	modelToAdd.public = 1 #we want all of these to be public

	modelToAdd.save()

	#get the model that was just added - we need it's id
	currentModel = Model.objects.all().filter(userID_id__exact = user, modelName__exact = name, public__exact = 1)
	currentModel_id = currentModel[0]

	#opperating under assumption that pathway does not branch
	for i in range(0, number_of_reactions):
		#add module/reaction to model/pathway
		moduleToAdd = Module()
		moduleToAdd.modelID = currentModel_id
		moduleToAdd.enzyme = reactions[i]["enzyme"][0]
		moduleToAdd.enzymeAbbr = reactions[i]["enzyme"][1]
		moduleToAdd.reversible = reactions[i]["reversible"]
		xCoorToAdd = 0
		moduleToAdd.xCoor = xCoorToAdd
		yCoorToAdd = i + 1
		moduleToAdd.yCoor = yCoorToAdd
		
		#We don't know what the below 3 do...
		moduleToAdd.enzWeight = 1
		moduleToAdd.deltaG = 1.0
		moduleToAdd.deltaGNaughtPrime = 1.0

		#save the module to the database
		moduleToAdd.save()

		#get the module's id
		currentModule = Module.objects.all().filter(modelID__exact = currentModel_id, xCoor__exact = xCoorToAdd, yCoor__exact = yCoorToAdd)
		currentModule_id = currentModule[0]
		
		#add substrate(s) & product(s) to DB
		#for each product per current reaction i
		for j in range(0, len(reactions[i]["substrates"])):
			substrateToAdd = Substrates()
			substrateToAdd.moduleID = currentModule_id
			#reactions[i][substrates][j][0] means for current reaction i 
			#get current substate j's name at 0 location
			substrateToAdd.substrate = reactions[i]["substrates"][j][0]
			substrateToAdd.abbr = reactions[i]["substrates"][j][1]
			substrateToAdd.modelID = currentModel_id.id
			substrateToAdd.save()

		for j in range(0, len(reactions[i]["products"])):
			productToAdd = Products()
			productToAdd.moduleID = currentModule_id
			#reactions[i][products][j][0] means for current reaction i 
			#get current product j's name at 0 location
			productToAdd.product = reactions[i]["products"][j][0]
			productToAdd.abbr = reactions[i]["products"][j][1]
			productToAdd.modelID = currentModel_id.id
			productToAdd.save()

#This is the funtion for admin Editting Model
@permission_required('catalog.add_model')
def adminEditModel(request):
	if (request.method == "POST"):
		#Get all the model IDs to edit
		modelName = request.POST["Model"]
		return redirect('edit_model', modelNameToEdit=modelName)
	else:
		modelList = []
		allTeacherModels = Model.objects.filter(public = True)
		for model in allTeacherModels:
			modelList.append({"modelName": model.modelName, "id":model.id})
		context = {"modelList" : modelList}
		return render(request,'adminEditModel.html', context=context)

#This is the funtion for adminDelete
@permission_required('catalog.add_model')
def adminDeleteUser(request):
	'''
	Collects user information from the database such
	as usernames and last logged in data.
	'''
	#If this method is called with post as the request method,
	#An admin has selected users to delete
	if (request.method == "POST"):
		#Get a list of all user IDs to be deleted
		users = request.POST.getlist("User")
		#Boolean to see if the current user is deleting themselves
		curUserDeleted = False
		#Delete all selected users
		for userID in users :
			userPublicModels = Model.objects.filter(userID_id = userID, public__exact = True)
			for userPubMod in userPublicModels:
				userPubMod.userID = User.objects.get(id=public_pathway_user_id)
				userPubMod.save()
			
			userModels = Model.objects.filter(userID_id = userID, public__exact = False).delete()
			User.objects.get(id = userID).delete()
			if userID == str(request.user.id):
				curUserDeleted = True

		#If the current user deleted themselves, kick the app back to the main page
		if curUserDeleted:
			return redirect('home')
		else:
			return redirect('modelChoice')
	# Otherwise the method is called when the page is loaded
	# Get the users and put them into a list to be used by the page
	else:
		userList = []
		allUsers = User.objects.all().filter(is_staff = False, is_superuser = False)
		for user in allUsers:
			userList.append({"username": user.username, "id": user.id, "last_login": user.last_login})
		sortedUsers = sorted(userList, key=lambda item:item["username"])
		context = {"users" : userList}
		return render(request, 'adminDeleteUser.html', context = context)

@permission_required('catalog.add_model')
def adminDeleteModel(request):
	'''
	This function is called when the delete model page is loaded or
	an admin selects models to be deleted.
	It will delete all public and private instances of a given teacher model
	'''
	if (request.method == "POST"):
		#Get all the model IDs to be deleted
		models = request.POST.getlist("Model")
		for modelId in models:
			#Get the specific teacher model to be deleted
			teacherModel = Model.objects.filter(id = modelId)
			#Get the model name (You need the [] because the result is a query set)
			teacherModelName = teacherModel[0].modelName
			#Find all pathways that have the same name and delete them
			Model.objects.all().filter(modelName = teacherModelName).delete()
			#Delete the teacher model
			teacherModel.delete()
		#Go back to the main page
		return redirect('modelChoice')
	else:
		#Initialize an empty list to hold all the teacher models and find
		#all public models
		modelList = []
		allTeacherModels = Model.objects.filter(public = True)
		#Go through all the public models and extract the name and id
		for model in allTeacherModels:
			modelList.append({"modelName": model.modelName, "id":model.id})
		#Put the list of names and IDs into the pages context and load the page
		context = {"modelList" : modelList}
		return render(request,'adminDeleteModel.html', context=context)	

def loadPathwayModels(request):
	'''
	Helper function that grabs pathway models for students and 
	teachers from the database. Stores those models in the context
	dictionary. 
	
	'models' key has the private models for that user.
	'publicModels' contains the public models.
	'''
	# need to add a pop-up/redirect to allow the user to create a new model
	# using a form so that we can add a new row to the model table
	user = request.user
	# user.id holds user id, use this to query for all models of user
	privateModelsList = []
	publicModelsList = []

	#Get all the private models for the user and the public models
	privateModels = Model.objects.all().filter(userID_id__exact = user.id, public__exact = False)
	publicModels = Model.objects.all().filter(public__exact = True)

	#Go through all the public models
	for model in publicModels:
		pubModelDict = {"modelName":model.modelName, "id": model.id}
		publicModelsList.append(pubModelDict)
		#See if the user has a private version of the public model
		privateVersion = Model.objects.all().filter(userID_id__exact = user.id, modelName = model.modelName, public__exact = False)
		#If they don't, create a new private version for them
		if not privateVersion:
			newPrivateModel = Model(modelName=model.modelName, userID_id=user.id, public=False)
			newPrivateModel.save()

	#Go through the private models
	for model in privateModels:
		modelDict = {"modelName":model.modelName, "id": model.id}
		privateModelsList.append(modelDict)

	#Create the new context for Django to load the model lists from
	context = {
		'userID': user.id,
		'privateModels': privateModelsList,
		'publicModels' : publicModelsList
	}
	if(request.method == 'POST'):
		pass
	return context

@login_required(login_url='/accounts/login/')
def studentModels(request):
	'''
	Calls loadPathwayModels() and passes along the
	student models to the site.
	'''
	pathways = loadPathwayModels(request)
	context = dict((p, pathways[p]) for p in ['userID', 'privateModels'] 
                                        if p in pathways)
	# print(context)									
	if(request.method == 'POST'):
		pass
	#Load modelChoice.html with the new context
	return render(request, 'studentModels.html', context=context)

@login_required(login_url='/accounts/login/')
def teacherModels(request):
	'''
	Calls loadPathwayModels() and passes along the
	teacher models to the site.
	'''
	pathways = loadPathwayModels(request)
	context = dict((p, pathways[p]) for p in ['userID', 'publicModels'] 
                                        if p in pathways)
	if(request.method == 'POST'):
		pass
	#Load modelChoice.html with the new context
	return render(request, 'teacherModels.html', context=context)

@permission_required('catalog.add_model')
def adminTools(request):
	'''
	Renders page that displays the admin tools.
	'''
	context = {}
	return render(request, 'adminTools.html', context=context)
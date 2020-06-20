# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models


class Model(models.Model):
	userID = models.ForeignKey(User, on_delete=models.CASCADE)
	modelName = models.CharField(max_length = 200 )
	public = models.BooleanField(default=False)

	def __str__(self):
		return str(self.id) + " " + str(self.userID_id) + " " + str(self.modelName)

class Module(models.Model):
	modelID = models.ForeignKey(Model, on_delete=models.CASCADE)
	enzyme = models.CharField(max_length = 200 )
	enzymeAbbr = models.CharField(max_length = 8, default="ENZYME")
	reversible = models.CharField(max_length = 200 )
	xCoor = models.IntegerField(default=0)
	yCoor = models.IntegerField(default=0)
	enzWeight = models.IntegerField(default=1)
	deltaG = models.FloatField(default=-1.0)
	deltaGNaughtPrime = models.FloatField(default=1.0)

	def __str__(self):
		return_val = str(id) + str(self.modelID) + str(self.enzyme) + str(self.enzymeAbbr) + str(self.reversible) + str(self.xCoor) + str(self.yCoor) + str(self.enzWeight)
		return return_val

class Products(models.Model):
	moduleID = models.ForeignKey(Module, on_delete=models.CASCADE)
	product = models.CharField(max_length = 200)
	abbr = models.CharField(max_length = 8, default="PROD")
	modelID = models.IntegerField(default=1)

	def __str__(self):
		return str(id) + str(self.moduleID) + str(self.product) + str(self.abbr)

class Substrates(models.Model):
	moduleID = models.ForeignKey(Module, on_delete=models.CASCADE)
	substrate = models.CharField(max_length = 200)
	abbr = models.CharField(max_length = 8, default="SUB")
	modelID = models.IntegerField(default=1)

	def __str__(self):
		return str(id) + str(self.moduleID) + str(self.substrate) + str(self.abbr)

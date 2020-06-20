from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    last_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2', )

class SaveModuleForm(forms.Form):
    modelId = forms.IntegerField()
    moduleId = forms.IntegerField()
    enzyme = forms.CharField(max_length=200)
    reversible = forms.CharField(max_length=200)
    modelName = forms.CharField(max_length=200)
    # products and substrates are preferably in lists

class addReactantForm(forms.Form):
    name = forms.CharField(max_length=200)
    abbreviation = forms.CharField(max_length=200)
    
#add form for the addModel.html page
class addModelForm(forms.Form):
    name_of_pathway = forms.CharField(max_length=200)
    number_of_reactions = forms.IntegerField()


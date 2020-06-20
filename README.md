# BioPath: Tool For Learning BioChemistry

BioPath is a web application with the purpose of serving as a tool to teach students about biochemistry. The current iteration of BioPath includes animations depicting chemical pathways inside the body and how the various elements inside those pathways interact with each other.

## Documentation

We created a [wiki](https://github.com/zmckee2/BioPath_SeniorDesign/wiki) page containing documentation for this web application.
More detailed documentation can be found in the guide we provided (it's like a 60+ page pdf doc).

### Required

* Python3
* Pip3
* Git
* MySQL
* Django
* [WSL (Windows only)](https://docs.microsoft.com/en-us/windows/wsl/install-win10)

### Application Made With

* Python3
* JavaScript
* CSS
* HTML

#### Setup your environment with Conda

1. Install [Anaconda](https://www.anaconda.com/) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
    * Miniconda is smaller version of Anaconda so I recommend installing that.
    * Either version of Conda that you choose already contains Python and pip so you don't need to worry about installing those.
2. Once you have installed Conda, go to your terminal/console and let's create an environment called "biopath":
```
conda create --name biopath
```

3. Now we'll need to switch to that environment. By default, Conda will put you in the default "base" environment:
```
conda activate biopath
```

4. Clone our [respository](https://github.com/jgo28/BioPath.git):
```
git clone https://github.com/jgo28/BioPath.git
```

5. Let's install the required components. Navigate to the directory in your downloaded repo where `requirements.txt` is and run:
```
pip3 install -r requirements.txt
```

6. Jason helped us set up the Gonzaga server for us to host our BioPath application. You will need to contact him to relaunch the one we were working on. The database should also be on this server. 

    * As long as you're on campus wifi, you should be able to run and access the server. If you want to run the website on your computer, as long as you're on campus wifi and the server with the database is running, it should be able to run.

7. Before running the server, check if you have the required packages by running the follwing command in your terminal:
```
python3 manage.py check
```

8. If it works, the terminal will output:
 ```
 System check identified no issues (0 silenced).
 ```

* Failure to pass this check means that pip, python, or Django may be the wrong version.

7. Once no issues have been detected, run:
```
python3 manage.py runserver
```

8. An IP address should appear. Click on that IP address to interact with the website.
```
ex. http://147.222.165.81:8080/
```

If you want to host the website locally on your computer, you'll need to [install MySQL](https://github.com/zmckee2/BioPath_SeniorDesign/wiki/Installing-MySQL) and [follow this guide](https://github.com/zmckee2/BioPath_SeniorDesign/wiki/Creating-a-backup-and-recovering-the-database#copying-the-database-locally).

## Possible Errors

1. When we first tried to install the repository, we this error:  
    `mysqlclient 1.3.13 or newer is required; you have 0.9.3`   
     
    * We solved this by going back to a previous version of Django:  `pip install Django==2.1.7`
    * Another solution can be found [here](https://stackoverflow.com/questions/55657752/django-installing-mysqlclient-error-mysqlclient-1-3-13-or-newer-is-required) which involves going through files of a Python library and modifying a piece of code.

2. If `python3` or `pip3` doesn't work for Conda, use `python` or `pip`. You can also check the version of Python running by just entering `python` or `python3` into the terminal.

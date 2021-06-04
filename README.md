# OnlineEstimator

# Steps to install Node.js project

 - git clone "Git link"
 - cd "project path"
 - npm install 
 - npm start

# Command to run the application

- cd "project path"
- npm start

# Steps to push changes to git repository

- Save your changes and open git gui.
- Open your project and review your changes, if changes are not visible "Rescan" or save your file and "Rescan".
- Add all the files you want to push by clicking on the file icon to the left of the file name.
- Open Command prompt
- cd "project path"
- git status
- git commit -m "your message"
- git push

# Steps to pull changes from repository (This is only applicable if your local files are behind your repository)

- open command promt
- cd "project path"
- git pull

# Steps to upload data dump

- Save all changes to file - model.xlsm
- uncomment "UploadFreshData" function 
- comment out any and all code specific to collection that you dont want to change. 
- run the app.
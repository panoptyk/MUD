# Multi-User Dungeon example
living MUD game based off the Panoptyk Engine

## Setting up your local dev environment
Upon cloning this repository, there are a few steps you need to take to begin developing locally. You must be on a unix shell for everything to work. 

Run the following commands from the main repo directory: 
```
npm install
npm run deploy <directory_for_server>
```

```npm run build``` can be used to test if the client & server compile right

```npm run deploy:only <directory_for_server>``` skips the build step, using whatever has already been built in the `dist` & `lib` folders

**Do NOT commit the deployed server files. It's recommended to set the target directory for deploy outside the repositories main directory**

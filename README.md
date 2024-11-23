# السلام عليكم

## For running this application using an individual container

#### Clone the git repository first

```
$ git clone https://github.com/amruali/order-script.git
$ cd order-script
```

### Make sure to start your local Redis instance 

``` 
$ redis-server --bind 0.0.0.0 --protected-mode no
```

### Create your .env file with connection string of your Mongo Database included

### Sample .env file

```
MONGO_DB_URI=mongodb+srv://username:password@hostname
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
```

### Ensure the docker service is running then run the following commands in order

``` 

$ docker build -t orderscript .

$ docker run -p 3000:3000 --env-file .env orderscript
 
```

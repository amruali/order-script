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


## Models

### Item Model

```
@Schema()
export class Item extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true, unique: true })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ default: true })
    isActive: boolean;
}
```


### Order Model


```

@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({
        type: String,
        required: true
    })
    customerName: string;

    @Prop({
        type: [{
            item: { type: Types.ObjectId, ref: 'Item', required: true },
            quantity: { type: Number, required: true, min: 1 },
        }],
        required: true,
        _id: false, // Disable automatic _id creation for the items array
    })
    items: { item: Types.ObjectId; quantity: number }[];

    @Prop({ required: true })
    totalAmount: number;
}

```


## Requests  

### Add Item

```

curl --location 'http://localhost:3000/items' \
--header 'Content-Type: application/json' \
--data '{
    "name": "وجبة فرخة مشوية عالفحم",
    "description": "وجبة فرخة مشوية عالفحم تقدم مع الأرز والطحينة و السلطة",
    "price": 400,
    "isActive": true
}'

```

### Add Order

```
## Request

$ curl --location 'http://localhost:3000/orders' \
  --header 'Content-Type: application/json' \
  --data '{
      "customerName": "Hussein",
      "items": [
          {
              "itemId": "67408874bb5763691de5822e",
              "quantity": 1
          }
      ]
  }'
```

## Result

```
{
    "customerName": "Hussein",
    "items": [
        {
            "item": "67408874bb5763691de5822e",
            "quantity": 1
        }
    ],
    "totalAmount": 400,
    "_id": "6741e93817cc3e8b59a96309",
    "createdAt": "2024-11-23T14:39:52.552Z",
    "updatedAt": "2024-11-23T14:39:52.552Z",
    "__v": 0
}

```


### Update Order

```
curl --location --request PUT 'http://localhost:3000/orders/6740ade0705941e0506f30b7' \
--header 'Content-Type: application/json' \
--data '{
    "customerName": "Amr Ali",
    "items": [
        {
            "itemId": "67408646bb5763691de5822e",
            "quantity": 1
        }
    ]
}'
```


### Daily sales Report using mongo aggregation framework and redis for caching generated reports by endpoint hit


```

$ curl localhost:3000/orders/daily-report

```

## For Specific Day

```
$ curl localhost:3000/orders/daily-report?date=20-11-2024
```

## Result
```
{
  "totalRevenue": 2400,
  "totalOrders": 6,
  "topSellingItems": [
    {
      "itemId": "67408874bb5763691de5822e",
      "name": "وجبة فرخة مشوية عالفحم",
      "quantitySold": 6,
      "totalSales": 2400
    }
  ]
}
```




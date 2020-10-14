import express from "express";
import mung from "express-mung";
import bodyParser from "body-parser";
import redis from "redis";

const app = express();
const redisClient = redis.createClient();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// redis library does not support Promise build-in now (maybe v4) so we use callback "function (err, reply) { }"
/*
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);

const value = await getAsync("key");
*/

// alternative npm i ioredis

app.use(async (req, res, next) => {
  const cacheKey = `${req.path}|${JSON.stringify(req.body)}`;
  redisClient.get(cacheKey, (err, cacheValue) => {
    if (cacheValue) {
      res.json(JSON.parse(cacheValue));
    } else {
      req.myCacheKey = cacheKey;
      next();
    }
  });
});

app.use(
  mung.json((body, req, res) => {
    redisClient.set(req.myCacheKey, JSON.stringify(body));
    redisClient.expire(req.myCacheKey, 5); //TTL seconds
  })
);

app.all("/dummyendpoint/:id", (req, res) => {
  setTimeout(() => {
    res.json({ id: req.params.id, name: "alikadir" });
  }, 3000);
});

app.listen(1453, () => {
  console.log("Server running at http://localhost:1453");
});
